"use client";

import { Send } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ChildButton from "@/components/common/ChildButton";
import PageHeader from "@/components/common/PageHeader";
import TabletShell from "@/components/common/TabletShell";
import DrawingCanvas, { type DrawingCanvasHandle } from "@/components/drawing/DrawingCanvas";
import SubmissionCelebration from "@/components/reward/SubmissionCelebration";
import { UI_TEXT } from "@/lib/constants/ui-text";
import { QUADRANT_ZONE_LABELS } from "@/lib/config/quadrants";
import { compositeFinalArtwork } from "@/lib/drawing/canvas-export";
import { exportAnalysisImage } from "@/lib/drawing/export-analysis-image";
import { createTransparentLineArt, cropQuadrantLineArt } from "@/lib/drawing/quadrant-crop";
import { getRandomPraise } from "@/lib/mascot/praise-messages";
import { fetchActiveTheme } from "@/lib/mock/theme";
import { getOrCreateWeeklyCanvas, shareContribution } from "@/lib/mock/weekly-canvas";
import { useAiStore } from "@/lib/store/ai-store";
import { useDrawingStore } from "@/lib/store/drawing-store";
import { useRewardStore } from "@/lib/store/reward-store";
import { useSessionStore } from "@/lib/store/session-store";
import { getOrCreateAssignment, updateAssignmentStatus } from "@/lib/utils/random-assignment";
import type { DrawingContribution } from "@/types/room";

type Phase = "preview" | "celebrating";

/**
 * AI 실패가 제출 흐름을 막지 않도록, 그림 저장이 끝난 뒤 완전히 분리된 흐름으로 백그라운드에서만 호출한다.
 * contribution.imageDataUrl(색칠 레이어만, 선화 없음)을 그대로 보내면 AI가 무엇을 그렸는지 알아보기 어려우므로,
 * 선화까지 합쳐서 만든 analysisImageDataUrl을 대신 보낸다.
 */
async function runArtworkAnalysisInBackground(
  contribution: DrawingContribution,
  analysisImageDataUrl: string,
  themeId: string,
  themeTitle: string,
): Promise<void> {
  try {
    const response = await fetch("/api/ai/artwork-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageDataUrl: analysisImageDataUrl,
        themeId,
        themeTitle,
        quadrant: contribution.quadrant,
        zoneLabel: QUADRANT_ZONE_LABELS[contribution.quadrant],
        // allowedMotionPresets는 보내지 않는다 — 서버가 themeId+quadrant로 직접 정한다(클라이언트 값은 신뢰하지 않음).
      }),
    });
    if (!response.ok) return;
    const result = await response.json();
    useAiStore.getState().setAnalysis(contribution.id, result);
  } catch {
    // 조용히 무시한다. 이미 그림 저장과 칭찬은 끝난 뒤라 아이 경험에는 영향이 없다.
  }
}

