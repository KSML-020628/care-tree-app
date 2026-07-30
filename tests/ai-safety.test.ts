import { describe, expect, it } from "vitest";
import { artworkAnalysisRequestSchema, artworkAnalysisSchema } from "@/lib/ai/artwork-analysis.schema";
import { buildFallbackResponse } from "@/lib/ai/fallback-artwork-analysis";
import { getAllowedMotionPresets } from "@/lib/config/theme-motion-presets";
import { PRAISE_MESSAGES, containsBannedPhrase, getRandomPraise } from "@/lib/mascot/praise-messages";

const validAnalysis = {
  detectedElements: ["사과"],
  dominantColorFamilies: ["RED"],
  motionPreset: "SPARKLE",
  praiseCategory: "SUBMISSION",
  caption: "빨간 사과가 함께 있어요.",
  confidence: 0.8,
  reviewRequired: false,
};

describe("AI 응답 검증(잘못된 응답은 fallback으로 넘어가야 한다)", () => {
  it("정상 JSON은 통과한다", () => {
    expect(artworkAnalysisSchema.safeParse(validAnalysis).success).toBe(true);
  });

  it("필드 누락이나 타입 오류가 있으면 실패한다", () => {
    expect(artworkAnalysisSchema.safeParse({}).success).toBe(false);
    expect(artworkAnalysisSchema.safeParse({ ...validAnalysis, confidence: "높음" }).success).toBe(false);
    expect(artworkAnalysisSchema.safeParse({ ...validAnalysis, motionPreset: "EXPLODE" }).success).toBe(false);
  });

  it("caption에 금지 표현이 있으면 검증에 실패한다", () => {
    const result = artworkAnalysisSchema.safeParse({ ...validAnalysis, caption: "최고야! 완벽해!" });
    expect(result.success).toBe(false);
  });

  it("confidence가 0.5 미만인데 reviewRequired가 false면 검증에 실패한다", () => {
    const result = artworkAnalysisSchema.safeParse({ ...validAnalysis, confidence: 0.2, reviewRequired: false });
    expect(result.success).toBe(false);
  });

  it("confidence가 0.5 미만이어도 reviewRequired가 true면 통과한다", () => {
    const result = artworkAnalysisSchema.safeParse({ ...validAnalysis, confidence: 0.2, reviewRequired: true });
    expect(result.success).toBe(true);
  });

  it("dominantColorFamilies에 같은 색상이 중복되면 검증에 실패한다", () => {
    const result = artworkAnalysisSchema.safeParse({ ...validAnalysis, dominantColorFamilies: ["RED", "RED"] });
    expect(result.success).toBe(false);
  });

  it("fallback 응답은 항상 스키마를 만족하고 source가 FALLBACK이다", () => {
    const fallback = buildFallbackResponse();
    expect(fallback.source).toBe("FALLBACK");
    expect(artworkAnalysisSchema.safeParse(fallback.analysis).success).toBe(true);
  });

  it("요청에 등록번호·실명 같은 개인정보 필드를 몰래 끼워 넣어도 결과에서 제거된다", () => {
    const parsed = artworkAnalysisRequestSchema.safeParse({
      imageDataUrl: "data:image/png;base64,AAAA",
      themeId: "theme-tree-001",
      themeTitle: "나무",
      quadrant: "TOP_LEFT",
      zoneLabel: "그림 왼쪽 위",
      registrationNumber: "123456",
      realName: "홍길동",
      roomNumber: "302호",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).not.toHaveProperty("registrationNumber");
      expect(parsed.data).not.toHaveProperty("realName");
      expect(parsed.data).not.toHaveProperty("roomNumber");
    }
  });

  it("허용되지 않은 사분면 값은 요청 검증에서 걸러진다", () => {
    const parsed = artworkAnalysisRequestSchema.safeParse({
      imageDataUrl: "data:image/png;base64,AAAA",
      themeId: "theme-tree-001",
      themeTitle: "나무",
      quadrant: "CENTER",
      zoneLabel: "가운데",
    });
    expect(parsed.success).toBe(false);
  });

  it("클라이언트가 allowedMotionPresets를 보내도 무시되고 요청 검증을 통과한다(서버가 직접 정한다)", () => {
    const parsed = artworkAnalysisRequestSchema.safeParse({
      imageDataUrl: "data:image/png;base64,AAAA",
      themeId: "theme-tree-001",
      themeTitle: "나무",
      quadrant: "TOP_LEFT",
      zoneLabel: "그림 왼쪽 위",
      allowedMotionPresets: ["GENTLE_SWAY", "SOFT_BOUNCE", "SPARKLE", "FLOAT", "FADE_IN", "NONE"],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).not.toHaveProperty("allowedMotionPresets");
    }
  });
});

describe("사분면별 허용 애니메이션은 서버 설정에서만 정해진다(클라이언트 값을 신뢰하지 않는다)", () => {
  it("등록된 주제+사분면은 정해진 목록을 돌려준다", () => {
    expect(getAllowedMotionPresets("theme-tree-001", "BOTTOM_LEFT")).toEqual(["FADE_IN", "SPARKLE", "NONE"]);
  });

  it("등록되지 않은 주제는 보수적인 기본값으로 대체한다", () => {
    expect(getAllowedMotionPresets("unknown-theme", "TOP_LEFT")).toEqual(["FADE_IN", "SPARKLE", "NONE"]);
  });
});

describe("칭찬 문구는 항상 사전 검수된 문장 풀 안에서만 나온다", () => {
  it("SUBMISSION 카테고리를 여러 번 뽑아도 풀 밖의 문장은 나오지 않는다", () => {
    for (let i = 0; i < 50; i += 1) {
      const message = getRandomPraise("SUBMISSION");
      expect(PRAISE_MESSAGES.SUBMISSION).toContain(message);
    }
  });

  it("모든 사전 정의 칭찬 문구에는 금지 표현이 없다", () => {
    for (const messages of Object.values(PRAISE_MESSAGES)) {
      for (const message of messages) {
        expect(containsBannedPhrase(message)).toBe(false);
      }
    }
  });
});
