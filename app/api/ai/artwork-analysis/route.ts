import { NextResponse, type NextRequest } from "next/server";
import { artworkAnalysisRequestSchema } from "@/lib/ai/artwork-analysis.schema";
import { buildFallbackResponse } from "@/lib/ai/fallback-artwork-analysis";
import { QUADRANT_ZONE_LABELS } from "@/lib/config/quadrants";
import { getAllowedMotionPresets } from "@/lib/config/theme-motion-presets";
import { WEEKLY_THEMES } from "@/lib/config/themes";

export const runtime = "nodejs";

const ALLOWED_IMAGE_MIME = ["image/png", "image/webp"];
/** data URL 문자열 길이 상한(대략 2.5MB 원본 이미지 기준, base64 팽창 포함). */
const MAX_IMAGE_DATA_URL_LENGTH = 3_500_000;

/**
 * 아이가 색칠한 그림 조각을 분석해 캡션·애니메이션·칭찬 카테고리를 돌려준다.
 * 어떤 오류가 나도(키 없음, timeout, 이상한 JSON, 허용 안 된 주제 등) 500을 던지지 않고
 * 안전한 fallback 분석 결과를 200으로 돌려준다 — 그림 제출 흐름을 절대 막지 않기 위해서다.
 */
export async function POST(request: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    logIssue("INVALID_JSON_BODY");
    return NextResponse.json(buildFallbackResponse());
  }

  const parsed = artworkAnalysisRequestSchema.safeParse(rawBody);
  if (!parsed.success) {
    logIssue("INVALID_REQUEST_SHAPE");
    return NextResponse.json(buildFallbackResponse());
  }

  const { imageDataUrl, themeId, themeTitle, quadrant } = parsed.data;

  const mime = imageDataUrl.match(/^data:([^;]+);base64,/)?.[1];
  if (!mime || !ALLOWED_IMAGE_MIME.includes(mime)) {
    logIssue("UNSUPPORTED_IMAGE_TYPE");
    return NextResponse.json(buildFallbackResponse());
  }
  if (imageDataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
    logIssue("IMAGE_TOO_LARGE");
    return NextResponse.json(buildFallbackResponse());
  }

  const knownTheme = WEEKLY_THEMES.some((theme) => theme.id === themeId);
  if (!knownTheme) {
    logIssue("UNKNOWN_THEME_ID");
    return NextResponse.json(buildFallbackResponse());
  }

  try {
    // 동적 import: OpenAI SDK와 "server-only" 표시가 있는 모듈을 요청이 올 때만 불러온다.
    const { artworkAnalysisService } = await import("@/lib/ai");
    const result = await artworkAnalysisService.analyze({
      imageDataUrl,
      themeId,
      themeTitle,
      quadrant,
      // 클라이언트가 보낸 자유 텍스트 대신, 서버가 아는 고정 표현만 프롬프트에 넣는다.
      zoneLabel: QUADRANT_ZONE_LABELS[quadrant],
      // 클라이언트가 보낸 허용 목록도 신뢰하지 않고, 서버가 themeId+quadrant로 직접 정한다.
      allowedMotionPresets: getAllowedMotionPresets(themeId, quadrant),
    });
    return NextResponse.json(result);
  } catch (error) {
    logIssue(error instanceof Error ? error.message : "UNKNOWN_ERROR");
    return NextResponse.json(buildFallbackResponse());
  }
}

/** 요청 본문이나 이미지 원문은 절대 남기지 않고, 오류 코드와 시간만 남긴다. */
function logIssue(code: string): void {
  console.error(`[api/ai/artwork-analysis] ${code} at=${new Date().toISOString()}`);
}
