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
export default getStringField;
