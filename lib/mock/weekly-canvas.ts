import { QUADRANTS } from "@/lib/config/quadrants";
import { createFlatTintDataUrl } from "@/lib/drawing/quadrant-crop";
import { MOCK_FRIEND_USERS } from "@/lib/mock/users";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import type { DrawingAssignment, Quadrant } from "@/types/assignment";
import type { ContributionStatus, DrawingContribution, WeeklyCanvas, WeeklyCanvasStatus } from "@/types/room";
import type { ChildUser } from "@/types/user";

/**
 * 케어햄 스케치북은 실시간 대기실이 아니라 "비동기 공동 작품"이다.
 * 그래서 여기에는 접속 상태·진행률·타이머가 전혀 없다. 캔버스는 만들어지는 순간 이미
 * ACTIVE고, 아직 아무도 채우지 않은 사분면은 미리 준비된 케어햄 색칠본으로 자연스럽게 채운다.
 *
 * 여기(주간 캔버스·기여물)만 Supabase로 옮겼다 — 여러 기기에서 같은 그림을 실제로 함께
 * 봐야 하는 부분이 바로 이 데이터이기 때문이다. 로그인·배정·해바라씨는 당분간 localStorage에
 * 그대로 둔다(README의 "아직 mock인 부분" 표 참고).
 */

const PLACEHOLDER_TINT_COLORS = ["#FFE1A8", "#C9E7FF", "#D9F2D0"];

export function buildWeeklyCanvasId(themeId: string): string {
  return `canvas-${themeId}`;
}

interface WeeklyCanvasRow {
  id: string;
  hospital_id: string;
  theme_id: string;
  status: WeeklyCanvasStatus;
  created_at: string;
}

interface DrawingContributionRow {
  id: string;
  weekly_canvas_id: string;
  participant_id: string;
  nickname: string;
  avatar: string;
  quadrant: Quadrant;
  status: ContributionStatus;
  image_data_url: string | null;
  thumbnail: string | null;
  is_placeholder: boolean;
  shared_at: string | null;
}

function toWeeklyCanvas(row: WeeklyCanvasRow): WeeklyCanvas {
  return {
    id: row.id,
    hospitalId: row.hospital_id,
    themeId: row.theme_id,
    status: row.status,
    createdAt: row.created_at,
  };
}

function toDrawingContribution(row: DrawingContributionRow): DrawingContribution {
  return {
    id: row.id,
    weeklyCanvasId: row.weekly_canvas_id,
    participantId: row.participant_id,
    nickname: row.nickname,
    avatar: row.avatar,
    quadrant: row.quadrant,
    status: row.status,
    imageDataUrl: row.image_data_url ?? undefined,
    thumbnail: row.thumbnail ?? undefined,
    isPlaceholder: row.is_placeholder,
    sharedAt: row.shared_at ?? undefined,
  };
}

function warnIfNotConfigured(action: string): void {
  if (isSupabaseConfigured) return;
  console.warn(
    `[weekly-canvas] Supabase 환경변수(NEXT_PUBLIC_SUPABASE_URL/ANON_KEY)가 없어 "${action}"을(를) 건너뜁니다.`,
  );
}

/** 이 주의 공동 캔버스를 가져오거나, 없으면 새로 만든다. */
export async function getOrCreateWeeklyCanvas(
  currentUser: ChildUser,
  assignment: DrawingAssignment,
): Promise<WeeklyCanvas> {
  const existing = await readWeeklyCanvas(assignment.roomId);
  if (existing) return existing;

  warnIfNotConfigured("주간 캔버스 생성");
  const row: WeeklyCanvasRow = {
    id: assignment.roomId,
    hospital_id: currentUser.hospitalId,
    theme_id: assignment.themeId,
    status: "ACTIVE",
    created_at: new Date().toISOString(),
  };

  // 여러 아이가 거의 동시에 이 주 첫 캔버스를 만들 수도 있으니, 이미 누가 먼저 만들었으면 그걸 그대로 쓴다.
  const { error } = await supabase.from("weekly_canvases").upsert(row, { ignoreDuplicates: true });
  if (error) console.error("[weekly-canvas] 캔버스 생성 실패:", error.message);

  const canvas = (await readWeeklyCanvas(assignment.roomId)) ?? toWeeklyCanvas(row);
  await seedPlaceholderContributions(canvas.id, assignment.quadrant);
  return canvas;
}

export async function readWeeklyCanvas(weeklyCanvasId: string): Promise<WeeklyCanvas | null> {
  if (!isSupabaseConfigured) {
    warnIfNotConfigured("주간 캔버스 조회");
    return null;
  }
  const { data, error } = await supabase.from("weekly_canvases").select("*").eq("id", weeklyCanvasId).maybeSingle();
  if (error) {
    console.error("[weekly-canvas] 캔버스 조회 실패:", error.message);
    return null;
  }
  return data ? toWeeklyCanvas(data) : null;
}

/** 지금까지 만들어진 모든 주간 캔버스를 최신순으로 돌려준다. 작품 보관함 목록에서 쓴다. */
export async function listWeeklyCanvases(): Promise<WeeklyCanvas[]> {
  if (!isSupabaseConfigured) {
    warnIfNotConfigured("주간 캔버스 목록 조회");
    return [];
  }
  const { data, error } = await supabase.from("weekly_canvases").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("[weekly-canvas] 캔버스 목록 조회 실패:", error.message);
    return [];
  }
  return (data ?? []).map(toWeeklyCanvas);
}

