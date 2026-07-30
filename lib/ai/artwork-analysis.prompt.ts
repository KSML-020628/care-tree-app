import type { ArtworkAnalysisInput } from "./artwork-analysis.types";

/**
 * AI의 역할과 절대 하면 안 되는 일을 명시한다. 이 문구는 코드에서만 관리하고
 * 아동 화면에는 절대 그대로 노출하지 않는다.
 */
export const ARTWORK_ANALYSIS_SYSTEM_PROMPT = `
너는 미취학 아동이 색칠한 그림에서 눈에 보이는 색상과 사물을 매우 보수적으로 기술하고,
허용된 애니메이션과 칭찬 카테고리를 선택하는 작품 분석기다.

반드시 지켜야 할 규칙:
- 미술적 품질을 평가하지 말 것 (잘함/못함/완성도를 언급하지 말 것)
- 발달 수준을 평가하지 말 것
- 감정 상태를 추론하지 말 것
- 정신건강 상태를 추론하지 말 것
- 의료적 의미를 부여하지 말 것
- 어두운 색을 슬픔으로 해석하지 말 것
- 빨간색을 분노로 해석하지 말 것
- 선의 세기나 형태를 심리 상태와 연결하지 말 것
- 보이는 요소를 확신할 수 없으면 detectedElements를 빈 배열로 둘 것
- caption은 한국어 한 문장, 최대 45자
- "잘했다", "못했다", "최고", "완벽", "1등" 같은 평가·비교 표현을 쓰지 말 것
- 그림에 실제로 보이는 요소와 색만 언급할 것 (추측해서 지어내지 말 것)
- confidence가 낮으면(0.5 미만) reviewRequired를 true로 설정할 것
- 결과는 반드시 지정된 JSON 스키마로만 반환하고, 그 외의 설명 문장을 덧붙이지 말 것
`.trim();

export function buildArtworkAnalysisUserPrompt(
  input: Pick<ArtworkAnalysisInput, "themeTitle" | "zoneLabel" | "allowedMotionPresets">,
): string {
  return `
주제: ${input.themeTitle}
이 그림 조각의 위치 설명: ${input.zoneLabel}

motionPreset은 다음 중 하나만 선택하세요: ${input.allowedMotionPresets.join(", ")}
praiseCategory는 다음 중 하나만 선택하세요: SUBMISSION, COLORFUL, WARM_COLOR, COOL_COLOR

첨부된 이미지는 원래 선 그림(사물의 윤곽) 위에 아이가 색칠을 더한 그림 조각입니다.
이 그림에서 실제로 보이는 사물과 색상만 근거로, 지정된 JSON 스키마에 맞춰 응답하세요.
`.trim();
}

/** OpenAI Structured Outputs(response_format: json_schema)에 그대로 넘기는 JSON Schema. */
export const ARTWORK_ANALYSIS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    detectedElements: {
      type: "array",
      items: { type: "string" },
      maxItems: 8,
    },
    dominantColorFamilies: {
      type: "array",
      items: {
        type: "string",
        enum: ["RED", "ORANGE", "YELLOW", "GREEN", "BLUE", "PURPLE", "PINK", "BROWN", "BLACK", "MIXED"],
      },
      maxItems: 6,
    },
    motionPreset: {
      type: "string",
      enum: ["GENTLE_SWAY", "SOFT_BOUNCE", "SPARKLE", "FLOAT", "FADE_IN", "NONE"],
    },
    praiseCategory: {
      type: "string",
      enum: ["SUBMISSION", "COLORFUL", "WARM_COLOR", "COOL_COLOR"],
    },
    caption: { type: "string" },
    confidence: { type: "number" },
    reviewRequired: { type: "boolean" },
  },
  required: [
    "detectedElements",
    "dominantColorFamilies",
    "motionPreset",
    "praiseCategory",
    "caption",
    "confidence",
    "reviewRequired",
  ],
} as const;
