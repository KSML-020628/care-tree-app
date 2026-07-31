/**
 * 프로필 그림을 다듬는 선택적 정제 단계(투명 배경 만들기·가장자리 정리·노이즈 제거)의 자리다.
 * 지금은 실제 이미지 생성/편집 AI를 연결하지 않았다 — 이 프로젝트에 이미 붙어 있는 OpenAI
 * 연동(lib/ai/*)은 "그림을 보고 글로 설명하는" 용도이고, "그림 자체를 다시 그려주는" 종류의
 * 모델이 아니라서 그대로 재사용할 수 없다. 그래서 항상 원본을 그대로 쓰는 통과(passthrough)
 * 구현만 두고, 나중에 실제 이미지 정제 API가 생기면 이 함수 내부만 바꾸면 된다.
 *
 * 무엇을 쓰든 아이 그림의 핵심 형태(눈·팔다리 등)를 임의로 바꾸거나 채점하지 않는다 — 온보딩이
 * AI 실패로 멈추면 안 되므로, 실패할 수 있는 경로 자체를 만들지 않았다(항상 성공한다).
 */
export interface AvatarProcessingResult {
  source: "AI" | "ORIGINAL";
  originalImageUrl: string;
  displayImageUrl: string;
  processingApplied: Array<"BACKGROUND_REMOVAL" | "EDGE_CLEANUP" | "NOISE_REDUCTION">;
}

export async function processAvatarImage(originalImageUrl: string): Promise<AvatarProcessingResult> {
  return {
    source: "ORIGINAL",
    originalImageUrl,
    displayImageUrl: originalImageUrl,
    processingApplied: [],
  };
}
