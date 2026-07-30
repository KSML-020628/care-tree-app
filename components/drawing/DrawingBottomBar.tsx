"use client";

import { Check, Eye, Redo2, Trash2, Undo2 } from "lucide-react";
import ChildButton from "@/components/common/ChildButton";
import { BRUSH_SIZE_DOT_PX } from "@/lib/config/brush-sizes";
import { getColorOption } from "@/lib/config/colors";
import { getToolConfig } from "@/lib/config/tools";
import { UI_TEXT } from "@/lib/constants/ui-text";
import type { SaveStatus } from "@/lib/store/drawing-store";
import type { BrushSize, DrawingTool } from "@/types/drawing";

interface DrawingBottomBarProps {
  tool: DrawingTool;
  colorId: string;
  brushSize: BrushSize;
  canUndo: boolean;
  canRedo: boolean;
  saveStatus: SaveStatus;
  onUndo: () => void;
  onRedo: () => void;
  onRequestClearAll: () => void;
  onPreview: () => void;
  onDone: () => void;
}

const SAVE_STATUS_LABEL: Record<SaveStatus, string> = {
  idle: "",
  saving: UI_TEXT.drawing.autoSaving,
  saved: UI_TEXT.drawing.autoSaved,
  error: UI_TEXT.drawing.saveFailed,
};

/** 하단 액션 바. 왼쪽은 되돌리기 계열, 가운데는 지금 고른 도구·색, 오른쪽은 미리보기/제출이다. */
export default function DrawingBottomBar({
  tool,
  colorId,
  brushSize,
  canUndo,
  canRedo,
  saveStatus,
  onUndo,
  onRedo,
  onRequestClearAll,
  onPreview,
  onDone,
}: DrawingBottomBarProps) {
  const toolConfig = getToolConfig(tool);
  const ToolIcon = toolConfig.icon;
  const color = getColorOption(colorId);

  return (
    <div className="flex h-[92px] shrink-0 items-center justify-between gap-4 rounded-[24px] bg-white px-5 shadow-soft">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label={UI_TEXT.drawing.undo}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0F3FF] text-text-primary disabled:opacity-35"
        >
          <Undo2 aria-hidden="true" size={26} />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          aria-label={UI_TEXT.drawing.redo}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0F3FF] text-text-primary disabled:opacity-35"
        >
          <Redo2 aria-hidden="true" size={26} />
        </button>
        <button
          type="button"
          onClick={onRequestClearAll}
          aria-label={UI_TEXT.drawing.clearAll}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF1EE] text-[#E0564B]"
        >
          <Trash2 aria-hidden="true" size={26} />
        </button>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F0F3FF] text-text-primary">
          <ToolIcon aria-hidden="true" size={22} />
        </span>
        <span
          className="h-8 w-8 shrink-0 rounded-full border-2 border-[#DCE3FF]"
          style={{ background: color.swatch }}
          aria-hidden="true"
        />
        <span
          className="shrink-0 rounded-full bg-text-primary"
          style={{ width: BRUSH_SIZE_DOT_PX[brushSize], height: BRUSH_SIZE_DOT_PX[brushSize] }}
          aria-hidden="true"
        />
        {saveStatus !== "idle" && (
          <span
            className={`flex shrink-0 items-center gap-1 truncate text-xs font-bold ${
              saveStatus === "error" ? "text-warm" : "text-success"
            }`}
            aria-live="polite"
          >
            {saveStatus === "saved" && <Check aria-hidden="true" size={14} />}
            {SAVE_STATUS_LABEL[saveStatus]}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <ChildButton variant="ghost" size="medium" icon={Eye} onClick={onPreview}>
          {UI_TEXT.drawing.preview}
        </ChildButton>
        <ChildButton
          variant="accent"
          size="medium"
          icon={Check}
          onClick={onDone}
          className="min-w-[200px]"
        >
          {UI_TEXT.drawing.done}
        </ChildButton>
      </div>
    </div>
  );
}
