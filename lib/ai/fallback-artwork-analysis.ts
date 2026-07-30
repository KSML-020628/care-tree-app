import type { ArtworkAnalysis, ArtworkAnalysisResponse, ColorFamily } from "./artwork-analysis.types";

/**
 * AI를 전혀 쓰지 못할 때(키 없음, 오류, timeout, 이상한 JSON 등) 항상 즉시 돌려줄 수 있는 안전한 결과.
 * 그림을 평가하지 않고, 병원/의료와 무관하며, 항상 지정된 스키마를 만족한다.
 */
export function buildFallbackAnalysis(): ArtworkAnalysis {
  return {
    detectedElements: [],
    dominantColorFamilies: ["MIXED"],
    motionPreset: "SPARKLE",
    praiseCategory: "SUBMISSION",
    caption: "친구들의 색깔이 모인 특별한 작품이에요.",
    // confidence 0은 "AI가 실제로 점수 매기지 않았다"는 뜻이라 reviewRequired도 true로 둔다.
    // (아이 화면에는 영향 없다 — FALLBACK은 isAnalysisDisplayable()에서 이 값과 무관하게 항상 그대로 보여준다.)
    confidence: 0,
    reviewRequired: true,
  };
}

export function buildFallbackResponse(): ArtworkAnalysisResponse {
  return { source: "FALLBACK", analysis: buildFallbackAnalysis() };
}

const WARM_COLOR_FAMILIES: readonly ColorFamily[] = ["RED", "ORANGE", "YELLOW", "PINK"];
const COOL_COLOR_FAMILIES: readonly ColorFamily[] = ["BLUE", "GREEN", "PURPLE"];

export function isWarmColorFamily(family: ColorFamily): boolean {
  return WARM_COLOR_FAMILIES.includes(family);
}

export function isCoolColorFamily(family: ColorFamily): boolean {
  return COOL_COLOR_FAMILIES.includes(family);
}

/** 색상 hex 값을 색상군으로 묶는다. lib/config/colors.ts의 실제 팔레트 값과 짝을 맞춘다. */
const COLOR_FAMILY_BY_HEX: Record<string, ColorFamily> = {
  "#F5473C": "RED",
  "#FF9A3D": "ORANGE",
  "#FFD84D": "YELLOW",
  "#B4E26A": "GREEN",
  "#4CAF7D": "GREEN",
  "#5FC9F0": "BLUE",
  "#536DFE": "BLUE",
  "#9C6ADE": "PURPLE",
  "#FF8FB1": "PINK",
  "#A9673F": "BROWN",
  "#2B2B2B": "BLACK",
  "#FFFFFF": "MIXED",
  "#E6B93A": "YELLOW",
  "#B9C2D0": "BLUE",
};

/**
 * AI 없이도, 아이가 실제로 고른 색(캔버스 stroke 색상)을 세어 규칙 기반으로 색상군을 추정한다.
 * 서버 API를 거치지 않는 즉시 반영용 규칙 기반 분석이며, 이미지 자체를 들여다보지 않는다.
 */
export function detectColorFamiliesFromStrokeColors(colors: readonly string[]): ColorFamily[] {
  if (colors.length === 0) return ["MIXED"];

  const counts = new Map<ColorFamily, number>();
  for (const color of colors) {
    const family = COLOR_FAMILY_BY_HEX[color.toUpperCase()] ?? "MIXED";
    counts.set(family, (counts.get(family) ?? 0) + 1);
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([family]) => family);
  return sorted.length > 0 ? sorted.slice(0, 3) : ["MIXED"];
}
