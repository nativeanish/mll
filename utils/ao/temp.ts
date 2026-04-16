export interface DataItemCreateOptions {
  target?: string;
  tags: {
    name: string;
    value: string;
  }[];
  anchor?: string;
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
function toArrayBuffer(value: ArrayBufferLike | ArrayBufferView): ArrayBuffer {
  const view = ArrayBuffer.isView(value)
    ? new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
    : new Uint8Array(value);

  const out = new ArrayBuffer(view.byteLength);
  new Uint8Array(out).set(view);
  return out;
}
async function createData(
  data: string,
  dataItemCreateOptions: DataItemCreateOptions = { tags: [] },
): Promise<ArrayBuffer> {
  dataItemCreateOptions.tags?.push(
    {
      name: "App-Name",
      value: "AppName",
    },
    {
      name: "App-Version",
      value: "AppVersion",
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
  } catch (err) {
    throw new Error(
      `Failed to create data: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

async function sendMessage(
  action: string = "",
  _data: string = "",
  _tags: { name: string; value: string }[] = [],
): Promise<unknown> {
  const data = await createData(_data, {
    target: "ProcessId",
    tags: [
      {
        name: "Action",
        value: action,
      },
      {
        name: "Data-Protocol",
        value: "ao",
      },
      {
        name: "Type",
        value: "Message",
      },
      {
        name: "accept-bundle",
        value: "true",
      },
      {
        name: "require-codec",
        value: "application/json",
      },
      ..._tags,
    ],
  });
  const res = await fetch(`hypebeam-endpoint/{processId}~process@1.0/push`, {
    method: "POST",
    redirect: "follow",
    headers: {
      "Content-Type": "application/ans104",
      "codec-device": "ans104@1.0",
    },
    body: data,
  });
  return res;
}
