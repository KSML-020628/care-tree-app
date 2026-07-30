import type { BrushSize } from "@/types/drawing";

export const BRUSH_SIZE_ORDER: readonly BrushSize[] = ["SMALL", "MEDIUM", "LARGE"] as const;

export const BRUSH_SIZE_MULTIPLIERS: Record<BrushSize, number> = {
  SMALL: 0.6,
  MEDIUM: 1,
  LARGE: 1.7,
};

/** 굵기를 숫자 px 대신 점 크기로 보여줄 때 쓰는 지름(px). */
export const BRUSH_SIZE_DOT_PX: Record<BrushSize, number> = {
  SMALL: 10,
  MEDIUM: 16,
  LARGE: 24,
};
