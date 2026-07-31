"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import ConfirmModal from "@/components/common/ConfirmModal";
import PageHeader from "@/components/common/PageHeader";
import TabletShell from "@/components/common/TabletShell";
import ColorPalette from "@/components/drawing/ColorPalette";
import DrawingBottomBar from "@/components/drawing/DrawingBottomBar";
import DrawingCanvas, { type DrawingCanvasHandle } from "@/components/drawing/DrawingCanvas";
import ToolPalette from "@/components/drawing/ToolPalette";
import CareHamSpeechBubble from "@/components/mascot/CareHamSpeechBubble";
import { PROFILE_COLOR_PALETTE } from "@/lib/config/colors";
import { PROFILE_TOOL_CONFIGS } from "@/lib/config/tools";
import { UI_TEXT } from "@/lib/constants/ui-text";
import { useDrawingStore } from "@/lib/store/drawing-store";
import { useSessionStore } from "@/lib/store/session-store";

/** 프로필 그림판에는 원본 도안이 없다 — 완전히 투명한 1x1 placeholder로 "선화 없음"을 표현한다. */
const BLANK_LINE_ART =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

function buildProfileDrawingId(participantId: string): string {
  return `profile-${participantId}`;
}

function ProfileDrawContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const suggestion = searchParams.get("suggestion");

  const hydrated = useSessionStore((state) => state.hydrated);
  const user = useSessionStore((state) => state.user);

  const strokes = useDrawingStore((state) => state.strokes);
  const redoStack = useDrawingStore((state) => state.redoStack);
  const tool = useDrawingStore((state) => state.tool);
  const colorId = useDrawingStore((state) => state.colorId);
  const brushSize = useDrawingStore((state) => state.brushSize);
  const saveStatus = useDrawingStore((state) => state.saveStatus);
  const drawingAssignmentId = useDrawingStore((state) => state.assignmentId);
  const loadForAssignment = useDrawingStore((state) => state.loadForAssignment);
  const undo = useDrawingStore((state) => state.undo);
  const redo = useDrawingStore((state) => state.redo);
  const clearAll = useDrawingStore((state) => state.clearAll);
  const setTool = useDrawingStore((state) => state.setTool);
  const setColorId = useDrawingStore((state) => state.setColorId);
  const setBrushSize = useDrawingStore((state) => state.setBrushSize);

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const canvasRef = useRef<DrawingCanvasHandle>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    const profileDrawingId = buildProfileDrawingId(user.id);
    if (drawingAssignmentId !== profileDrawingId) loadForAssignment(profileDrawingId);
  }, [hydrated, user, router, drawingAssignmentId, loadForAssignment]);

  function goToPreview() {
    const query = mode ? `?mode=${encodeURIComponent(mode)}` : "";
    router.push(`/profile/preview${query}`);
  }

  if (!user) {
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
      <PageHeader onBack={() => router.back()} title={UI_TEXT.profileDraw.heading} />

      {suggestion && (
        <div className="flex justify-center px-4 pb-2">
          <CareHamSpeechBubble tone="accent">{`${suggestion}을(를) 그려볼까?`}</CareHamSpeechBubble>
        </div>
      )}

      <p className="px-4 pb-2 text-center text-sm font-semibold text-text-secondary">{UI_TEXT.profileDraw.hint}</p>

      <div className="flex min-h-0 flex-1 gap-4 px-4 pb-4">
        <ToolPalette
          tool={tool}
          onToolChange={setTool}
          brushSize={brushSize}
          onBrushSizeChange={setBrushSize}
          tools={PROFILE_TOOL_CONFIGS}
        />

        <div className="flex min-w-0 flex-1 items-center justify-center">
          <DrawingCanvas ref={canvasRef} lineArtSrc={BLANK_LINE_ART} />
        </div>

        <ColorPalette colorId={colorId} onColorChange={setColorId} colors={PROFILE_COLOR_PALETTE} />
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
          onRequestClearAll={() => setShowClearConfirm(true)}
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
        onConfirm={() => {
          clearAll();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />
    </TabletShell>
  );
}

export default function ProfileDrawPage() {
  return (
    <Suspense
      fallback={
        <TabletShell>
          <div className="flex flex-1 items-center justify-center">
            <p className="text-xl font-bold text-text-secondary">{UI_TEXT.common.loading}</p>
          </div>
        </TabletShell>
      }
    >
      <ProfileDrawContent />
    </Suspense>
  );
}
