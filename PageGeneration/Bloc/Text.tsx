import type { BlockData } from "@/store/useBlockStore";
import getStringField from "../utils/getStringField";
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
const sizeMap: Record<NonNullable<textSize>, string> = {
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

export type textFont = "sans" | "serif" | "mono";
const fontMap: Record<NonNullable<textFont>, string> = {
  sans: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
};
function Text({ props }: { props: BlockData }) {
  const uuid = props.id;
  const text = getStringField(props.data, "text") || "";
  const align = getStringField(props.data, "align") || "left";
  const font = (getStringField(props.data, "font") || "sans") as textFont;
  const color = getStringField(props.data, "color") || "#000000";
  const size = (getStringField(props.data, "size") || "base") as textSize;
  return (
    <div className="w-full p-2">
      <span
        id={uuid}
        className={`w-full block ${sizeMap[size]} ${fontMap[font]} text-${align}`}
        style={{ color: color }}
      >
        {text}
      </span>
    </div>
  );
}

export default Text;
