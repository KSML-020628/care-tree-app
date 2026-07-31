import { beforeEach, describe, expect, it } from "vitest";
import { getOrCreateWeeklyCanvas, readContributions, shareContribution } from "@/lib/mock/weekly-canvas";
import { verifyRegistrationNumber } from "@/lib/mock/users";
import { processAvatarImage } from "@/lib/profile/profile-image-processing";
import {
  buildDefaultCareHamProfile,
  buildDrawnProfile,
  getProfile,
  getProfiles,
  saveProfile,
} from "@/lib/profile/profile-storage";
import { toParticipantSnapshot } from "@/lib/profile/profile.types";
import { getOrCreateAssignment } from "@/lib/utils/random-assignment";
import { getActiveTheme } from "@/lib/config/themes";
import { resetFakeSupabase } from "./helpers/fake-supabase";

describe("프로필 저장소", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetFakeSupabase();
  });

  it("아직 프로필을 만들지 않은 사용자는 조회 결과가 없다(최초 온보딩 진입 조건)", async () => {
    const profile = await getProfile("user-never-onboarded");
    expect(profile).toBeNull();
  });

  it("프로필을 저장하면 이후 조회 시 onboardingCompleted가 true다(재로그인 시 온보딩 반복 방지)", async () => {
    const draft = buildDrawnProfile("user-with-profile", "파랑구름", "data:image/png;base64,AVATAR");
    await saveProfile(draft);

    const found = await getProfile("user-with-profile");
    expect(found).not.toBeNull();
    expect(found?.onboardingCompleted).toBe(true);
    expect(found?.avatarSource).toBe("DRAWN");
  });

  it("기본 케어햄 프로필은 그림 없이도 onboardingCompleted가 true다", async () => {
    const draft = buildDefaultCareHamProfile("user-default-careham", "새싹친구");
    await saveProfile(draft);

    const found = await getProfile("user-default-careham");
    expect(found?.avatarSource).toBe("DEFAULT_CAREHAM");
    expect(found?.avatarImageUrl).toBeNull();
    expect(found?.onboardingCompleted).toBe(true);
  });

  it("getProfiles로 여러 명의 프로필을 한 번에 가져올 수 있다", async () => {
    await saveProfile(buildDrawnProfile("user-a", "화가A", "data:image/png;base64,A"));
    await saveProfile(buildDrawnProfile("user-b", "화가B", "data:image/png;base64,B"));

    const profiles = await getProfiles(["user-a", "user-b", "user-never-existed"]);
    expect(profiles["user-a"]?.artistName).toBe("화가A");
    expect(profiles["user-b"]?.artistName).toBe("화가B");
    expect(profiles["user-never-existed"]).toBeUndefined();
  });

  it("123456과 111111은 서로 다른 프로필을 갖고, 서로의 프로필을 조회할 수 있다", async () => {
    const userA = await verifyRegistrationNumber("123456");
    const userB = await verifyRegistrationNumber("111111");
    if (!userA || !userB) throw new Error("mock 로그인 실패");

    await saveProfile(buildDrawnProfile(userA.id, "파랑구름", "data:image/png;base64,A"));
    await saveProfile(buildDrawnProfile(userB.id, "새싹친구", "data:image/png;base64,B"));

    const seenByEitherSession = await getProfiles([userA.id, userB.id]);
    expect(seenByEitherSession[userA.id]?.artistName).toBe("파랑구름");
    expect(seenByEitherSession[userB.id]?.artistName).toBe("새싹친구");
  });
});

describe("프로필 스냅샷은 제출 당시 그대로 유지된다", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetFakeSupabase();
  });

  it("제출 후 프로필을 새로 그려도, 이미 제출된 조각의 participantSnapshot은 바뀌지 않는다", async () => {
    const user = await verifyRegistrationNumber("123456");
    if (!user) throw new Error("mock 로그인 실패");
    const theme = getActiveTheme();

    // 1) 첫 프로필로 그림을 제출한다.
    const originalProfile = buildDrawnProfile(user.id, "파랑구름", "data:image/png;base64,ORIGINAL");
    await saveProfile(originalProfile);

    const assignment = await getOrCreateAssignment(user, theme);
    const snapshot = toParticipantSnapshot(originalProfile);
    await shareContribution(assignment.roomId, user, assignment.quadrant, "data:image/png;base64,DRAWING", snapshot);
    await getOrCreateWeeklyCanvas(user, assignment);

    // 2) 프로필을 새로 그린다(이름·그림이 바뀐다).
    const updatedProfile = buildDrawnProfile(user.id, "노랑별", "data:image/png;base64,UPDATED");
    await saveProfile(updatedProfile);

    // 3) 이미 제출된 조각을 다시 조회하면, 스냅샷은 여전히 "파랑구름"의 원래 그림이어야 한다.
    const contributions = await readContributions(assignment.roomId);
    const myContribution = contributions.find((item) => item.quadrant === assignment.quadrant);

    expect(myContribution?.participantSnapshot?.artistName).toBe("파랑구름");
    expect(myContribution?.participantSnapshot?.avatarImageUrl).toBe("data:image/png;base64,ORIGINAL");

    // 최신 프로필 자체는 정상적으로 갱신되어 있다.
    const latestProfile = await getProfile(user.id);
    expect(latestProfile?.artistName).toBe("노랑별");
  });
});

describe("프로필 그림 정제(AI)는 항상 원본을 안전하게 돌려준다", () => {
  it("processAvatarImage는 실패 없이 항상 ORIGINAL을 반환한다(온보딩이 AI 때문에 멈추지 않는다)", async () => {
    const result = await processAvatarImage("data:image/png;base64,ANYTHING");
    expect(result.source).toBe("ORIGINAL");
    expect(result.displayImageUrl).toBe("data:image/png;base64,ANYTHING");
    expect(result.originalImageUrl).toBe("data:image/png;base64,ANYTHING");
    expect(result.processingApplied).toEqual([]);
  });
});
