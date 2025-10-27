import Arweave from "arweave";
import { connect, createDataItemSigner } from "@permaweb/aoconnect";
import Permaweb from "@permaweb/libs";

let _permaweb: ReturnType<typeof Permaweb.init> | null = null;

export function getPermaweb() {
  // Ensure we are in a browser
  if (typeof window === "undefined") {
    throw new Error(
      "Permaweb client can only be initialized in the browser runtime."
    );
  }

  // Ensure secure context with SubtleCrypto available
  const hasSubtle = !!(globalThis.crypto && globalThis.crypto.subtle);
  const isSecure =
    typeof window.isSecureContext === "boolean" ? window.isSecureContext : true;
  if (!hasSubtle || !isSecure) {
    throw new Error(
      "SubtleCrypto not available. Use a secure context (https or localhost) and a modern browser."
    );
  }

  if (_permaweb) return _permaweb;

  _permaweb = Permaweb.init({
    ao: connect({ MODE: "legacy" }),
    arweave: Arweave.init({
      host: "arweave.net",
      port: 443,
      protocol: "https",
    }),
    signer: createDataItemSigner(window.arweaveWallet),
  });

  return _permaweb;
}

export default getPermaweb;
