import { create } from "zustand";
import type { ArtworkAnalysisResponse } from "@/lib/ai/artwork-analysis.types";
import { STORAGE_KEYS, readJson, writeJson } from "@/lib/storage/local-storage";

interface AiState {
  /** 기여물 id -> 분석 결과. AI 원본 요청/이미지는 저장하지 않고, 결과 메타데이터만 둔다. */
  analyses: Record<string, ArtworkAnalysisResponse>;
  setAnalysis: (contributionId: string, response: ArtworkAnalysisResponse) => void;
  loadAnalysis: (contributionId: string) => ArtworkAnalysisResponse | undefined;
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
}));
