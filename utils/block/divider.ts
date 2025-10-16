export type dividerWidth = "25" | "50" | "75" | "100";
export type dividerThickness = "1" | "2" | "3" | "4" | "6" | "8";

export const widthMap: Record<NonNullable<dividerWidth>, string> = {
  "25": "w-1/4",
  "50": "w-1/2",
  "75": "w-3/4",
  "100": "w-full",
};

export const thicknessMap: Record<NonNullable<dividerThickness>, string> = {
  "1": "h-px",
  "2": "h-0.5",
  "3": "h-1",
  "4": "h-1.5",
  "6": "h-2",
  "8": "h-3",
};
