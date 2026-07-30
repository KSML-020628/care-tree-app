import { beforeEach, describe, expect, it } from "vitest";
import type { ArtworkAnalysisResponse } from "@/lib/ai/artwork-analysis.types";
import { useAiStore } from "@/lib/store/ai-store";
import { STORAGE_KEYS, writeJson } from "@/lib/storage/local-storage";

function buildAnalysis(caption: string): ArtworkAnalysisResponse {
  return {
    source: "AI",
    analysis: {
      detectedElements: ["사과"],
      dominantColorFamilies: ["RED"],
      motionPreset: "SPARKLE",
      praiseCategory: "COLORFUL",
      caption,
      confidence: 0.9,
      reviewRequired: false,
    },
  };
}

describe("useAiStore.hydrateAnalyses", () => {
  beforeEach(() => {
    window.localStorage.clear();
    useAiStore.setState({ analyses: {} });
  });

  it("새로고침으로 메모리가 비어 있어도 localStorage에 남은 분석 결과를 복원한다", () => {
    const response = buildAnalysis("빨간 사과가 보여요.");
    writeJson(STORAGE_KEYS.artworkAnalysis("contribution-1"), response);

    expect(useAiStore.getState().analyses["contribution-1"]).toBeUndefined();

    useAiStore.getState().hydrateAnalyses(["contribution-1"]);

    expect(useAiStore.getState().analyses["contribution-1"]).toEqual(response);
  });

  it("이미 메모리에 있는 항목은 localStorage 값으로 덮어쓰지 않는다", () => {
    const original = buildAnalysis("원래 캡션");
    useAiStore.getState().setAnalysis("contribution-2", original);

    // localStorage만 다른 값으로 바뀐 상황을 흉내낸다(다른 탭 등).
    writeJson(STORAGE_KEYS.artworkAnalysis("contribution-2"), buildAnalysis("다른 캡션"));

    useAiStore.getState().hydrateAnalyses(["contribution-2"]);

    expect(useAiStore.getState().analyses["contribution-2"]).toEqual(original);
  });

  it("localStorage에도 없는 id는 조용히 무시한다", () => {
    expect(() => useAiStore.getState().hydrateAnalyses(["never-submitted"])).not.toThrow();
    expect(useAiStore.getState().analyses["never-submitted"]).toBeUndefined();
  });
});
