const getStringField = (obj: unknown, key: string): string | undefined => {
  if (
    obj &&
    typeof obj === "object" &&
    key in (obj as Record<string, unknown>)
  ) {
    const value = (obj as Record<string, unknown>)[key];
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
};

const getStringFields = (
  obj: unknown,
  keys: string[]
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const key of keys) {
    const value = getStringField(obj, key);
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
};

export default getStringFields;
export { getStringField };
