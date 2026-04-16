import { HYPERBEAM, processId } from "../constant";
import { create } from "../wallet/utils/createData";

export default async function sendMessage(
  action: string = "",
  _data: string = "",
  _tags: { name: string; value: string }[] = [],
): Promise<unknown> {
  console.log("Sending message with action:", action);
  try {
    const data = await create(_data, {
      target: processId,
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
    const res = await fetch(`${HYPERBEAM}/${processId}~process@1.0/push`, {
      method: "POST",
      redirect: "follow",
      headers: {
        "Content-Type": "application/ans104",
        "codec-device": "ans104@1.0",
      },
      body: data,
    });
    if (!res.ok) {
      throw new Error(`HyperBEAM Error: ${res.status} ${await res.text()}`);
    }
    const response = await res.json();
    const slot = response.slot;
    if (!slot) {
      throw new Error(`Invalid HyperBEAM response: missing slot`);
    }
    console.log("Hyperbeam response:", response);
    const ress = await fetch(
      `${HYPERBEAM}/${processId}~process@1.0/compute=${slot}`,
      {
        method: "GET",
        redirect: "follow",
      },
    );
    if (!ress.ok) {
      throw new Error(`HyperBEAM error: ${ress.status} ${await ress.text()}`);
    }
    return response;
  } catch (e) {
    console.error("Failed to send message:", e);
    throw new Error("Failed to send message", {
      cause: e instanceof Error ? e.message : "unknown_error",
    });
  }
}
