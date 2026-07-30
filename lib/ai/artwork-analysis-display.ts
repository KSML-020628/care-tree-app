import type { ArtworkAnalysisResponse } from "./artwork-analysis.types";

/**
 * 화면에 AI 결과(캡션·모션)를 보여줘도 되는지 판단한다.
 * FALLBACK은 애초에 규칙 기반 고정값이라 confidence가 의미 없으므로 항상 그대로 보여준다.
 * 실제 AI 결과는 확신이 낮거나(0.5 미만) 검토가 필요하다고 표시된 경우, 아이 화면에는
 * 노출하지 않고 기본 상태(motion 없음·캡션 없음)로 대체한다.
 */
export function isAnalysisDisplayable(response: ArtworkAnalysisResponse | undefined): boolean {
  if (!response) return false;
  if (response.source === "FALLBACK") return true;
  return response.analysis.confidence >= 0.5 && !response.analysis.reviewRequired;
}
