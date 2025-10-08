import useWallet from "@/store/useWallet";
import React from "react";
import { toast } from "sonner";

export const checkConnectionWander = async () => {
  try {
    if (!window.arweaveWallet) {
      return false;
    }
    await window.arweaveWallet.connect([
      "ACCESS_ADDRESS",
      "SIGN_TRANSACTION",
      "ENCRYPT",
    ]);
    const data = await window.arweaveWallet.getActiveAddress();
    if (data && data.length) {
      useWallet.getState().setType("wander");
      useWallet.getState().setAddress(data);
      useWallet.getState().setStatus("connected");
      useWallet.getState().saveToStorage();
      return true;
    }
    return false;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const connectWander = async () => {
  try {
    useWallet.getState().connect("wander");

    if (!window.arweaveWallet) {
      useWallet.getState().setStatus("error");
      useWallet.getState().setError("Wander is not installed");
      toast.warning("Wander is not installed", {
        icon: React.createElement("img", {
          src: "https://arweave.net/qbL1viCRNm6RfKHQXztVdKmf5Q0WKmOLmNdTht7G9PE",
          alt: "Wander",
          className: "h-7 w-7",
        }),
        description: React.createElement("div", null, [
          React.createElement(
            "a",
            {
              key: "link",
              href: "https://www.wander.app",
              target: "_blank",
              rel: "noopener noreferrer",
              className: "underline",
            },
            "Please install Wander from here"
          ),
          ".",
        ]),
      });
      return false;
    }

    await window.arweaveWallet.connect([
      "ACCESS_ADDRESS",
      "SIGN_TRANSACTION",
      "ENCRYPT",
    ]);
    const success = await checkConnectionWander();

    if (!success) {
      useWallet.getState().setStatus("error");
      useWallet.getState().setError("Failed to connect to Wander");
      toast.error("Failed to connect to Wander");
    }

    return success;
  } catch (e) {
    useWallet.getState().setStatus("error");
    useWallet.getState().setError("Failed to connect to Wander");
    toast.error("Failed to connect to Wander");
    console.log(e);
    return false;
  }
};
