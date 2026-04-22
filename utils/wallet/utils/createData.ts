import useWallet from "@/store/useWallet";
import arweave_client from "../arweave";
import { metamask_client } from "../metamask";
import { appname, appversion } from "@/utils/constant";
import { hashMessage, hexToBytes, recoverPublicKey } from "viem";

export interface DataItemCreateOptions {
  target?: string;
  tags: {
    name: string;
    value: string;
  }[];
  anchor?: string;
}
export async function create(
  data: string,
  dataItemCreateOptions: DataItemCreateOptions = { tags: [] },
): Promise<ArrayBuffer> {
  console.log("The data is ready for encryption:", data);
  const wallet = useWallet.getState().type;
  const address = useWallet.getState().address;
  if (!wallet || !address) {
    throw new Error("No wallet connected");
  }
  dataItemCreateOptions.tags?.push(
    {
      name: "App-Name",
      value: appname,
    },
    {
      name: "App-Version",
      value: appversion,
    },
    {
      name: "signing-format",
      value: "ans104",
    },
    {
      name: "SDK",
      value: "aoconnect",
    },
    {
      name: "Variant",
      value: "ao.TN.1",
    },
  );
  console.log("Creating data item with options:", dataItemCreateOptions);
  switch (wallet) {
    case "wander": {
      if (!window.arweaveWallet)
        throw new Error("Wander wallet is not installed");
      try {
        await window.arweaveWallet.connect([
          "ACCESS_ADDRESS",
          "SIGN_TRANSACTION",
          "SIGNATURE",
          "ACCESS_PUBLIC_KEY",
        ]);
        const signedData = await window.arweaveWallet.signDataItem({
          data: new TextEncoder().encode(data),
          ...dataItemCreateOptions,
          anchor: generateAnchor(),
        });
        return toArrayBuffer(signedData);
      } catch (e) {
        console.log(e);
        throw new Error("Failed to create data with Wander wallet", {
          cause: e instanceof Error ? e.message : "unknown_error",
        });
      }
    }
    case "arweave": {
      try {
        const signedData = await arweave_client.signDataItem({
          data: data,
          ...dataItemCreateOptions,
          anchor: generateAnchor(),
        });
        return toArrayBuffer(signedData);
      } catch (e) {
        console.log(e);
        throw new Error("Failed to create data with Arweave wallet", {
          cause: e instanceof Error ? e.message : "unknown_error",
        });
      }
    }
    case "metamask": {
      if (!metamask_client) {
        throw new Error("MetaMask client is not available");
      }
      const metaMaskClient = metamask_client;

      try {
        const [account] = await metaMaskClient.requestAddresses();
        if (!account) {
          throw new Error("No MetaMask account found");
        }
        return await createMetaMaskDataItem(
          data,
          {
            tags: dataItemCreateOptions.tags,
            target: dataItemCreateOptions.target,
            anchor: generateAnchor(),
          },
          metaMaskClient,
          account as `0x${string}`,
        );
      } catch (e) {
        console.error(e);
        throw new Error("Failed to create data with MetaMask wallet", {
          cause: e instanceof Error ? e.message : "unknown_error",
        });
      }
    }

    default:
      throw new Error(`Unsupported wallet type: ${wallet}`);
  }
}

async function createMetaMaskDataItem(
  data: string,
  options: DataItemCreateOptions,
  metaMaskClient: NonNullable<typeof metamask_client>,
  account: `0x${string}`,
): Promise<ArrayBuffer> {
  const signatureType = 3; // SignatureConfig.ETHEREUM
  const signatureLength = 65;
  const ownerLength = 65;

  const ownerBytes = await getMetaMaskOwnerPublicKey(metaMaskClient, account);
  if (ownerBytes.byteLength !== ownerLength) {
    throw new Error(`Invalid owner length: ${ownerBytes.byteLength}`);
  }

  const dataBytes = new TextEncoder().encode(data);
  const targetBytes = options.target
    ? base64UrlToBytes(options.target)
    : new Uint8Array(0);
  if (targetBytes.byteLength !== 0 && targetBytes.byteLength !== 32) {
    throw new Error(`Target must be 32 bytes, got ${targetBytes.byteLength}`);
  }

  const anchorValue = options.anchor ?? generateAnchor();
  const anchorBytes = new TextEncoder().encode(anchorValue);
  if (anchorBytes.byteLength !== 32) {
    throw new Error("Anchor must be 32 bytes");
  }

  const tags = options.tags ?? [];
  const tagsBytes = serializeTags(tags);

  const targetLength = 1 + targetBytes.byteLength;
  const anchorLength = 1 + anchorBytes.byteLength;
  const tagsLength = 16 + tagsBytes.byteLength;
  const totalLength =
    2 +
    signatureLength +
    ownerLength +
    targetLength +
    anchorLength +
    tagsLength +
    dataBytes.byteLength;

  const bytes = new Uint8Array(totalLength);
  bytes.set(shortTo2ByteArray(signatureType), 0);

  const ownerOffset = 2 + signatureLength;
  bytes.set(ownerBytes, ownerOffset);

  const targetOffset = ownerOffset + ownerLength;
  if (targetBytes.byteLength === 32) {
    bytes[targetOffset] = 1;
    bytes.set(targetBytes, targetOffset + 1);
  } else {
    bytes[targetOffset] = 0;
  }

  const anchorOffset = targetOffset + targetLength;
  bytes[anchorOffset] = 1;
  bytes.set(anchorBytes, anchorOffset + 1);

  const tagsOffset = anchorOffset + anchorLength;
  bytes.set(longTo8ByteArray(tags.length), tagsOffset);
  bytes.set(longTo8ByteArray(tagsBytes.byteLength), tagsOffset + 8);
  bytes.set(tagsBytes, tagsOffset + 16);

  const dataOffset = tagsOffset + tagsLength;
  bytes.set(dataBytes, dataOffset);

  const signatureData = await deepHash([
    textToBytes("dataitem"),
    textToBytes("1"),
    textToBytes(signatureType.toString()),
    ownerBytes,
    targetBytes,
    anchorBytes,
    tagsBytes,
    dataBytes,
  ]);

  const signatureHex = await metaMaskClient.signMessage({
    account,
    message: { raw: signatureData },
  });
  const signatureBytes = hexToBytes(signatureHex);
  if (signatureBytes.byteLength !== signatureLength) {
    throw new Error(`Invalid signature length: ${signatureBytes.byteLength}`);
  }
  bytes.set(signatureBytes, 2);

  return toArrayBuffer(bytes);
}

