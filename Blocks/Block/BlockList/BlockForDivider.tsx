import { Label } from "@/src/components/ui/label";
import { Input } from "@/src/components/ui/input";
import {
  type dividerWidth,
  type dividerThickness,
  widthMap,
  thicknessMap,
} from "@/utils/block/divider";
import { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/src/components/ui/select";
import { useBlockStore } from "@/store/useBlockStore";

interface Props {
  isEdit: boolean;
  setError: (value: boolean) => void;
  uuid: string;
}

function BlockForDivider({ isEdit, uuid }: Props) {
  const [color, setColor] = useState<string>("#e5e7eb");
  const [width, setWidth] = useState<NonNullable<dividerWidth>>("100");
  const [thickness, setThickness] =
    useState<NonNullable<dividerThickness>>("1");
  const [spacingTop, setSpacingTop] = useState<string>("16");
  const [spacingBottom, setSpacingBottom] = useState<string>("16");
  const updateBlock = useBlockStore((state) => state.updateBlockData);
  useEffect(() => {
    if (!isEdit)
      updateBlock(uuid, {
        color,
        width,
        thickness,
        spacingTop,
        spacingBottom,
      });
  }, [
    color,
    width,
    thickness,
    spacingTop,
    spacingBottom,
    updateBlock,
    uuid,
    isEdit,
  ]);
  return (
    <div>
      {isEdit ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Width</Label>
              <Select
                value={width}
                onValueChange={(v) => setWidth(v as NonNullable<dividerWidth>)}
              >
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue placeholder="Select width" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25%</SelectItem>
                  <SelectItem value="50">50%</SelectItem>
                  <SelectItem value="75">75%</SelectItem>
                  <SelectItem value="100">100%</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Thickness</Label>
              <Select
                value={thickness}
                onValueChange={(v) =>
                  setThickness(v as NonNullable<dividerThickness>)
                }
              >
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue placeholder="Select thickness" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1px</SelectItem>
                  <SelectItem value="2">2px</SelectItem>
                  <SelectItem value="3">3px</SelectItem>
                  <SelectItem value="4">4px</SelectItem>
                  <SelectItem value="6">6px</SelectItem>
                  <SelectItem value="8">8px</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Spacing Top (px)</Label>
              <Input
                type="number"
                min="0"
                max="128"
                value={spacingTop}
                onChange={(e) => setSpacingTop(e.target.value)}
                className="bg-muted/40"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Spacing Bottom (px)</Label>
              <Input
                type="number"
                min="0"
                max="128"
                value={spacingBottom}
                onChange={(e) => setSpacingBottom(e.target.value)}
                className="bg-muted/40"
              />
            </div>
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
      ) : (
        <div className="flex justify-center w-full">
          <div
            className={`${widthMap[width || "100"]} ${thicknessMap[thickness || "1"]} rounded-full`}
            style={{ backgroundColor: color || "#e5e7eb" }}
          />
        </div>
      )}
    </div>
  );
}

export default BlockForDivider;
