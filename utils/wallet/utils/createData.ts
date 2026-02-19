import useWallet from "@/store/useWallet";
import arweave_client from "../arweave";
import { metamask_client } from "../metamask";
export async function create(data: string): Promise<ArrayBuffer> {
  console.log("The data is ready for encryption:", data);
  const wallet = useWallet.getState().type;
  const address = useWallet.getState().address;
  if (!wallet || !address) {
    throw new Error("No wallet connected");
  }
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
        const tags = [...TagCreator(address)];
        const signedData = await window.arweaveWallet.signDataItem({
          data: new TextEncoder().encode(data),
          tags,
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
        const tags = [...TagCreator(address)];
        const signedData = await arweave_client.signDataItem({
          data: data,
          tags,
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

      try {
        const [account] = await metamask_client.requestAddresses();
        if (!account) {
          throw new Error("No MetaMask account found");
        }

        const anchor = generateAnchor();
        const tags = TagCreator(account);
        const dataBytes = new TextEncoder().encode(data);
        const ownerBytes = new TextEncoder().encode(account.toLowerCase());
        const anchorBytes = new TextEncoder().encode(anchor);
        const tagsBytes = serializeTags(tags);

        const signatureType = 7;
        const signatureLength = 65;
        const ownerLength = 42;
        const targetLength = 1;
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
        if (ownerBytes.byteLength !== ownerLength) {
          throw new Error(`Invalid owner length: ${ownerBytes.byteLength}`);
        }
        bytes.set(ownerBytes, ownerOffset);

        const targetOffset = ownerOffset + ownerLength;
        bytes[targetOffset] = 0;

        const anchorOffset = targetOffset + targetLength;
        bytes[anchorOffset] = 1;
        if (anchorBytes.byteLength !== 32) {
          throw new Error("Anchor must be 32 bytes");
        }
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
          new Uint8Array(0),
          anchorBytes,
          tagsBytes,
          dataBytes,
        ]);

        const signatureHex = await metamask_client.signTypedData({
          account: account as `0x${string}`,
          domain: {
            name: "Bundlr",
            version: "1",
          },
          types: {
            Bundlr: [
              { name: "Transaction hash", type: "bytes" },
              { name: "address", type: "address" },
            ],
          },
          primaryType: "Bundlr",
          message: {
            "Transaction hash": bytesToHex(signatureData),
            address: account,
          },
        });

        const signatureBytes = hexToBytes(signatureHex);
        if (signatureBytes.byteLength !== signatureLength) {
          throw new Error(
            `Invalid signature length: ${signatureBytes.byteLength}`,
          );
        }
        bytes.set(signatureBytes, 2);

        return toArrayBuffer(bytes);
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

function textToBytes(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (clean.length % 2 !== 0) {
    throw new Error("Invalid hex string length");
  }

  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function bytesToHex(bytes: Uint8Array): `0x${string}` {
  let hex = "0x";
  for (const b of bytes) {
    hex += b.toString(16).padStart(2, "0");
  }
  return hex as `0x${string}`;
}

function longToNByteArray(N: number, value: number): Uint8Array {
  const byteArray = new Uint8Array(N);
  let long = value;
  for (let index = 0; index < byteArray.length; index++) {
    const byte = long & 0xff;
    byteArray[index] = byte;
    long = (long - byte) / 256;
  }
  return byteArray;
}

function shortTo2ByteArray(value: number): Uint8Array {
  return longToNByteArray(2, value);
}

function longTo8ByteArray(value: number): Uint8Array {
  return longToNByteArray(8, value);
}

function concatUint8(arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const a of arrays) {
    result.set(a, offset);
    offset += a.length;
  }
  return result;
}

function serializeTags(tags: { name: string; value: string }[]): Uint8Array {
  if (tags.length === 0) {
    return new Uint8Array(0);
  }

  const parts: Uint8Array[] = [];
  parts.push(writeAvroLong(tags.length));
  for (const tag of tags) {
    const name = textToBytes(tag.name);
    const value = textToBytes(tag.value);
    parts.push(
      writeAvroLong(name.length),
      name,
      writeAvroLong(value.length),
      value,
    );
  }
  parts.push(writeAvroLong(0));

  return concatUint8(parts);
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

function TagCreator(address: string) {
  return [
    { name: "Content-Type", value: "text/plain" },
    { name: "Content-Transfer-Encoding", value: "base64" },
    { name: "App-Name", value: "metalinks" },
    { name: "App-Version", value: "0.2.0" },
    { name: "Type", value: "wallet_data" },
    { name: "Wallet-Address", value: address },
  ];
}
