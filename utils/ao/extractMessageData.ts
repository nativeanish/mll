type AoTag = {
  name?: unknown;
  value?: unknown;
};

type AoRawMessage = {
  Data?: unknown;
  Tags?: unknown;
};

type AoComputeResponse = {
  raw?: {
    Messages?: unknown;
  };
};

function getActionValue(tags: unknown): string | null {
  if (!Array.isArray(tags)) return null;

  const actionTag = tags.find((tag) => {
    if (!tag || typeof tag !== "object") return false;
    const candidate = tag as AoTag;
    return candidate.name === "Action";
  }) as AoTag | undefined;

  if (!actionTag || typeof actionTag.value !== "string") return null;
  return actionTag.value;
}

export default function extractMessageData(
  payload: unknown,
  expectedAction = "registered_user_success",
): string {
  if (!payload || typeof payload !== "object") {
    throw new Error("Invalid response payload");
  }

  const response = payload as AoComputeResponse;
  if (!response.raw || typeof response.raw !== "object") {
    throw new Error("Missing raw in response payload");
  }

  if (!Array.isArray(response.raw.Messages)) {
    throw new Error("Missing raw.Messages in response payload");
  }

  const messages = response.raw.Messages as AoRawMessage[];
  if (messages.length === 0) {
    throw new Error("raw.Messages is empty");
  }

  const matchedMessage = messages.find((message) => {
    const action = getActionValue(message?.Tags);
    return action === expectedAction;
  });

  if (!matchedMessage) {
    throw new Error(
      `No message found with Action tag value \"${expectedAction}\"`,
    );
  }

  if (typeof matchedMessage.Data !== "string") {
    throw new Error("Matched message is missing Data string");
  }

  return matchedMessage.Data;
}
