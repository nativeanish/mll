import useWallet from "@/store/useWallet";
import arweave_client from "../arweave";
import { encrypt as metamaskEncrypt } from "@metamask/eth-sig-util";

type ArweaveHybridPayload = {
  scheme: "rsa-oaep-256+aes-gcm";
  encryptedKey: string;
  iv: string;
  cipher: string;
};

type MetaMaskFallbackPayload = {
  scheme: "metamask-aes-gcm-v1";
  account: string;
  iv: string;
  cipher: string;
};

type MetaMaskDirectPayload = {
  scheme: "metamask-x25519-xsalsa20-poly1305";
  payload: {
    version: string;
    nonce: string;
    ephemPublicKey: string;
    ciphertext: string;
  };
};

type WanderPayload = {
  scheme: "wander-rsa-oaep";
  cipher: string;
};

export type EncryptedPayload =
  | ArweaveHybridPayload
  | MetaMaskFallbackPayload
  | MetaMaskDirectPayload
  | WanderPayload;

function bytesToBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

function stringToBase64(value: string): string {
  return bytesToBase64(new TextEncoder().encode(value));
}

function base64ToString(value: string): string {
  const binary = atob(value);
  return new TextDecoder().decode(
    Uint8Array.from(binary, (char) => char.charCodeAt(0)),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isEncryptedPayload(value: unknown): value is EncryptedPayload {
  if (!isRecord(value) || typeof value.scheme !== "string") return false;

  if (value.scheme === "rsa-oaep-256+aes-gcm") {
    return (
      typeof value.encryptedKey === "string" &&
      typeof value.iv === "string" &&
      typeof value.cipher === "string"
    );
  }

  if (value.scheme === "metamask-aes-gcm-v1") {
    return (
      typeof value.account === "string" &&
      typeof value.iv === "string" &&
      typeof value.cipher === "string"
    );
  }

  if (value.scheme === "metamask-x25519-xsalsa20-poly1305") {
    if (!isRecord(value.payload)) return false;
    return (
      value.payload.version === "x25519-xsalsa20-poly1305" &&
      typeof value.payload.nonce === "string" &&
      typeof value.payload.ephemPublicKey === "string" &&
      typeof value.payload.ciphertext === "string"
    );
  }

  if (value.scheme === "wander-rsa-oaep") {
    return typeof value.cipher === "string";
  }

  return false;
}

export function decodeEncryptedPayload(encoded: string): EncryptedPayload {
  const decoded = base64ToString(encoded);

  let parsed: unknown;
  try {
    parsed = JSON.parse(decoded);
  } catch {
    throw new Error("Encrypted payload is not valid JSON");
  }

  if (!isEncryptedPayload(parsed)) {
    throw new Error("Encrypted payload does not match expected schema");
  }

  return parsed;
}

function toBase64Output(value: unknown): string {
  if (value instanceof Uint8Array) {
    return bytesToBase64(value);
  }

  if (value instanceof ArrayBuffer) {
    return bytesToBase64(new Uint8Array(value));
  }

  if (typeof value === "string") {
    return stringToBase64(value);
  }

  return stringToBase64(JSON.stringify(value));
}

async function encryptWithSignatureKey(
  data: string,
  account: string,
): Promise<MetaMaskFallbackPayload> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not available");
  }

  const keyMessage = `metalinks-encryption-key:${window.location.origin}`;
  const signature = (await window.ethereum.request({
    method: "personal_sign",
    params: [keyMessage, account],
  })) as string;

  const keySeed = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(signature),
  );

  const aesKey = await crypto.subtle.importKey(
    "raw",
    keySeed,
    { name: "AES-GCM" },
    false,
    ["encrypt"],
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    new TextEncoder().encode(data),
  );

  return {
    scheme: "metamask-aes-gcm-v1",
    account,
    iv: bytesToBase64(iv),
    cipher: bytesToBase64(new Uint8Array(cipherBuffer)),
  };
}

export default async function encrypt(data: string): Promise<string> {
  const wallet = useWallet.getState().type;
  if (!wallet) {
    throw new Error("No wallet connected");
  }

  switch (wallet) {
    case "wander": {
      if (!window.arweaveWallet) {
        throw new Error("Wander wallet is not available");
      }
      try {
        await window.arweaveWallet.connect(["ENCRYPT"]);

        const encrypted = await window.arweaveWallet.encrypt(data, {
          algorithm: "RSA-OAEP",
          hash: "SHA-256",
        });

        return toBase64Output({
          scheme: "wander-rsa-oaep",
          cipher: toBase64Output(encrypted),
        } satisfies WanderPayload);
      } catch (error) {
        console.error("Failed Wander encrypt/decrypt test:", error);
        throw new Error("Failed Wander encrypt/decrypt test", { cause: error });
      }
    }

    case "metamask": {
      if (!window.ethereum) {
        throw new Error("MetaMask is not available");
      }

      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];

      const account = accounts[0];
      if (!account) {
        throw new Error("No MetaMask account found");
      }
      let encryptionPublicKey: string;
      try {
        encryptionPublicKey = (await window.ethereum.request({
          method: "eth_getEncryptionPublicKey",
          params: [account],
        })) as string;
      } catch (error) {
        const methodError = error as { code?: number; message?: string };
        if (methodError?.code === -32601) {
          return toBase64Output(await encryptWithSignatureKey(data, account));
        }
        throw error;
      }

      if (!encryptionPublicKey) {
        throw new Error("Failed to get encryption public key from MetaMask");
      }

      const encryptedPayload = metamaskEncrypt({
        publicKey: encryptionPublicKey,
        data,
        version: "x25519-xsalsa20-poly1305",
      });

      return toBase64Output({
        scheme: "metamask-x25519-xsalsa20-poly1305",
        payload: encryptedPayload,
      } satisfies MetaMaskDirectPayload);
    }

    case "arweave": {
      try {
        const key = await arweave_client.getPublicKey();
        console.log("Arweave public key:", key);
        return toBase64Output(await encryptForWallet(key, data));
      } catch (err) {
        throw new Error("Failed to encrypt for Arweave wallet", {
          cause: err,
        });
      }
    }

    default:
      throw new Error("Unsupported wallet type");
  }
}
function bufToBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

// import public key from string
async function importArweavePublicKey(nString: string) {
  const jwk = {
    kty: "RSA",
    n: nString,
    e: "AQAB",
    alg: "RSA-OAEP-256",
    ext: true,
  };

  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"],
  );
}

// encrypt function
export async function encryptForWallet(
  publicKeyString: string,
  data: string,
): Promise<ArweaveHybridPayload> {
  const key = await importArweavePublicKey(publicKeyString);

  const plaintext = new TextEncoder().encode(data);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"],
  );

  const cipherBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    plaintext,
  );

  const rawAesKey = await crypto.subtle.exportKey("raw", aesKey);
  const encryptedAesKey = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    key,
    rawAesKey,
  );

  return {
    scheme: "rsa-oaep-256+aes-gcm",
    encryptedKey: bufToBase64(encryptedAesKey),
    iv: bytesToBase64(iv),
    cipher: bufToBase64(cipherBuffer),
  };
}
