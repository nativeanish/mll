import { arweaveUploadGateway } from "@/utils/constant";

export default async function upload(signedData: ArrayBuffer) {
  try {
    const response = await fetch(arweaveUploadGateway, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": signedData.byteLength.toString(),
        "content-type": "application/octet-stream",
      },
      body: signedData,
    });

    if (!response.ok) {
      throw new Error(
        `Upload failed with status ${response.status} ${response.statusText}`,
      );
    }

    // up.arweave.net returns JSON: { id: "tx_id" }
    const json = (await response.json()) as { id: string };
    const txId = json.id;
    console.log("Upload successful! Transaction ID:", txId);
    return txId;
  } catch (e) {
    console.error("Upload failed:", e);
    throw new Error("Failed to upload data", {
      cause: e instanceof Error ? e.message : "unknown_error",
    });
  }
}
