"use client";

import { Archive, Images, Palette } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ChildButton from "@/components/common/ChildButton";
import LogoutButton from "@/components/common/LogoutButton";
import PageHeader from "@/components/common/PageHeader";
import TabletShell from "@/components/common/TabletShell";
import CareHam from "@/components/mascot/CareHam";
import SeedJar from "@/components/reward/SeedJar";
import { getActiveTheme } from "@/lib/config/themes";
import { UI_TEXT } from "@/lib/constants/ui-text";
import { useRewardStore } from "@/lib/store/reward-store";
import { useSessionStore } from "@/lib/store/session-store";
import { readAssignment } from "@/lib/utils/random-assignment";
import type { DrawingAssignment } from "@/types/assignment";

/**
 * 실제 홈 화면. "/"는 로그인 여부만 확인하고 여기로 보내는 리다이렉트 페이지일 뿐,
 * 이 화면 자체는 다른 화면으로 저절로 넘어가지 않는다(주제 소개 화면과 가장 다른 점).
 * "홈으로 가기"류 버튼은 전부 이 경로로 보내야 한다.
 */
export default function HomePage() {
  const router = useRouter();
  const hydrated = useSessionStore((state) => state.hydrated);
  const user = useSessionStore((state) => state.user);
  const setTheme = useSessionStore((state) => state.setTheme);
  const setAssignment = useSessionStore((state) => state.setAssignment);
  const loadRewards = useRewardStore((state) => state.loadForParticipant);
  const totalSeeds = useRewardStore((state) => state.totalSeeds);

  const [assignment, setLocalAssignment] = useState<DrawingAssignment | null | undefined>(undefined);

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, user, router]);

  useEffect(() => {
    if (!user) return;
    const theme = getActiveTheme();
    setTheme(theme);
    loadRewards(user.id);
    // localStorage는 브라우저에만 있어서, 서버 렌더링 결과와 달라지지 않도록 마운트된 뒤에만 읽는다.
    const existing = readAssignment(user.id, theme.id);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 위 이유로 의도된 패턴
    setLocalAssignment(existing);
    if (existing) setAssignment(existing);
  }, [user, setTheme, setAssignment, loadRewards]);

  if (!user || assignment === undefined) {
    return (
      <TabletShell background="sky">
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xl font-bold text-text-secondary">{UI_TEXT.common.loading}</p>
        </div>
      </TabletShell>
    );
  }

  const primaryCta = !assignment
    ? { label: UI_TEXT.home.startWeeklyCta, onClick: () => router.push("/weekly-theme") }
    : assignment.status === "SUBMITTED"
      ? { label: UI_TEXT.home.viewSharedCta, onClick: () => router.push(`/waiting-room/${assignment.roomId}`) }
      : { label: UI_TEXT.home.continueCta, onClick: () => router.push("/assignment") };

  const showSharedCanvasButton = assignment && assignment.status !== "SUBMITTED";

  return (
    <TabletShell background="sky">
      <PageHeader title={UI_TEXT.common.serviceName} rightSlot={<LogoutButton />} />

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-10 py-6">
        <CareHam type="GUIDE" size="LARGE" reaction="WAVE" />

        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-text-primary">{UI_TEXT.home.greeting}</h1>
          <p className="mt-1 text-lg font-semibold text-text-secondary">{UI_TEXT.home.subtitle}</p>
        </div>

        <SeedJar totalSeeds={totalSeeds} />

        <div className="grid w-full max-w-md grid-cols-1 gap-3">
          <ChildButton variant="accent" size="large" icon={Palette} fullWidth onClick={primaryCta.onClick}>
            {primaryCta.label}
          </ChildButton>

          <div className={showSharedCanvasButton ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 gap-3"}>
            {showSharedCanvasButton && (
              <ChildButton
                variant="ghost"
                size="medium"
                icon={Images}
                onClick={() => router.push(`/waiting-room/${assignment.roomId}`)}
              >
                {UI_TEXT.home.viewSharedCta}
              </ChildButton>
            )}
            <ChildButton variant="ghost" size="medium" icon={Archive} onClick={() => router.push("/gallery")}>
              {UI_TEXT.home.galleryCta}
            </ChildButton>
          </div>
        </div>
      </div>
    </TabletShell>
  );
}
