import { useEffect } from "react";
import { create } from "zustand";
import type { ArtworkAnalysisResponse } from "@/lib/ai/artwork-analysis.types";
import { STORAGE_KEYS, readJson, writeJson } from "@/lib/storage/local-storage";

interface AiState {
  /** 기여물 id -> 분석 결과. AI 원본 요청/이미지는 저장하지 않고, 결과 메타데이터만 둔다. */
  analyses: Record<string, ArtworkAnalysisResponse>;
  setAnalysis: (contributionId: string, response: ArtworkAnalysisResponse) => void;
  loadAnalysis: (contributionId: string) => ArtworkAnalysisResponse | undefined;
  hydrateAnalyses: (contributionIds: string[]) => void;
}

export const useAiStore = create<AiState>((set, get) => ({
  analyses: {},

  setAnalysis: (contributionId, response) => {
    writeJson(STORAGE_KEYS.artworkAnalysis(contributionId), response);
    set((state) => ({ analyses: { ...state.analyses, [contributionId]: response } }));
  },

  loadAnalysis: (contributionId) => {
    const cached = get().analyses[contributionId];
    if (cached) return cached;
    const stored = readJson<ArtworkAnalysisResponse>(STORAGE_KEYS.artworkAnalysis(contributionId));
    if (stored) set((state) => ({ analyses: { ...state.analyses, [contributionId]: stored } }));
    return stored ?? undefined;
  },

  /**
   * 새로고침 등으로 zustand 메모리가 비어 있어도, localStorage에 남아 있는 분석 결과를 한 번에 복원한다.
   * 이미 메모리에 있는 항목은 다시 읽지 않는다. 갤러리·결과 화면 진입 시 호출해야 캡션/애니메이션이 유지된다.
   */
  hydrateAnalyses: (contributionIds) => {
    const { analyses } = get();
    const additions: Record<string, ArtworkAnalysisResponse> = {};
    for (const id of contributionIds) {
      if (analyses[id]) continue;
      const stored = readJson<ArtworkAnalysisResponse>(STORAGE_KEYS.artworkAnalysis(id));
      if (stored) additions[id] = stored;
    }
    if (Object.keys(additions).length > 0) {
      set((state) => ({ analyses: { ...state.analyses, ...additions } }));
    }
  },
}));

/**
 * 공동 작품 화면·갤러리처럼 여러 곳에서 같은 hydrate가 필요해서 공용 훅으로 뽑았다.
 * 화면에 보이는 기여물 id 목록만 넘기면, 메모리에 없는 것만 localStorage에서 채워 넣는다.
 */
export function useHydratedAnalyses(contributionIds: string[]): Record<string, ArtworkAnalysisResponse> {
  const analyses = useAiStore((state) => state.analyses);
  const hydrateAnalyses = useAiStore((state) => state.hydrateAnalyses);
  const key = contributionIds.join(",");

  useEffect(() => {
    if (!key) return;
    hydrateAnalyses(key.split(","));
  }, [key, hydrateAnalyses]);

  return analyses;
}
