"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ChildButton from "@/components/common/ChildButton";
import PageHeader from "@/components/common/PageHeader";
import TabletShell from "@/components/common/TabletShell";
import SharedCanvasPreview from "@/components/artwork/SharedCanvasPreview";
import CareHamReaction from "@/components/mascot/CareHamReaction";
import { isAnalysisDisplayable } from "@/lib/ai/artwork-analysis-display";
import { UI_TEXT } from "@/lib/constants/ui-text";
import { createTransparentLineArt } from "@/lib/drawing/quadrant-crop";
import { getRandomPraise } from "@/lib/mascot/praise-messages";
import { readContributions, readWeeklyCanvas } from "@/lib/mock/weekly-canvas";
import { useHydratedAnalyses } from "@/lib/store/ai-store";
import { useSessionStore } from "@/lib/store/session-store";
import { STORAGE_KEYS, readJson, writeJson } from "@/lib/storage/local-storage";
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
  const [aiPraiseMessage, setAiPraiseMessage] = useState<string | null>(null);

  // 내가 실제로 제출한 조각(placeholder 아님)을 찾는다. AI 후속 칭찬은 이 조각의 분석 결과만 본다.
  const myContribution = contributions.find((item) => item.quadrant === assignment?.quadrant && !item.isPlaceholder);
  const analyses = useHydratedAnalyses(myContribution ? [myContribution.id] : []);

  useEffect(() => {
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, user, router]);

  useEffect(() => {
    readWeeklyCanvas(params.roomId).then(setCanvas);
    readContributions(params.roomId).then(setContributions);
  }, [params.roomId]);

  useEffect(() => {
    if (!theme) return;
    createTransparentLineArt(theme.fullImagePath).then(setTransparentLineArtSrc);
  }, [theme]);

  // AI 분석이 끝나고, 색깔에 관해 알려줄 만한 게 있으면(SUBMISSION 말고 다른 카테고리라면)
  // 딱 한 번만 짧게 후속 칭찬을 보여준다. AI가 문장을 직접 만드는 게 아니라, AI가 고른
  // 카테고리에 맞는 사전 검수된 문장만 사용한다.
  useEffect(() => {
    if (!myContribution) return;
    const response = analyses[myContribution.id];
    if (!response || !isAnalysisDisplayable(response)) return;
    const { praiseCategory } = response.analysis;
    if (praiseCategory === "SUBMISSION") return;

    const shownKey = STORAGE_KEYS.aiPraiseShown(myContribution.id);
    if (readJson<boolean>(shownKey)) return;
    writeJson(shownKey, true);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage 플래그를 확인한 뒤에만 한 번 켠다
    setAiPraiseMessage(getRandomPraise(praiseCategory));
  }, [analyses, myContribution]);

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

      {aiPraiseMessage && (
        <div className="pointer-events-none absolute right-4 top-20 z-10">
          <CareHamReaction
            type="SMILE"
            size="SMALL"
            reaction="BOUNCE"
            message={aiPraiseMessage}
            autoHideMs={3000}
            onHide={() => setAiPraiseMessage(null)}
          />
        </div>
      )}

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
            <ChildButton variant="ghost" size="medium" onClick={() => router.push("/home")}>
              {UI_TEXT.sharedCanvas.home}
            </ChildButton>
          </div>
        </div>
      </div>
    </TabletShell>
  );
}
