import { beforeEach, describe, expect, it } from "vitest";
import { getActiveTheme } from "@/lib/config/themes";
import { getOrCreateWeeklyCanvas, readContributions, shareContribution } from "@/lib/mock/weekly-canvas";
import { verifyRegistrationNumber } from "@/lib/mock/users";
import { getOrCreateAssignment } from "@/lib/utils/random-assignment";

/**
 * 지금 mock 데이터는 전부 localStorage에만 있다. "다른 사용자"가 실제로는 다른 서버 계정이 아니라
 * 같은 브라우저에서 로그인한 다른 등록번호일 뿐이므로, 주간 캔버스/기여물은 사용자별이 아니라
 * themeId 하나로 공유되는 키(care-tree:contributions:{weeklyCanvasId})에 저장된다.
 * 이 테스트는 "123456이 그린 그림이 111111에게도 보이는지"를 실제 프로덕션 함수(로그인 mock,
 * 배정, 제출, 조회)만으로 재현해서 확인한다 — 브라우저 두 개를 직접 켜보는 것과 같은 경로를 탄다.
 */
describe("같은 브라우저에서 다른 등록번호로 로그인해도 이미 제출된 그림이 보인다", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("123456이 제출한 그림을 111111이 배정받은 뒤 공동 캔버스에서 그대로 볼 수 있다", async () => {
    const theme = getActiveTheme();

    // 1) 123456으로 로그인해서 배정받고, 그림을 제출한다.
    const userA = await verifyRegistrationNumber("123456");
    expect(userA).not.toBeNull();
    if (!userA) return;

    const assignmentA = getOrCreateAssignment(userA, theme);
    const contributionA = shareContribution(
      assignmentA.roomId,
      userA,
      assignmentA.quadrant,
      "data:image/png;base64,AAAA_USER_A_DRAWING",
    );
    getOrCreateWeeklyCanvas(userA, assignmentA);

    // 2) 같은 브라우저에서 로그아웃하고 111111로 다시 로그인한다(등록되지 않은 번호 -> 임시 손님 계정).
    const userB = await verifyRegistrationNumber("111111");
    expect(userB).not.toBeNull();
    if (!userB) return;
    expect(userB.id).not.toBe(userA.id); // 서로 다른 사용자로 취급된다.

    const assignmentB = getOrCreateAssignment(userB, theme);

    // 두 사용자는 같은 주(theme)의 같은 공동 캔버스를 공유한다.
    expect(assignmentB.roomId).toBe(assignmentA.roomId);
    // 이미 실제로 채워진 A의 사분면과는 절대 겹치지 않는다(placeholder 제외 배정 로직).
    expect(assignmentB.quadrant).not.toBe(assignmentA.quadrant);

    // 3) 111111 입장에서 공동 캔버스를 조회하면, 123456이 제출한 그림이 그대로 보인다.
    const contributionsSeenByB = readContributions(assignmentB.roomId);
    const visibleToB = contributionsSeenByB.find((item) => item.id === contributionA.id);

    expect(visibleToB).toBeDefined();
    expect(visibleToB?.participantId).toBe(userA.id);
    expect(visibleToB?.quadrant).toBe(assignmentA.quadrant);
    expect(visibleToB?.imageDataUrl).toBe("data:image/png;base64,AAAA_USER_A_DRAWING");
    expect(visibleToB?.status).toBe("SHARED");
    expect(visibleToB?.isPlaceholder).not.toBe(true); // 진짜 참여자지 mock 친구 자리표시자가 아니다.
  });
});
