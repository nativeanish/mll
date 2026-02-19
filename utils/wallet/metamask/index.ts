import useWallet from "@/store/useWallet";
import React from "react";
import { toast } from "sonner";
import { createWalletClient, custom, verifyMessage } from "viem";
import { mainnet } from "viem/chains";

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (...args: unknown[]) => Promise<unknown>;
    };
  }
}

export const metamask_client = window.ethereum
  ? createWalletClient({
      chain: mainnet,
      transport: custom(
        window.ethereum as unknown as {
          request: (...args: unknown[]) => Promise<unknown>;
        },
      ),
    })
  : null;

export const checkConnectionMetaMask = async () => {
  try {
    if (!metamask_client) return false;

    const accounts = (await metamask_client.request({
      method: "eth_accounts",
    })) as string[];

    if (!accounts || !accounts.length) return false;

    useWallet.getState().setType("metamask");
    useWallet.getState().setAddress(accounts[0]);
    useWallet.getState().setStatus("connected");
    useWallet.getState().saveToStorage();
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const connectMetaMask = async () => {
  try {
    useWallet.getState().connect("metamask");

    if (!window.ethereum) {
      useWallet.getState().setStatus("error");
      useWallet.getState().setError("MetaMask is not installed");
      toast.warning("MetaMask is not installed", {
        icon: React.createElement("img", {
          src: "https://arweave.net/AygXinftYYvlUOEyJ_RQsOxpnpzJ9HD6xxsML6prLdo",
          alt: "MetaMask",
          className: "h-7 w-7",
        }),
        description: React.createElement("div", null, [
          React.createElement(
            "a",
            {
              key: "link",
              href: "https://metamask.io/download",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "underline",
            },
            "Please install MetaMask from here",
          ),
          ".",
        ]),
      });
      return false;
    }

    if (!metamask_client) {
      toast.error("Failed to create MetaMask client");
      throw new Error("Failed to create MetaMask client", {
        cause: "metamask_client_null",
      });
    }

    // Request wallet connection
    const address = await metamask_client.request({
      method: "eth_requestAccounts",
    });
    toast.info(
      "MetaMask wallet connected. Please sign the request to verify your wallet.",
      {
        icon: React.createElement("img", {
          src: "https://arweave.net/AygXinftYYvlUOEyJ_RQsOxpnpzJ9HD6xxsML6prLdo",
          alt: "MetaMask",
          className: "h-7 w-7",
        }),
      },
    );
    // --- Step 2: Sign and verify message ---
    const message = `Please sign this message to verify your wallet.\nNonce: ${Date.now()}`;
    // Ask user to sign
    const signature = (await window.ethereum.request({
      method: "personal_sign",
      params: [message, address[0]],
    })) as string;

    // Verify the signature
    const isValid = await verifyMessage({
      address: address[0],
      message,
      signature: signature as `0x${string}`,
    });

    if (!isValid) {
      throw new Error("Signature verification failed");
    }
    return await checkConnectionMetaMask();
  } catch (e) {
    console.error(e);
    useWallet.getState().setStatus("error");
    useWallet.getState().setError("Failed to connect or verify MetaMask");
    toast.error(
      e instanceof Error ? e.message : "Failed to connect or verify MetaMask",
    );
    return false;
  }
};
