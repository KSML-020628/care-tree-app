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

/** AI가 돌려준 JSON을 검증한다. caption에 금지 표현이 있으면 이 단계에서 실패시켜 fallback으로 넘어가게 한다. */
export const artworkAnalysisSchema = z.object({
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
});

/** /api/ai/artwork-analysis 요청 본문 검증. */
export const artworkAnalysisRequestSchema = z.object({
  imageDataUrl: z
    .string()
    .startsWith("data:image/")
    .max(3_500_000, { message: "이미지가 너무 커요." }),
  themeId: z.string().min(1).max(64),
  themeTitle: z.string().min(1).max(60),
  quadrant: quadrantSchema,
  zoneLabel: z.string().min(1).max(60),
  allowedMotionPresets: z.array(motionPresetSchema).min(1).max(6),
});

export type ArtworkAnalysisRequestBody = z.infer<typeof artworkAnalysisRequestSchema>;