export default function PreviewPage() {
  const params = useParams<{ assignmentId: string }>();
  const router = useRouter();

  const hydrated = useSessionStore((state) => state.hydrated);
  const user = useSessionStore((state) => state.user);
  const theme = useSessionStore((state) => state.theme);
  const assignment = useSessionStore((state) => state.assignment);
  const setTheme = useSessionStore((state) => state.setTheme);
  const setAssignment = useSessionStore((state) => state.setAssignment);
  const strokes = useDrawingStore((state) => state.strokes);
  const drawingAssignmentId = useDrawingStore((state) => state.assignmentId);
  const loadForAssignment = useDrawingStore((state) => state.loadForAssignment);

  const totalSeeds = useRewardStore((state) => state.totalSeeds);
  const loadRewardsForParticipant = useRewardStore((state) => state.loadForParticipant);
  const grantSeeds = useRewardStore((state) => state.grantSeeds);

  const canvasRef = useRef<DrawingCanvasHandle>(null);
  // 빠르게 두 번 눌러도 제출·해바라씨·AI 요청이 중복되지 않도록, 리렌더링을 기다리지 않는
  // ref로 막는다(state는 다음 렌더 전까지 반영이 늦어질 수 있어 연타를 놓칠 수 있다).
  const hasSubmittedRef = useRef(false);
  const [isSending, setIsSending] = useState(false);
  const [lineArtSrc, setLineArtSrc] = useState<string | null>(null);
  const [transparentLineArtSrc, setTransparentLineArtSrc] = useState<string | null>(null);
  const [compositeSrc, setCompositeSrc] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("preview");
  const [sendFailed, setSendFailed] = useState(false);
  const [celebration, setCelebration] = useState<{ praise: string; seedsBefore: number; seedsAfter: number } | null>(
    null,
  );

  // 새로고침으로 화면이 다시 열려도(로그인 정보/주제/배정/그림 상태를) 그대로 되살린다.
  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    loadRewardsForParticipant(user.id);
    if (!theme) {
      fetchActiveTheme().then(setTheme);
      return;
    }
    if (!assignment || assignment.id !== params.assignmentId) {
      getOrCreateAssignment(user, theme).then(setAssignment);
      return;
    }
    if (drawingAssignmentId !== assignment.id) {
      loadForAssignment(assignment.id);
    }
  }, [
    hydrated,
    user,
    theme,
    assignment,
    params.assignmentId,
    drawingAssignmentId,
    router,
    setTheme,
    setAssignment,
    loadForAssignment,
    loadRewardsForParticipant,
  ]);

  useEffect(() => {
    if (!user || !theme || !assignment || assignment.id !== params.assignmentId) return;
    cropQuadrantLineArt(theme.fullImagePath, assignment.quadrant).then(setLineArtSrc);
  }, [user, theme, assignment, params.assignmentId]);

  // 보상 화면의 공동 작품 미리보기 카드에 쓸, 전체 도안의 선화(투명 배경)를 미리 만들어 둔다.
  useEffect(() => {
    if (!theme) return;
    createTransparentLineArt(theme.fullImagePath).then(setTransparentLineArtSrc);
  }, [theme]);

  // 그림판을 화면에 보이지 않게 렌더링한 뒤, 그걸 내보내서 전체 그림 위 내 자리에 합쳐 보여준다.
  useEffect(() => {
    if (!theme || !assignment || !lineArtSrc || !canvasRef.current) return;
    const timer = window.setTimeout(async () => {
      const exported = canvasRef.current?.exportDrawingLayer();
      if (!exported) return;
      const transparentLineArt = await createTransparentLineArt(theme.fullImagePath);
      const composite = await compositeFinalArtwork({ [assignment.quadrant]: exported }, transparentLineArt);
      setCompositeSrc(composite);
    }, 50);
    return () => window.clearTimeout(timer);
  }, [theme, assignment, lineArtSrc, strokes]);

  async function handleSend() {
    if (!user || !theme || !assignment || !canvasRef.current) return;
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    setIsSending(true);
    setSendFailed(false);

    const exported = canvasRef.current.exportDrawingLayer();

    try {
      // 1) 그림을 먼저 저장하고 제출을 성공 처리한다 (AI를 전혀 기다리지 않는다).
      //    공동 캔버스는 이제 Supabase에 있어서, 이 저장 자체는 네트워크 요청을 한 번 탄다.
      const contribution = await shareContribution(assignment.roomId, user, assignment.quadrant, exported);
      const updatedAssignment = updateAssignmentStatus(user.id, theme.id, "SUBMITTED");
      if (updatedAssignment) setAssignment(updatedAssignment);
      await getOrCreateWeeklyCanvas(user, updatedAssignment ?? assignment);

      // 2) 해바라씨를 지급한다.
      const seedsBefore = totalSeeds;
      grantSeeds("ZONE_SUBMITTED", assignment.id);
      const seedsAfter = seedsBefore + 5;

      // 3) 사전 검수된 기본 칭찬을 즉시 보여준다.
      setCelebration({ praise: getRandomPraise("SUBMISSION"), seedsBefore, seedsAfter });
      setPhase("celebrating");

      // 4) AI 분석은 완전히 분리된 백그라운드 요청으로만 실행한다.
      //    선화가 없으면 AI가 무엇을 그렸는지 알아보기 어려우므로, 색칠 레이어 + 선화를 합친
      //    이미지를 별도로 만들어서 보낸다(공동 작품에 저장되는 contribution.imageDataUrl은 그대로 둔다).
      if (lineArtSrc) {
        void exportAnalysisImage({ drawingLayerDataUrl: exported, lineArtDataUrl: lineArtSrc })
          .then((analysisImage) => runArtworkAnalysisInBackground(contribution, analysisImage, theme.id, theme.title))
          .catch(() => {
            // 합성이 실패해도 조용히 무시한다. 이미 그림 제출·해바라씨·칭찬은 끝난 뒤라 영향이 없다.
          });
      }
    } catch {
      // 저장이 실패해도(네트워크 문제 등) 아이가 다시 눌러 볼 수 있게 되돌린다.
      hasSubmittedRef.current = false;
      setIsSending(false);
      setSendFailed(true);
    }
  }

  function goToSharedCanvas() {
    if (!assignment) return;
    router.push(`/waiting-room/${assignment.roomId}`);
  }

  if (!user || !theme || !assignment) {
    return (
      <TabletShell>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xl font-bold text-text-secondary">{UI_TEXT.common.loading}</p>
        </div>
      </TabletShell>
    );
  }

  return (
    <TabletShell background="sky">
      {phase === "preview" && <PageHeader onBack={() => router.back()} title={UI_TEXT.preview.heading} />}

      {/* 화면에는 보이지 않지만, 그림을 내보내기 위해 실제로 떠 있어야 하는 그림판.
          display:none은 크기가 0이 되어 내보내기가 실패하므로, 대신 화면 밖으로 고정 배치하고 투명하게 둔다. */}
      <div
        className="pointer-events-none fixed left-0 top-0 -z-10 h-[512px] w-[512px] opacity-0"
        aria-hidden="true"
      >
        {lineArtSrc && <DrawingCanvas ref={canvasRef} lineArtSrc={lineArtSrc} readOnly />}
      </div>

      {phase === "preview" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-10 py-6">
          <h1 className="text-center text-3xl font-extrabold text-text-primary">{UI_TEXT.preview.heading}</h1>

          <div className="aspect-square w-full max-w-[440px] overflow-hidden rounded-[28px] bg-white shadow-soft">
            {compositeSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={compositeSrc}
                alt="우리가 함께 만들 전체 그림 속 내 자리"
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-text-secondary">{UI_TEXT.common.loading}</div>
            )}
          </div>

          {sendFailed && (
            <p className="text-base font-semibold text-warm" role="alert" aria-live="polite">
              {UI_TEXT.preview.sendFailed}
            </p>
          )}

          <div className="grid w-full max-w-md grid-cols-2 gap-4">
            <ChildButton
              variant="ghost"
              size="large"
              disabled={isSending}
              onClick={() => router.push(`/draw/${assignment.id}`)}
            >
              {UI_TEXT.preview.keepDrawing}
            </ChildButton>
            <ChildButton variant="accent" size="large" icon={Send} disabled={isSending} onClick={handleSend}>
              {UI_TEXT.preview.sendIt}
            </ChildButton>
          </div>
        </div>
      ) : (
        celebration && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-10 py-6">
            <SubmissionCelebration
              weeklyCanvasId={assignment.roomId}
              transparentLineArtSrc={transparentLineArtSrc}
              userQuadrant={assignment.quadrant}
              praiseMessage={celebration.praise}
              totalSeedsBefore={celebration.seedsBefore}
              totalSeedsAfter={celebration.seedsAfter}
              onViewSharedCanvas={goToSharedCanvas}
            />
          </div>
        )
      )}
    </TabletShell>
  );
}
