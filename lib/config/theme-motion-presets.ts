import type { MotionPreset } from "@/lib/ai/artwork-analysis.types";
import type { Quadrant } from "@/types/assignment";

/**
 * 사분면마다 도안 속 내용이 달라서(위쪽은 나뭇잎·구름, 아래쪽은 기둥·울타리 등),
 * 허용할 애니메이션도 사분면별로 다르게 두는 게 더 자연스럽다.
 * 클라이언트가 보낸 값을 그대로 믿으면 조작될 수 있으므로, 항상 서버가 themeId+quadrant로
 * 이 표에서만 골라서 AI 프롬프트에 넣는다.
 */
export const THEME_MOTION_PRESETS: Record<string, Record<Quadrant, MotionPreset[]>> = {
  "theme-tree-001": {
    TOP_LEFT: ["GENTLE_SWAY", "FLOAT", "SPARKLE", "FADE_IN", "NONE"],
    TOP_RIGHT: ["GENTLE_SWAY", "FLOAT", "SPARKLE", "FADE_IN", "NONE"],
    BOTTOM_LEFT: ["FADE_IN", "SPARKLE", "NONE"],
    BOTTOM_RIGHT: ["FADE_IN", "SPARKLE", "NONE"],
  },
};

/** 등록되지 않은 주제라면 가장 보수적인(움직임이 작은) 기본값만 허용한다. */
const DEFAULT_ALLOWED_MOTION_PRESETS: MotionPreset[] = ["FADE_IN", "SPARKLE", "NONE"];

export function getAllowedMotionPresets(themeId: string, quadrant: Quadrant): MotionPreset[] {
  return THEME_MOTION_PRESETS[themeId]?.[quadrant] ?? DEFAULT_ALLOWED_MOTION_PRESETS;
}
