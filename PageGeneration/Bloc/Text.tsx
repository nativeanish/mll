import type { BlockData } from "@/store/useBlockStore";
import getStringFields from "../utils/getStringFields";
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
  const {
    text = "",
    align = "left",
    font: fontValue = "sans",
    color = "#000000",
    size: sizeValue = "base",
  } = getStringFields(props.data, ["text", "align", "font", "color", "size"]);
  const font = fontValue as textFont;
  const size = sizeValue as textSize;
  return (
    <div className="w-full p-2">
      <span
        id={props.id}
        className={`w-full block font-bold ${sizeMap[size]} ${fontMap[font]} text-${align}`}
        style={{ color: color }}
      >
        {text}
      </span>
    </div>
  );
}

export default Text;
