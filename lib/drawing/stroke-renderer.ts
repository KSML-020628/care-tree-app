import { BRUSH_SIZE_MULTIPLIERS } from "@/lib/config/brush-sizes";
import { RAINBOW_STOP_COLORS, getColorOption } from "@/lib/config/colors";
import { getToolConfig } from "@/lib/config/tools";
import type { BrushSize, DrawingTool, Stroke } from "@/types/drawing";

export const RAINBOW_COLOR_ID = "rainbow";

/**
 * 지금 고른 도구·색·굵기와 점 목록으로 stroke의 기본 값을 만든다.
 * 그리는 중 실시간 미리보기와, 완성된 stroke를 store에 저장할 때 모두 이 함수 하나만 쓴다.
 */
export function buildStrokeBase(
  points: number[],
  tool: DrawingTool,
  colorId: string,
  brushSize: BrushSize,
): Omit<Stroke, "id" | "glitterParticles"> {
  const toolConfig = getToolConfig(tool);
  const color = getColorOption(colorId);
  const width = toolConfig.defaultWidth * BRUSH_SIZE_MULTIPLIERS[brushSize];

  return {
    tool,
    points,
    color: tool === "ERASER" ? "#000000" : color.isRainbow ? RAINBOW_COLOR_ID : color.strokeColor,
    width,
    opacity: toolConfig.opacity,
  };
}

interface StrokeShapeProps {
  stroke?: string;
  strokeWidth: number;
  opacity: number;
  lineCap: "round";
  lineJoin: "round";
  tension: number;
  dash?: number[];
  globalCompositeOperation: "source-over" | "destination-out";
  strokeLinearGradientStartPointX?: number;
  strokeLinearGradientStartPointY?: number;
  strokeLinearGradientEndPointX?: number;
  strokeLinearGradientEndPointY?: number;
  strokeLinearGradientColorStops?: (number | string)[];
}

function boundingBox(points: number[]): { minX: number; minY: number; maxX: number; maxY: number } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let index = 0; index < points.length; index += 2) {
    const x = points[index];
    const y = points[index + 1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  if (!Number.isFinite(minX)) return { minX: 0, minY: 0, maxX: 1, maxY: 1 };
  return { minX, minY, maxX, maxY };
}

function rainbowGradientStops(): (number | string)[] {
  const stops: (number | string)[] = [];
  RAINBOW_STOP_COLORS.forEach((color, index) => {
    stops.push(index / (RAINBOW_STOP_COLORS.length - 1), color);
  });
  return stops;
}

/** 도구별 질감(크레용 거친 느낌, 지우개 지우기 등)을 Konva Line에 전달할 props로 바꾼다. */
export function getStrokeShapeProps(stroke: Stroke): StrokeShapeProps {
  const isEraser = stroke.tool === "ERASER";
  const isCrayon = stroke.tool === "CRAYON";
  const isRainbow = stroke.color === RAINBOW_COLOR_ID;

  const base: StrokeShapeProps = {
    strokeWidth: stroke.width,
    opacity: stroke.opacity,
    lineCap: "round",
    lineJoin: "round",
    tension: stroke.tool === "PENCIL" ? 0.15 : 0.4,
    globalCompositeOperation: isEraser ? "destination-out" : "source-over",
  };

  if (isCrayon) {
    base.dash = [stroke.width * 0.85, stroke.width * 0.32];
  }

  if (isEraser) {
    return { ...base, stroke: "#000000" };
  }

  if (isRainbow) {
    const box = boundingBox(stroke.points);
    return {
      ...base,
      strokeLinearGradientStartPointX: box.minX,
      strokeLinearGradientStartPointY: box.minY,
      strokeLinearGradientEndPointX: box.maxX,
      strokeLinearGradientEndPointY: box.maxY,
      strokeLinearGradientColorStops: rainbowGradientStops(),
    };
  }

  return { ...base, stroke: stroke.color };
}
