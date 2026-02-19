function b64UrlEncode(bytes: Uint8Array<ArrayBuffer>): string {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64UrlDecode(str: string): Uint8Array<ArrayBuffer> {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(str);
  return new Uint8Array(Array.from(bin, (c) => c.charCodeAt(0)));
}

type ArweaveJwk = JsonWebKey & {
  kty: "RSA";
  n: string;
  e: string;
  d: string;
  p: string;
  q: string;
  dp: string;
  dq: string;
  qi: string;
};

export type GeneratedArweaveWallet = {
  jwk: ArweaveJwk;
  address: string;
  publicKey: string;
  owner: string;
};

async function jwkToAddress(jwk: Pick<ArweaveJwk, "n">): Promise<string> {
  const nBytes = b64UrlDecode(jwk.n);
  const hash: ArrayBuffer = await crypto.subtle.digest("SHA-256", nBytes);
  return b64UrlEncode(new Uint8Array(hash));
}

export async function generateArweaveWallet(): Promise<GeneratedArweaveWallet> {
  const keyPair = (await crypto.subtle.generateKey(
    {
      name: "RSA-PSS",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign"],
  )) as CryptoKeyPair;

  const jwk = (await crypto.subtle.exportKey(
    "jwk",
    keyPair.privateKey,
  )) as ArweaveJwk;

  const address = await jwkToAddress(jwk);

  return {
    jwk,
    address,
    publicKey: jwk.n,
    owner: jwk.n,
  };
}
