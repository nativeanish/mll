import useWallet from "@/store/useWallet";
import arweave_client from "../arweave";
import { decodeEncryptedPayload, type EncryptedPayload } from "./encrypt";

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  return new Uint8Array(Array.from(binary, (char) => char.charCodeAt(0)));
}

function toArrayBufferBackedBytes(
  value: Uint8Array | ArrayBuffer | ArrayBufferLike,
): Uint8Array<ArrayBuffer> {
  if (value instanceof Uint8Array) {
    return new Uint8Array(Array.from(value));
  }
  return new Uint8Array(Array.from(new Uint8Array(value)));
}

function utf8ToHex(value: string): `0x${string}` {
  const bytes = new TextEncoder().encode(value);
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  return `0x${hex}`;
}

async function decryptMetaMaskFallback(
  payload: Extract<EncryptedPayload, { scheme: "metamask-aes-gcm-v1" }>,
): Promise<string> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not available");
  }

  const keyMessage = `metalinks-encryption-key:${window.location.origin}`;
  const signature = (await window.ethereum.request({
    method: "personal_sign",
    params: [keyMessage, payload.account],
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
    ["decrypt"],
  );

  const plainBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: toArrayBufferBackedBytes(base64ToBytes(payload.iv)),
    },
    aesKey,
    toArrayBufferBackedBytes(base64ToBytes(payload.cipher)),
  );

  return new TextDecoder().decode(new Uint8Array(plainBuffer));
}

async function decryptMetaMaskDirect(
  payload: Extract<
    EncryptedPayload,
    { scheme: "metamask-x25519-xsalsa20-poly1305" }
  >,
): Promise<string> {
  if (!window.ethereum) {
    throw new Error("MetaMask is not available");
  }

  const account =
    useWallet.getState().address ||
    (
      (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[]
    )[0];

  if (!account) {
    throw new Error("No MetaMask account found for decryption");
  }

  const encryptedHex = utf8ToHex(JSON.stringify(payload.payload));
  const decrypted = await window.ethereum.request({
    method: "eth_decrypt",
    params: [encryptedHex, account],
  });

  if (typeof decrypted !== "string") {
    throw new Error("MetaMask returned non-string decrypted payload");
  }

  return decrypted;
}

async function decryptWander(
  payload: Extract<EncryptedPayload, { scheme: "wander-rsa-oaep" }>,
): Promise<string> {
  if (!window.arweaveWallet) {
    throw new Error("Wander wallet is not available");
  }

  await window.arweaveWallet.connect(["DECRYPT"]);
  const decrypted = await window.arweaveWallet.decrypt(
    toArrayBufferBackedBytes(base64ToBytes(payload.cipher)),
    {
      algorithm: "RSA-OAEP",
      hash: "SHA-256",
    },
  );

  return typeof decrypted === "string"
    ? decrypted
    : new TextDecoder().decode(decrypted);
}

async function decryptArweaveHybrid(
  payload: Extract<EncryptedPayload, { scheme: "rsa-oaep-256+aes-gcm" }>,
): Promise<string> {
  const decryptedAesKey = await arweave_client.decrypt(
    base64ToBytes(payload.encryptedKey),
    {
      name: "RSA-OAEP",
    },
  );

  const rawAesKey =
    decryptedAesKey instanceof Uint8Array
      ? toArrayBufferBackedBytes(decryptedAesKey)
      : toArrayBufferBackedBytes(decryptedAesKey);

  const aesKey = await crypto.subtle.importKey(
    "raw",
    rawAesKey,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );

  const plainBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: toArrayBufferBackedBytes(base64ToBytes(payload.iv)),
    },
    aesKey,
    toArrayBufferBackedBytes(base64ToBytes(payload.cipher)),
  );

  return new TextDecoder().decode(new Uint8Array(plainBuffer));
}

export default async function decrypt(encodedPayload: string): Promise<string> {
  const wallet = useWallet.getState().type;
  if (!wallet) {
    throw new Error("No wallet connected");
  }

  const payload = decodeEncryptedPayload(encodedPayload);

  switch (wallet) {
    case "wander": {
      if (payload.scheme !== "wander-rsa-oaep") {
        throw new Error(
          "Payload scheme does not match connected wander wallet",
        );
      }
      return decryptWander(payload);
    }

    case "metamask": {
      if (payload.scheme === "metamask-aes-gcm-v1") {
        return decryptMetaMaskFallback(payload);
      }
      if (payload.scheme === "metamask-x25519-xsalsa20-poly1305") {
        return decryptMetaMaskDirect(payload);
      }
      throw new Error(
        "Payload scheme does not match connected MetaMask wallet",
      );
    }

    case "arweave": {
      if (payload.scheme !== "rsa-oaep-256+aes-gcm") {
        throw new Error(
          "Payload scheme does not match connected arweave wallet",
        );
      }
      return decryptArweaveHybrid(payload);
    }

    default:
      throw new Error("Unsupported wallet type for decryption");
  }
}
