import { beforeEach, describe, expect, it } from "vitest";
import { QUADRANTS } from "@/lib/config/quadrants";
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
});