export async function readContributions(weeklyCanvasId: string): Promise<DrawingContribution[]> {
  if (!isSupabaseConfigured) {
    warnIfNotConfigured("기여물 조회");
    return [];
  }
  const { data, error } = await supabase
    .from("drawing_contributions")
    .select("*")
    .eq("weekly_canvas_id", weeklyCanvasId);
  if (error) {
    console.error("[weekly-canvas] 기여물 조회 실패:", error.message);
    return [];
  }
  return (data ?? []).map(toDrawingContribution);
}

async function saveContribution(contribution: DrawingContribution): Promise<DrawingContribution> {
  const row = {
    id: contribution.id,
    weekly_canvas_id: contribution.weeklyCanvasId,
    participant_id: contribution.participantId,
    nickname: contribution.nickname,
    avatar: contribution.avatar,
    quadrant: contribution.quadrant,
    status: contribution.status,
    image_data_url: contribution.imageDataUrl ?? null,
    thumbnail: contribution.thumbnail ?? null,
    is_placeholder: contribution.isPlaceholder ?? false,
    shared_at: contribution.sharedAt ?? null,
  };
  // id가 weeklyCanvasId+quadrant로 정해지므로(아래), 같은 자리에 다시 저장하면 기존 값(placeholder
  // 포함)을 자연스럽게 덮어쓴다 — 기본 upsert 충돌 기준(기본키 id)을 그대로 쓴다.
  const { data, error } = await supabase.from("drawing_contributions").upsert(row).select().single();
  if (error || !data) throw new Error(error?.message ?? "기여물을 저장하지 못했어요.");
  return toDrawingContribution(data);
}

/**
 * 아직 아무도 채우지 않은 나머지 사분면을 미리 준비된 케어햄 색칠본으로 채운다.
 * 실제 다른 병원 아이가 참여하기 전까지 화면이 텅 비어 보이지 않게 하는 자리표시자이며,
 * 화면에는 "이미 공유된 사분면"으로만 자연스럽게 표시하고 참여 여부를 강조하지 않는다.
 */
async function seedPlaceholderContributions(weeklyCanvasId: string, excludeQuadrant: Quadrant): Promise<void> {
  const remainingQuadrants = QUADRANTS.filter((quadrant) => quadrant !== excludeQuadrant);
  const existingContributions = await readContributions(weeklyCanvasId);

  const rows = remainingQuadrants
    .filter((quadrant) => !existingContributions.some((item) => item.quadrant === quadrant))
    .map((quadrant, index) => {
      const friend = MOCK_FRIEND_USERS[index % MOCK_FRIEND_USERS.length];
      const tint = PLACEHOLDER_TINT_COLORS[index % PLACEHOLDER_TINT_COLORS.length];
      const tintedImage = createFlatTintDataUrl(tint, 0.4);
      return {
        id: `contribution-${weeklyCanvasId}-${quadrant}`,
        weekly_canvas_id: weeklyCanvasId,
        participant_id: friend.id,
        nickname: friend.nickname,
        avatar: friend.avatar,
        quadrant,
        status: "SHARED" as const,
        image_data_url: tintedImage,
        thumbnail: tintedImage,
        is_placeholder: true,
        shared_at: new Date().toISOString(),
      };
    });

  if (rows.length === 0) return;
  // 이미 실제로 채워진 자리는 절대 덮어쓰지 않는다(ignoreDuplicates) — 동시에 여러 명이 들어와도 안전하다.
  const { error } = await supabase.from("drawing_contributions").upsert(rows, { ignoreDuplicates: true });
  if (error) console.error("[weekly-canvas] placeholder 생성 실패:", error.message);
}

/** 아이가 자기 사분면을 우리 그림에 공유(제출)한다. */
export async function shareContribution(
  weeklyCanvasId: string,
  participant: ChildUser,
  quadrant: Quadrant,
  imageDataUrl: string,
): Promise<DrawingContribution> {
  warnIfNotConfigured("그림 제출");
  const contribution: DrawingContribution = {
    id: `contribution-${weeklyCanvasId}-${quadrant}`,
    weeklyCanvasId,
    participantId: participant.id,
    nickname: participant.nickname,
    avatar: participant.avatar,
    quadrant,
    status: "SHARED",
    imageDataUrl,
    thumbnail: imageDataUrl,
    sharedAt: new Date().toISOString(),
  };
  return saveContribution(contribution);
}

/** 특정 기여물에 나중에(예: AI 분석 뒤) 썸네일만 업데이트하고 싶을 때 쓴다. */
export async function updateContributionThumbnail(
  weeklyCanvasId: string,
  quadrant: Quadrant,
  thumbnail: string,
): Promise<void> {
  const { error } = await supabase
    .from("drawing_contributions")
    .update({ thumbnail })
    .eq("weekly_canvas_id", weeklyCanvasId)
    .eq("quadrant", quadrant);
  if (error) console.error("[weekly-canvas] 썸네일 업데이트 실패:", error.message);
}
