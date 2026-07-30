import "server-only";
import { requestArtworkAnalysisFromOpenAI } from "./artwork-analysis.client";
import { buildFallbackResponse } from "./fallback-artwork-analysis";
import type { ArtworkAnalysisInput, ArtworkAnalysisResponse, ArtworkAnalysisService } from "./artwork-analysis.types";

/**
 * 이 파일은 서버(Route Handler)에서만 import한다. artwork-analysis.client.ts를 통해
 * "server-only"를 물려받으므로, 클라이언트 컴포넌트에서 실수로 import하면 빌드가 실패한다.
 * 클라이언트에서 필요한 타입·규칙 기반 유틸은 각 파일(artwork-analysis.types.ts,
 * fallback-artwork-analysis.ts)에서 직접 import한다.
 */
class OpenAiArtworkAnalysisService implements ArtworkAnalysisService {
  async analyze(input: ArtworkAnalysisInput): Promise<ArtworkAnalysisResponse> {
    try {
      const analysis = await requestArtworkAnalysisFromOpenAI(input);
      return { source: "AI", analysis };
    } catch (error) {
      logAnalysisFailure(error);
      return buildFallbackResponse();
    }
  }
}

function logAnalysisFailure(error: unknown): void {
  const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
  // 이미지 원문이나 개인정보는 절대 남기지 않고, 오류 코드와 시간만 남긴다.
  console.error(`[artwork-analysis] fallback 사용 - code=${code} at=${new Date().toISOString()}`);
}

export const artworkAnalysisService: ArtworkAnalysisService = new OpenAiArtworkAnalysisService();

export type {
  ArtworkAnalysis,
  ArtworkAnalysisInput,
  ArtworkAnalysisResponse,
  ArtworkAnalysisService,
  ColorFamily,
  MotionPreset,
  PraiseCategory,
} from "./artwork-analysis.types";
