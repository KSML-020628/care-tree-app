import { beforeEach, describe, expect, it } from "vitest";
import { appendSeedEntry, getTotalSeeds, readSeedLedger } from "@/lib/rewards/seed-ledger";

/**
 * 미리보기 화면에서 grantSeeds("ZONE_SUBMITTED", assignment.id)를 호출할 때 assignment.id를
 * refId로 쓴다. assignment.id는 새로고침 뒤 같은 그림을 다시 보내도 항상 같은 값이므로,
 * 이 테스트는 그 refId 중복 방지가 실제로 두 번째 지급을 막는지 확인한다
 * (새로고침 후 다시 제출해도 해바라씨가 중복으로 쌓이지 않아야 한다는 요구사항).
 */
describe("해바라씨 원장은 같은 refId로는 중복 지급하지 않는다", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("같은 assignment.id로 두 번 지급 시도해도 한 번만 쌓인다(새로고침 후 재제출 시나리오)", () => {
    const participantId = "user-blue-cloud";
    const assignmentId = "assignment-user-blue-cloud-theme-tree-001";

    const first = appendSeedEntry(participantId, "ZONE_SUBMITTED", assignmentId);
    expect(first).not.toBeNull();

    // 새로고침 후 같은 그림을 다시 "보낸" 상황을 흉내낸다 - 같은 refId로 다시 호출한다.
    const second = appendSeedEntry(participantId, "ZONE_SUBMITTED", assignmentId);
    expect(second).toBeNull();

    const third = appendSeedEntry(participantId, "ZONE_SUBMITTED", assignmentId);
    expect(third).toBeNull();

    expect(readSeedLedger(participantId)).toHaveLength(1);
    expect(getTotalSeeds(participantId)).toBe(first?.amount);
  });

  it("다른 사분면(다른 refId)에 대한 지급은 각각 정상적으로 쌓인다", () => {
    const participantId = "user-blue-cloud";

    appendSeedEntry(participantId, "ZONE_SUBMITTED", "assignment-a");
    appendSeedEntry(participantId, "ZONE_SUBMITTED", "assignment-b");

    expect(readSeedLedger(participantId)).toHaveLength(2);
  });
});
