"use client";

import { Send, Sparkles } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ChildButton from "@/components/common/ChildButton";
import PageHeader from "@/components/common/PageHeader";
import TabletShell from "@/components/common/TabletShell";
import DrawingCanvas, { type DrawingCanvasHandle } from "@/components/drawing/DrawingCanvas";
import { UI_TEXT } from "@/lib/constants/ui-text";
import { compositeFinalArtwork } from "@/lib/drawing/canvas-export";
import { createTransparentLineArt, cropQuadrantLineArt } from "@/lib/drawing/quadrant-crop";
import { fetchActiveTheme } from "@/lib/mock/theme";
import { getOrCreateRoom, updateParticipantStatus } from "@/lib/mock/room";
import { saveSubmission } from "@/lib/mock/submissions";
import { useDrawingStore } from "@/lib/store/drawing-store";
import { useSessionStore } from "@/lib/store/session-store";
import { getOrCreateAssignment, updateAssignmentStatus } from "@/lib/utils/random-assignment";

type Phase = "preview" | "submitting" | "submitted";

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

  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const [lineArtSrc, setLineArtSrc] = useState<string | null>(null);
  const [compositeSrc, setCompositeSrc] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("preview");

  // 새로고침으로 화면이 다시 열려도(로그인 정보/주제/배정/그림 상태를) 그대로 되살린다.
  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!theme) {
      fetchActiveTheme().then(setTheme);
      return;
    }
    if (!assignment || assignment.id !== params.assignmentId) {
      setAssignment(getOrCreateAssignment(user, theme));
      return;
    }
    if (drawingAssignmentId !== assignment.id) {
      loadForAssignment(assignment.id);
    }
  }, [hydrated, user, theme, assignment, params.assignmentId, drawingAssignmentId, router, setTheme, setAssignment, loadForAssignment]);

  useEffect(() => {
    if (!user || !theme || !assignment || assignment.id !== params.assignmentId) return;
    cropQuadrantLineArt(theme.fullImagePath, assignment.quadrant).then(setLineArtSrc);
  }, [user, theme, assignment, params.assignmentId]);

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
    setPhase("submitting");

    const exported = canvasRef.current.exportDrawingLayer();
    saveSubmission(assignment.roomId, {
      id: `submission-${user.id}`,
      assignmentId: assignment.id,
      userId: user.id,
      quadrant: assignment.quadrant,
      imageDataUrl: exported,
      submittedAt: new Date().toISOString(),
    });

    const updatedAssignment = updateAssignmentStatus(user.id, theme.id, "SUBMITTED");
    if (updatedAssignment) setAssignment(updatedAssignment);

    const room = getOrCreateRoom(user, updatedAssignment ?? assignment);
    updateParticipantStatus(room.id, user.id, "SUBMITTED", exported);

    setPhase("submitted");
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
      {phase !== "submitted" && (
        <PageHeader onBack={() => router.back()} title={UI_TEXT.preview.heading} />
      )}

      {/* 화면에는 보이지 않지만, 그림을 내보내기 위해 실제로 떠 있어야 하는 그림판.
          display:none은 크기가 0이 되어 내보내기가 실패하므로, 대신 화면 밖으로 고정 배치하고 투명하게 둔다. */}
      <div
        className="pointer-events-none fixed left-0 top-0 -z-10 h-[512px] w-[512px] opacity-0"
        aria-hidden="true"
      >
        {lineArtSrc && <DrawingCanvas ref={canvasRef} lineArtSrc={lineArtSrc} readOnly />}
      </div>

      {phase !== "submitted" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-10 py-6">
          <h1 className="text-center text-3xl font-extrabold text-text-primary">{UI_TEXT.preview.heading}</h1>

          <div className="aspect-square w-full max-w-[440px] overflow-hidden rounded-[28px] bg-white shadow-soft">
            {compositeSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={compositeSrc} alt="친구들과 함께 완성할 전체 그림 속 내 자리" className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full items-center justify-center text-text-secondary">{UI_TEXT.common.loading}</div>
            )}
          </div>

          <div className="grid w-full max-w-md grid-cols-2 gap-4">
            <ChildButton variant="ghost" size="large" onClick={() => router.push(`/draw/${assignment.id}`)}>
              {UI_TEXT.preview.keepDrawing}
            </ChildButton>
            <ChildButton
              variant="accent"
              size="large"
              icon={Send}
              onClick={handleSend}
              disabled={phase === "submitting"}
            >
              {UI_TEXT.preview.sendIt}
            </ChildButton>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-10 py-6 text-center">
          <div className="relative">
            <div className="aspect-square w-56 overflow-hidden rounded-[28px] bg-white shadow-soft [animation:gentle-pop_600ms_ease-out]">
              {compositeSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={compositeSrc} alt="" className="h-full w-full object-contain" />
              )}
            </div>
            <Sparkles
              aria-hidden="true"
              size={40}
              className="absolute -right-4 -top-4 text-accent-yellow-dark [animation:sparkle-pulse_1.4s_ease-in-out_infinite]"
            />
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary">{UI_TEXT.submit.heading}</h1>
          <ChildButton
            variant="accent"
            size="large"
            className="max-w-md"
            fullWidth
            onClick={() => router.push(`/waiting-room/${assignment.roomId}`)}
          >
            {UI_TEXT.submit.cta}
          </ChildButton>
        </div>
      )}
    </TabletShell>
  );
}
