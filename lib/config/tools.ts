import { Eraser, Paintbrush, Paintbrush2, PenLine, Pencil, Sparkles, type LucideIcon } from "lucide-react";
import type { DrawingTool } from "@/types/drawing";

export interface ToolConfig {
  id: DrawingTool;
  label: string;
  icon: LucideIcon;
  defaultWidth: number;
  opacity: number;
  /** 크레용처럼 질감이 필요한 도구를 표시한다. */
  texture?: "crayon";
}

export const TOOL_CONFIGS: readonly ToolConfig[] = [
  { id: "PENCIL", label: "연필", icon: Pencil, defaultWidth: 4, opacity: 1 },
  { id: "PEN", label: "펜", icon: PenLine, defaultWidth: 8, opacity: 1 },
  { id: "BRUSH", label: "붓", icon: Paintbrush, defaultWidth: 18, opacity: 0.92 },
  { id: "CRAYON", label: "크레용", icon: Paintbrush2, defaultWidth: 22, opacity: 0.85, texture: "crayon" },
  { id: "ERASER", label: "지우개", icon: Eraser, defaultWidth: 28, opacity: 1 },
  { id: "GLITTER", label: "반짝이 붓", icon: Sparkles, defaultWidth: 14, opacity: 1 },
] as const;

export function getToolConfig(tool: DrawingTool): ToolConfig {
  const found = TOOL_CONFIGS.find((config) => config.id === tool);
  if (!found) throw new Error(`알 수 없는 도구예요: ${tool}`);
  return found;
}
