import type { BlockData } from "@/store/useBlockStore";
import getStringFields from "../utils/getStringFields";
import { useEffect } from "react";

function formatPx(value: string | undefined, fallback: string) {
  const effective = (value?.trim() ?? fallback).trim();
  return effective.endsWith("px") ? effective : `${effective}px`;
}

function formatPercent(value: string | undefined, fallback: string) {
  const effective = (value?.trim() ?? fallback).trim();
  return effective.endsWith("%") ? effective : `${effective}%`;
}

function Divider({ props }: { props: BlockData }) {
  const {
    color = "#000000",
    thickness = "1",
    width = "100",
    spacingTop = "8",
    spacingBottom = "8",
  } = getStringFields(props.data, [
    "color",
    "thickness",
    "width",
    "spacingTop",
    "spacingBottom",
  ]);

  useEffect(() => {
    console.log(spacingTop, spacingBottom);
  }, [spacingTop, spacingBottom]);

  return (
    <div
      data-uuid={props.id}
      style={{
        backgroundColor: color,
        height: formatPx(thickness, "1"),
        width: formatPercent(width, "100"),
        marginTop: formatPx(spacingTop, "8"),
        marginBottom: formatPx(spacingBottom, "8"),
      }}
    ></div>
  );
}

export default Divider;
