import { beforeEach, describe, expect, it } from "vitest";
import { getActiveTheme } from "@/lib/config/themes";
import { getOrCreateWeeklyCanvas, readContributions, shareContribution } from "@/lib/mock/weekly-canvas";
import { verifyRegistrationNumber } from "@/lib/mock/users";
import { getOrCreateAssignment } from "@/lib/utils/random-assignment";
import { resetFakeSupabase } from "./helpers/fake-supabase";

/**
 * 주간 캔버스·기여물은 이제 Supabase에 있다(사용자별이 아니라 themeId 하나로 공유되는 테이블).
 * 그래서 "다른 사용자"가 실제로는 다른 서버 계정이 아니라 같은 브라우저에서 로그인한 다른
 * 등록번호일 뿐이어도, 같은 Supabase 프로젝트를 보는 이상 서로의 그림이 보인다 — 심지어
 * 완전히 다른 기기에서 로그인해도 마찬가지다(로그인/배정은 아직 localStorage라 기기별로 다르지만,
 * 공동 캔버스 데이터 자체는 공유된다).
 * 이 테스트는 실제 Supabase 대신 인메모리 대역(tests/helpers/fake-supabase.ts)을 쓰지만,
 * lib/mock/weekly-canvas.ts의 실제 프로덕션 코드(업서트·조회 로직)를 그대로 통과시킨다.
 */
describe("다른 등록번호로 로그인해도 이미 제출된 그림이 공동 캔버스에서 보인다", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetFakeSupabase();
  });

  it("123456이 제출한 그림을 111111이 배정받은 뒤 공동 캔버스에서 그대로 볼 수 있다", async () => {
    const theme = getActiveTheme();

    // 1) 123456으로 로그인해서 배정받고, 그림을 제출한다.
    const userA = await verifyRegistrationNumber("123456");
    expect(userA).not.toBeNull();
    if (!userA) return;

    const assignmentA = await getOrCreateAssignment(userA, theme);
    const contributionA = await shareContribution(
      assignmentA.roomId,
      userA,
      assignmentA.quadrant,
      "data:image/png;base64,AAAA_USER_A_DRAWING",
    );
    await getOrCreateWeeklyCanvas(userA, assignmentA);

    // 2) 111111로 다시 로그인한다(등록되지 않은 번호 -> 임시 손님 계정).
    const userB = await verifyRegistrationNumber("111111");
    expect(userB).not.toBeNull();
    if (!userB) return;
    expect(userB.id).not.toBe(userA.id); // 서로 다른 사용자로 취급된다.

    const assignmentB = await getOrCreateAssignment(userB, theme);

    // 두 사용자는 같은 주(theme)의 같은 공동 캔버스를 공유한다.
    expect(assignmentB.roomId).toBe(assignmentA.roomId);
    // 이미 실제로 채워진 A의 사분면과는 절대 겹치지 않는다(placeholder 제외 배정 로직).
    expect(assignmentB.quadrant).not.toBe(assignmentA.quadrant);

    // 3) 111111 입장에서 공동 캔버스를 조회하면, 123456이 제출한 그림이 그대로 보인다.
    const contributionsSeenByB = await readContributions(assignmentB.roomId);
    const visibleToB = contributionsSeenByB.find((item) => item.id === contributionA.id);

    expect(visibleToB).toBeDefined();
    expect(visibleToB?.participantId).toBe(userA.id);
    expect(visibleToB?.quadrant).toBe(assignmentA.quadrant);
    expect(visibleToB?.imageDataUrl).toBe("data:image/png;base64,AAAA_USER_A_DRAWING");
    expect(visibleToB?.status).toBe("SHARED");
    expect(visibleToB?.isPlaceholder).not.toBe(true); // 진짜 참여자지 mock 친구 자리표시자가 아니다.
  });
});
