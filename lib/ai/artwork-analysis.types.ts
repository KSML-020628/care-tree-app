import type { Quadrant } from "@/types/assignment";

export type MotionPreset = "GENTLE_SWAY" | "SOFT_BOUNCE" | "SPARKLE" | "FLOAT" | "FADE_IN" | "NONE";

export type PraiseCategory = "SUBMISSION" | "COLORFUL" | "WARM_COLOR" | "COOL_COLOR";

export type ColorFamily =
  | "RED"
  | "ORANGE"
  | "YELLOW"
  | "GREEN"
  | "BLUE"
  | "PURPLE"
  | "PINK"
  | "BROWN"
  | "BLACK"
  | "MIXED";

export interface ArtworkAnalysis {
  detectedElements: string[];
  dominantColorFamilies: ColorFamily[];
  motionPreset: MotionPreset;
  praiseCategory: PraiseCategory;
  /** 한국어 한 문장, 최대 45자. 평가·감정 추론·의료적 언급을 하지 않는다. */
  caption: string;
  confidence: number;
  reviewRequired: boolean;
}

export type ArtworkAnalysisSource = "AI" | "FALLBACK";

export interface ArtworkAnalysisResponse {
  source: ArtworkAnalysisSource;
  analysis: ArtworkAnalysis;
}

/**
 * AI에게 보내는 정보는 딱 이만큼뿐이다. 실명·등록번호·병실·진단 등 개인정보 필드는
 * 애초에 이 타입에 존재하지 않으므로, 실수로라도 함께 보낼 수 없다.
 */
export interface ArtworkAnalysisInput {
  imageDataUrl: string;
  themeId: string;
  themeTitle: string;
  quadrant: Quadrant;
  zoneLabel: string;
  allowedMotionPresets: MotionPreset[];
}

export interface ArtworkAnalysisService {
  analyze(input: ArtworkAnalysisInput): Promise<ArtworkAnalysisResponse>;
}
