import { beforeEach, describe, expect, it } from "vitest";
import { QUADRANTS } from "@/lib/config/quadrants";
import { getOrCreateWeeklyCanvas, shareContribution } from "@/lib/mock/weekly-canvas";
import { getOrCreateAssignment } from "@/lib/utils/random-assignment";
import type { WeeklyTheme } from "@/types/theme";
import type { ChildUser } from "@/types/user";

const theme: WeeklyTheme = {
  id: "theme-test",
  title: "나무",
  description: "테스트용 주제",
  fullImagePath: "/images/themes/tree/full.png",
  startsAt: "2026-01-01T00:00:00+09:00",
  endsAt: "2026-01-08T00:00:00+09:00",
  status: "ACTIVE",
};

function makeUser(id: string): ChildUser {
  return {
    id,
    registrationNumber: "123456",
    nickname: `친구-${id}`,
    hospitalId: "hospital-a",
    hospitalName: "별빛어린이병원",
    age: 6,
    avatar: "🐰",
  };
}

describe("getOrCreateAssignment (사분면 랜덤 배정)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("같은 사용자는 새로고침(다시 호출)해도 같은 사분면을 받는다", () => {
    const user = makeUser("user-1");
    const first = getOrCreateAssignment(user, theme);
    const second = getOrCreateAssignment(user, theme);
    expect(second.quadrant).toBe(first.quadrant);
    expect(second.id).toBe(first.id);
  });

  it("배정된 사분면은 항상 유효한 4개 중 하나다", () => {
    const user = makeUser("user-2");
    const assignment = getOrCreateAssignment(user, theme);
    expect(QUADRANTS).toContain(assignment.quadrant);
  });

  it("배정은 사용자가 고르는 것이 아니라 시스템이 정한다(항상 ASSIGNED 상태로 시작)", () => {
    const user = makeUser("user-3");
    const assignment = getOrCreateAssignment(user, theme);
    expect(assignment.status).toBe("ASSIGNED");
    expect(assignment.assignedAt).toBeTruthy();
  });

  it("서로 다른 사용자는 서로 다른 배정 레코드를 갖는다", () => {
    const a = getOrCreateAssignment(makeUser("user-4"), theme);
    const b = getOrCreateAssignment(makeUser("user-5"), theme);
    expect(a.id).not.toBe(b.id);
  });

  it("placeholder로 채워진 사분면은 다음 사용자 배정에서 '이미 찬 자리'로 세지 않는다", () => {
    // user-first가 제출하면, 나머지 3칸은 placeholder(케어햄 색칠본)로 자동으로 채워진다.
    const first = makeUser("user-first");
    const firstAssignment = getOrCreateAssignment(first, theme);
    const firstContribution = shareContribution(
      firstAssignment.roomId,
      first,
      firstAssignment.quadrant,
      "data:image/png;base64,AAAA",
    );
    getOrCreateWeeklyCanvas(first, firstAssignment);

    // placeholder까지 "이미 찬 자리"로 잘못 세면 4칸이 다 찬 것처럼 보여, 배정이 전체 후보군에서
    // 다시 무작위로 뽑히면서 이미 실제로 차 있는 first의 칸과 겹칠 수 있다.
    // 고쳐졌다면 placeholder는 제외되므로, 몇 명이 더 들어와도 절대 first의 칸과 겹치지 않는다.
    for (let index = 0; index < 20; index += 1) {
      const nextAssignment = getOrCreateAssignment(makeUser(`user-next-${index}`), theme);
      expect(nextAssignment.quadrant).not.toBe(firstContribution.quadrant);
    }
  });
});
