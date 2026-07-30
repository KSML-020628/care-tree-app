"use client";

import { HelpCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ConfirmModal from "@/components/common/ConfirmModal";
import PageHeader from "@/components/common/PageHeader";
import TabletShell from "@/components/common/TabletShell";
import ColorPalette from "@/components/drawing/ColorPalette";
import DrawingBottomBar from "@/components/drawing/DrawingBottomBar";
import DrawingCanvas, { type DrawingCanvasHandle } from "@/components/drawing/DrawingCanvas";
import ToolPalette from "@/components/drawing/ToolPalette";
import { QUADRANT_GRID_ORDER } from "@/lib/config/quadrants";
import { UI_TEXT } from "@/lib/constants/ui-text";
import { cropQuadrantLineArt } from "@/lib/drawing/quadrant-crop";
import { fetchActiveTheme } from "@/lib/mock/theme";
import { useDrawingStore } from "@/lib/store/drawing-store";
import { useSessionStore } from "@/lib/store/session-store";
import { getOrCreateAssignment, updateAssignmentStatus } from "@/lib/utils/random-assignment";

export default function DrawPage() {
  const params = useParams<{ assignmentId: string }>();
  const router = useRouter();

  const hydrated = useSessionStore((state) => state.hydrated);
  const user = useSessionStore((state) => state.user);
  const theme = useSessionStore((state) => state.theme);
  const assignment = useSessionStore((state) => state.assignment);
  const setTheme = useSessionStore((state) => state.setTheme);
  const setAssignment = useSessionStore((state) => state.setAssignment);

  const strokes = useDrawingStore((state) => state.strokes);
  const redoStack = useDrawingStore((state) => state.redoStack);
  const tool = useDrawingStore((state) => state.tool);
  const colorId = useDrawingStore((state) => state.colorId);
  const brushSize = useDrawingStore((state) => state.brushSize);
  const saveStatus = useDrawingStore((state) => state.saveStatus);
  const loadForAssignment = useDrawingStore((state) => state.loadForAssignment);
  const undo = useDrawingStore((state) => state.undo);
  const redo = useDrawingStore((state) => state.redo);
  const clearAll = useDrawingStore((state) => state.clearAll);
  const setTool = useDrawingStore((state) => state.setTool);
  const setColorId = useDrawingStore((state) => state.setColorId);
  const setBrushSize = useDrawingStore((state) => state.setBrushSize);

  const [lineArtSrc, setLineArtSrc] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const canvasRef = useRef<DrawingCanvasHandle>(null);

  // 로그인 정보를 확인하고, 없으면 알맞은 이전 화면으로 되돌린다.
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
      const nextAssignment = getOrCreateAssignment(user, theme);
      setAssignment(nextAssignment);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user, theme, assignment, params.assignmentId]);

  // 내가 맡은 조각의 선화(투명 배경)를 잘라 온다.
  useEffect(() => {
    if (!theme || !assignment) return;
    let cancelled = false;
    cropQuadrantLineArt(theme.fullImagePath, assignment.quadrant).then((dataUrl) => {
      if (!cancelled) setLineArtSrc(dataUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [theme, assignment]);

  // 이 조각에 저장된 그림을 불러오고, 상태를 "색칠 중"으로 바꾼다.
  useEffect(() => {
    if (!user || !theme || !assignment) return;
    loadForAssignment(assignment.id);
    if (assignment.status === "ASSIGNED") {
      const updated = updateAssignmentStatus(user.id, theme.id, "DRAWING");
      if (updated) setAssignment(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignment?.id]);

  // 저장 중이거나 저장이 막 실패했을 때만, 창을 닫기 전에 한 번 더 확인한다.
  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (saveStatus !== "saving" && saveStatus !== "error") return;
      event.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  function handleRequestClearAll() {
    setShowClearConfirm(true);
  }

  function handleConfirmClearAll() {
    clearAll();
    setShowClearConfirm(false);
  }

  function goToPreview() {
    if (!assignment) return;
    router.push(`/preview/${assignment.id}`);
  }

  const pieceIndex = assignment ? QUADRANT_GRID_ORDER.indexOf(assignment.quadrant) + 1 : 1;

  if (!user || !theme || !assignment || !lineArtSrc) {
    return (
      <TabletShell>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xl font-bold text-text-secondary">{UI_TEXT.common.loading}</p>
        </div>
      </TabletShell>
    );
  }

  return (
    <TabletShell>
      <PageHeader
        onBack={() => router.back()}
        title={UI_TEXT.drawing.themeLabel}
        subtitle={UI_TEXT.drawing.collabNote}
        rightSlot={
          <>
            <span className="rounded-full bg-primary-blue-light/30 px-3 py-1 text-sm font-extrabold text-primary-blue">
              {pieceIndex} / {QUADRANT_GRID_ORDER.length}
            </span>
            <button
              type="button"
              aria-label={UI_TEXT.common.help}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F0F3FF] text-text-secondary"
            >
              <HelpCircle aria-hidden="true" size={22} />
            </button>
          </>
        }
      />

      <div className="flex min-h-0 flex-1 gap-4 px-4 pb-4">
        <ToolPalette tool={tool} onToolChange={setTool} brushSize={brushSize} onBrushSizeChange={setBrushSize} />

        <div className="flex min-w-0 flex-1 items-center justify-center">
          <DrawingCanvas ref={canvasRef} lineArtSrc={lineArtSrc} />
        </div>

        <ColorPalette colorId={colorId} onColorChange={setColorId} />
      </div>

      <div className="px-4 pb-4">
        <DrawingBottomBar
          tool={tool}
          colorId={colorId}
          brushSize={brushSize}
          canUndo={strokes.length > 0}
          canRedo={redoStack.length > 0}
          saveStatus={saveStatus}
          onUndo={undo}
          onRedo={redo}
          onRequestClearAll={handleRequestClearAll}
          onPreview={goToPreview}
          onDone={goToPreview}
        />
      </div>

      <ConfirmModal
        open={showClearConfirm}
        title={UI_TEXT.drawing.clearConfirmTitle}
        body={UI_TEXT.drawing.clearConfirmBody}
        confirmLabel={UI_TEXT.drawing.clearAll}
        danger
        onConfirm={handleConfirmClearAll}
        onCancel={() => setShowClearConfirm(false)}
      />
    </TabletShell>
  );
}