async function getMetaMaskOwnerPublicKey(
  metaMaskClient: NonNullable<typeof metamask_client>,
  account: `0x${string}`,
): Promise<Uint8Array> {
  const connectMessage = "sign this message to connect to Bundlr.Network";
  const signature = await metaMaskClient.signMessage({
    account,
    message: connectMessage,
  });
  const messageHash = hashMessage(connectMessage);
  const publicKeyHex = await recoverPublicKey({
    hash: messageHash,
    signature,
  });
  return hexToBytes(publicKeyHex);
}

function textToBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function longToNByteArray(length: number, value: number): Uint8Array {
  const out = new Uint8Array(length);
  let num = value;
  for (let i = 0; i < length; i++) {
    const byte = num & 0xff;
    out[i] = byte;
    num = (num - byte) / 256;
  }
  return out;
}

function shortTo2ByteArray(value: number): Uint8Array {
  return longToNByteArray(2, value);
}

function longTo8ByteArray(value: number): Uint8Array {
  return longToNByteArray(8, value);
}

function concatUint8(arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, array) => sum + array.length, 0);
  const out = new Uint8Array(totalLength);
  let offset = 0;
  for (const array of arrays) {
    out.set(array, offset);
    offset += array.length;
  }
  return out;
}

function writeAvroLong(value: number): Uint8Array {
  let n = value >= 0 ? value << 1 : (~value << 1) | 1;
  const bytes: number[] = [];
  do {
    let b = n & 0x7f;
    n >>= 7;
    if (n !== 0) {
      b |= 0x80;
    }
    bytes.push(b);
  } while (n !== 0);

  return Uint8Array.from(bytes);
}

function serializeTags(tags: { name: string; value: string }[]): Uint8Array {
  if (tags.length === 0) {
    return new Uint8Array(0);
  }

  const parts: Uint8Array[] = [];
  parts.push(writeAvroLong(tags.length));
  for (const tag of tags) {
    const nameBytes = textToBytes(tag.name);
    const valueBytes = textToBytes(tag.value);
    parts.push(
      writeAvroLong(nameBytes.length),
      nameBytes,
      writeAvroLong(valueBytes.length),
      valueBytes,
    );
  }
  parts.push(writeAvroLong(0));

  return concatUint8(parts);
}

async function sha384(data: Uint8Array): Promise<Uint8Array> {
  const digest = await crypto.subtle.digest("SHA-384", toArrayBuffer(data));
  return new Uint8Array(digest);
}

async function deepHash(data: Uint8Array | Uint8Array[]): Promise<Uint8Array> {
  if (Array.isArray(data)) {
    const tag = concatUint8([
      textToBytes("list"),
      textToBytes(data.length.toString()),
    ]);
    let acc = await sha384(tag);
    for (const chunk of data) {
      const hashedChunk = await deepHash(chunk);
      acc = await sha384(concatUint8([acc, hashedChunk]));
    }
    return acc;
  }

  const tag = concatUint8([
    textToBytes("blob"),
    textToBytes(data.byteLength.toString()),
  ]);
  const tagHash = await sha384(tag);
  const dataHash = await sha384(data);
  return sha384(concatUint8([tagHash, dataHash]));
}

function toArrayBuffer(value: ArrayBufferLike | ArrayBufferView): ArrayBuffer {
  const view = ArrayBuffer.isView(value)
    ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
    : new Uint8Array(value);

  const out = new ArrayBuffer(view.byteLength);
  new Uint8Array(out).set(view);
  return out;
}

function generateAnchor() {
  const rand = new Uint8Array(16);
  crypto.getRandomValues(rand);

  const time = Date.now().toString(36); // string
  const randHex = Array.from(rand, (b) => b.toString(16).padStart(2, "0")).join(
    "",
  );

  const anchor = (time + randHex).slice(0, 32);

  return String(anchor); // ensure string
}
