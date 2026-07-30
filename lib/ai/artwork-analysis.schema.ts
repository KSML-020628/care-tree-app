import { z } from "zod";
import { containsBannedPhrase } from "@/lib/mascot/praise-messages";

export const motionPresetSchema = z.enum(["GENTLE_SWAY", "SOFT_BOUNCE", "SPARKLE", "FLOAT", "FADE_IN", "NONE"]);

export const praiseCategorySchema = z.enum(["SUBMISSION", "COLORFUL", "WARM_COLOR", "COOL_COLOR"]);

export const colorFamilySchema = z.enum([
  "RED",
  "ORANGE",
  "YELLOW",
  "GREEN",
  "BLUE",
  "PURPLE",
  "PINK",
  "BROWN",
  "BLACK",
  "MIXED",
]);

export const quadrantSchema = z.enum(["TOP_LEFT", "TOP_RIGHT", "BOTTOM_LEFT", "BOTTOM_RIGHT"]);

/**
 * AI가 돌려준 JSON을 검증한다. caption에 금지 표현이 있거나, confidence와 reviewRequired가
 * 프롬프트 규칙(확신이 낮으면 반드시 검토 필요로 표시)과 어긋나면 이 단계에서 실패시켜
 * fallback으로 넘어가게 한다 — 프롬프트 지시만으로는 AI가 규칙을 어겨도 걸러낼 방법이 없기 때문이다.
 */
export const artworkAnalysisSchema = z
  .object({
    detectedElements: z.array(z.string().max(20)).max(8),
    dominantColorFamilies: z.array(colorFamilySchema).max(6),
    motionPreset: motionPresetSchema,
    praiseCategory: praiseCategorySchema,
    caption: z
      .string()
      .min(1)
      .max(45)
      .refine((text) => !containsBannedPhrase(text), { message: "금지된 표현이 포함된 caption입니다." }),
    confidence: z.number().min(0).max(1),
    reviewRequired: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.confidence < 0.5 && !value.reviewRequired) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reviewRequired"],
        message: "confidence가 0.5 미만이면 reviewRequired는 반드시 true여야 합니다.",
      });
    }
    if (new Set(value.dominantColorFamilies).size !== value.dominantColorFamilies.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dominantColorFamilies"],
        message: "dominantColorFamilies에 같은 색상이 중복되면 안 됩니다.",
      });
    }
  });

/**
 * /api/ai/artwork-analysis 요청 본문 검증.
 * allowedMotionPresets는 일부러 받지 않는다 — 클라이언트가 보낸 목록을 그대로 믿으면 조작될 수
 * 있으므로, 서버가 themeId+quadrant로 lib/config/theme-motion-presets.ts에서만 결정한다.
 */
export const artworkAnalysisRequestSchema = z.object({
  imageDataUrl: z
    .string()
    .startsWith("data:image/")
    .max(3_500_000, { message: "이미지가 너무 커요." }),
  themeId: z.string().min(1).max(64),
  themeTitle: z.string().min(1).max(60),
  quadrant: quadrantSchema,
  zoneLabel: z.string().min(1).max(60),
});

export type ArtworkAnalysisRequestBody = z.infer<typeof artworkAnalysisRequestSchema>;
