import { QUADRANTS } from "@/lib/config/quadrants";
import { createFlatTintDataUrl } from "@/lib/drawing/quadrant-crop";
import { MOCK_FRIEND_USERS } from "@/lib/mock/users";
import { STORAGE_KEYS, readJson, writeJson } from "@/lib/storage/local-storage";
import type { DrawingAssignment, Quadrant } from "@/types/assignment";
import type { DrawingContribution, WeeklyCanvas } from "@/types/room";
import type { ChildUser } from "@/types/user";

/**
 * 케어햄 스케치북은 실시간 대기실이 아니라 "비동기 공동 작품"이다.
 * 그래서 여기에는 접속 상태·진행률·타이머가 전혀 없다. 캔버스는 만들어지는 순간 이미
 * ACTIVE고, 아직 아무도 채우지 않은 사분면은 미리 준비된 케어햄 색칠본으로 자연스럽게 채운다.
 */

const PLACEHOLDER_TINT_COLORS = ["#FFE1A8", "#C9E7FF", "#D9F2D0"];

export function buildWeeklyCanvasId(themeId: string): string {
  return `canvas-${themeId}`;
}

/** 이 주의 공동 캔버스를 가져오거나, 없으면 새로 만든다. */
export function getOrCreateWeeklyCanvas(currentUser: ChildUser, assignment: DrawingAssignment): WeeklyCanvas {
  const key = STORAGE_KEYS.weeklyCanvas(assignment.roomId);
  const existing = readJson<WeeklyCanvas>(key);
  if (existing) return existing;

  const canvas: WeeklyCanvas = {
    id: assignment.roomId,
    hospitalId: currentUser.hospitalId,
    themeId: assignment.themeId,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };
  writeJson(key, canvas);
  seedPlaceholderContributions(canvas.id, assignment.quadrant);
  return canvas;
}

export function readWeeklyCanvas(weeklyCanvasId: string): WeeklyCanvas | null {
  return readJson<WeeklyCanvas>(STORAGE_KEYS.weeklyCanvas(weeklyCanvasId));
}

export function readContributions(weeklyCanvasId: string): DrawingContribution[] {
  return readJson<DrawingContribution[]>(STORAGE_KEYS.contributions(weeklyCanvasId)) ?? [];
}

function saveContribution(contribution: DrawingContribution): DrawingContribution[] {
  const key = STORAGE_KEYS.contributions(contribution.weeklyCanvasId);
  const existing = readJson<DrawingContribution[]>(key) ?? [];
  const next = [...existing.filter((item) => item.quadrant !== contribution.quadrant), contribution];
  writeJson(key, next);
  return next;
}

/**
 * 아직 아무도 채우지 않은 나머지 사분면을 미리 준비된 케어햄 색칠본으로 채운다.
 * 실제 다른 병원 아이가 참여하기 전까지 화면이 텅 비어 보이지 않게 하는 자리표시자이며,
 * 화면에는 "이미 공유된 사분면"으로만 자연스럽게 표시하고 참여 여부를 강조하지 않는다.
 */
function seedPlaceholderContributions(weeklyCanvasId: string, excludeQuadrant: Quadrant): void {
  const remainingQuadrants = QUADRANTS.filter((quadrant) => quadrant !== excludeQuadrant);
  const existingContributions = readContributions(weeklyCanvasId);

  remainingQuadrants.forEach((quadrant, index) => {
    if (existingContributions.some((item) => item.quadrant === quadrant)) return;
    const friend = MOCK_FRIEND_USERS[index % MOCK_FRIEND_USERS.length];
    const tint = PLACEHOLDER_TINT_COLORS[index % PLACEHOLDER_TINT_COLORS.length];
    const tintedImage = createFlatTintDataUrl(tint, 0.4);

    saveContribution({
      id: `contribution-${weeklyCanvasId}-${quadrant}`,
      weeklyCanvasId,
      participantId: friend.id,
      nickname: friend.nickname,
      avatar: friend.avatar,
      quadrant,
      status: "SHARED",
      imageDataUrl: tintedImage,
      thumbnail: tintedImage,
      isPlaceholder: true,
      sharedAt: new Date().toISOString(),
    });
  });
}

/** 아이가 자기 사분면을 우리 그림에 공유(제출)한다. */
export function shareContribution(
  weeklyCanvasId: string,
  participant: ChildUser,
  quadrant: Quadrant,
  imageDataUrl: string,
): DrawingContribution {
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
  saveContribution(contribution);
  return contribution;
}

/** 특정 기여물에 나중에(예: AI 분석 뒤) 썸네일만 업데이트하고 싶을 때 쓴다. */
export function updateContributionThumbnail(
  weeklyCanvasId: string,
  quadrant: Quadrant,
  thumbnail: string,
): void {
  const existing = readContributions(weeklyCanvasId);
  const target = existing.find((item) => item.quadrant === quadrant);
  if (!target) return;
  saveContribution({ ...target, thumbnail });
}
