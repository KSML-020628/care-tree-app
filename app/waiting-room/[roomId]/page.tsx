"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ChildButton from "@/components/common/ChildButton";
import PageHeader from "@/components/common/PageHeader";
import TabletShell from "@/components/common/TabletShell";
import SharedCanvasPreview from "@/components/artwork/SharedCanvasPreview";
import { UI_TEXT } from "@/lib/constants/ui-text";
import { createTransparentLineArt } from "@/lib/drawing/quadrant-crop";
import { readContributions, readWeeklyCanvas } from "@/lib/mock/weekly-canvas";
import { useSessionStore } from "@/lib/store/session-store";
import type { DrawingContribution, WeeklyCanvas } from "@/types/room";

/**
 * 예전 "실시간 4인 대기실"을 대체하는 화면.
 * 누가 접속했는지·몇 명이 남았는지는 보여주지 않고, 지금까지 모인 색깔만 보여준다.
 * 다른 사람이 다 끝날 때까지 기다리게 하는 구조가 아니라, 언제든 바로 볼 수 있다.
 */
export default function SharedCanvasPage() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const hydrated = useSessionStore((state) => state.hydrated);
  const user = useSessionStore((state) => state.user);
  const theme = useSessionStore((state) => state.theme);
  const assignment = useSessionStore((state) => state.assignment);

  const [canvas, setCanvas] = useState<WeeklyCanvas | null>(null);
  const [contributions, setContributions] = useState<DrawingContribution[]>([]);
  const [transparentLineArtSrc, setTransparentLineArtSrc] = useState<string | null>(null);

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, user, router]);

  useEffect(() => {
    // localStorage는 브라우저에만 있어서, 서버 렌더링 결과와 달라지지 않도록 마운트된 뒤에만 읽는다.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 위 이유로 의도된 패턴
    setCanvas(readWeeklyCanvas(params.roomId));
    setContributions(readContributions(params.roomId));
  }, [params.roomId]);

  useEffect(() => {
    if (!theme) return;
    createTransparentLineArt(theme.fullImagePath).then(setTransparentLineArtSrc);
  }, [theme]);

  if (!canvas || !theme || !assignment) {
    return (
      <TabletShell background="sky">
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xl font-bold text-text-secondary">{UI_TEXT.common.loading}</p>
        </div>
      </TabletShell>
    );
  }

  return (
    <TabletShell background="sky">
      <PageHeader title={UI_TEXT.sharedCanvas.heading} />

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 pb-8">
        <SharedCanvasPreview
          weeklyCanvasId={canvas.id}
          transparentLineArtSrc={transparentLineArtSrc}
          myQuadrant={assignment.quadrant}
          contributions={contributions}
        />

        <div className="text-center">
          <p className="text-lg font-bold text-text-primary">{UI_TEXT.sharedCanvas.intro1}</p>
          <p className="mt-1 text-sm font-semibold text-text-secondary">{UI_TEXT.sharedCanvas.intro2}</p>
        </div>

        <div className="grid w-full max-w-md grid-cols-1 gap-3">
          <ChildButton variant="accent" size="large" fullWidth onClick={() => router.push(`/result/${canvas.id}`)}>
            {UI_TEXT.sharedCanvas.viewFull}
          </ChildButton>
          <div className="grid grid-cols-2 gap-3">
            <ChildButton variant="ghost" size="medium" onClick={() => router.push(`/draw/${assignment.id}`)}>
              {UI_TEXT.sharedCanvas.viewMine}
            </ChildButton>
            <ChildButton variant="ghost" size="medium" onClick={() => router.push("/")}>
              {UI_TEXT.sharedCanvas.home}
            </ChildButton>
          </div>
        </div>
      </div>
    </TabletShell>
  );
}
