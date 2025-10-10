export type textSize =
  | "sm"
  | "base"
  | "lg"
  | "xl"
  | "xxl"
  | "xxxl"
  | "xxxxl"
  | "xxxxxl"
  | "xxxxxxl"
  | "xxxxxxxl";

export type textAlign = "left" | "center" | "right";
export type textFont = "sans" | "serif" | "mono";
export const sizeMap: Record<NonNullable<textSize>, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  xxl: "text-2xl",
  xxxl: "text-3xl",
  xxxxl: "text-4xl",
  xxxxxl: "text-5xl",
  xxxxxxl: "text-6xl",
  xxxxxxxl: "text-7xl",
};
export const fontMap: Record<NonNullable<textFont>, string> = {
  sans: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
};
export const alignMap: Record<NonNullable<textAlign>, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};
