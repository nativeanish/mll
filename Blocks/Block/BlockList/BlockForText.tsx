import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import {
  type textAlign,
  type textSize,
  type textFont,
  sizeMap,
  fontMap,
} from "@/utils/block/text";
import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/src/components/ui/select";

interface Props {
  isEdit: boolean;
  setError: (value: boolean) => void;
}
function BlockForText({ isEdit }: Props) {
  const [text, setText] = useState<string>("");
  const [color, setColor] = useState<string>("#000000");
  const [size, setSize] = useState<NonNullable<textSize>>("base");
  const [font, setFont] = useState<NonNullable<textFont>>("sans");
  const [align, setAlign] = useState<NonNullable<textAlign>>("left");
  return (
    <div>
      {isEdit ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Size</Label>
              <Select
                value={size}
                onValueChange={(v) => setSize(v as NonNullable<textSize>)}
              >
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                  <SelectItem value="xl">XL</SelectItem>
                  <SelectItem value="xxl">2XL</SelectItem>
                  <SelectItem value="xxxl">3XL</SelectItem>
                  <SelectItem value="xxxxl">4XL</SelectItem>
                  <SelectItem value="xxxxxl">5XL</SelectItem>
                  <SelectItem value="xxxxxxl">6XL</SelectItem>
                  <SelectItem value="xxxxxxxl">7XL</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Font</Label>
              <Select
                value={font}
                onValueChange={(v) => setFont(v as NonNullable<textFont>)}
              >
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sans">Sans</SelectItem>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="mono">Mono</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Align</Label>
              <Select
                value={align}
                onValueChange={(v) => setAlign(v as NonNullable<textAlign>)}
              >
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue placeholder="Select align" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Color</Label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-9 w-full rounded-md border bg-muted/40 p-1"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Text</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter your text..."
              className="min-h-32 bg-muted/40"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            className={`flex justify-center px-2 ${
              align === "left"
                ? "justify-start"
                : align === "center"
                  ? "justify-center"
                  : "justify-end"
            }`}
          >
            <div
              className={`${sizeMap[size || "base"]} ${fontMap[font || "sans"]}  whitespace-pre-wrap max-w-full truncate`}
              style={{ color: color || "#000000" }}
            >
              {text?.length ? (
                text
              ) : (
                <span className="text-muted-foreground italic">No text</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlockForText;
