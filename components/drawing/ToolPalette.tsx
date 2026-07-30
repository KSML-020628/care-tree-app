"use client";

import { TOOL_CONFIGS } from "@/lib/config/tools";
import { UI_TEXT } from "@/lib/constants/ui-text";
import type { BrushSize, DrawingTool } from "@/types/drawing";
import BrushSizeSelector from "./BrushSizeSelector";

interface ToolPaletteProps {
  tool: DrawingTool;
  onToolChange: (tool: DrawingTool) => void;
  brushSize: BrushSize;
  onBrushSizeChange: (size: BrushSize) => void;
}

/** 왼쪽 도구 영역. 아이콘과 한글 이름을 함께 보여줘서 글을 몰라도 아이콘만으로 고를 수 있게 한다. */
export default function ToolPalette({ tool, onToolChange, brushSize, onBrushSizeChange }: ToolPaletteProps) {
  return (
    <aside className="flex w-[132px] shrink-0 flex-col gap-3 overflow-y-auto rounded-[24px] bg-white p-3 shadow-soft">
      <p className="text-center text-sm font-bold text-text-secondary">{UI_TEXT.drawing.tools}</p>
      <div className="flex flex-col gap-2">
        {TOOL_CONFIGS.map((config) => {
          const Icon = config.icon;
          const selected = tool === config.id;
          return (
            <button
              key={config.id}
              type="button"
              onClick={() => onToolChange(config.id)}
              aria-label={config.label}
              aria-pressed={selected}
              className={[
                "flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl transition-transform",
                selected
                  ? "scale-105 bg-accent-yellow text-text-primary shadow-[0_4px_0_rgba(244,190,36,0.5)]"
                  : "bg-[#F0F3FF] text-text-secondary",
              ].join(" ")}
            >
              <Icon aria-hidden="true" size={26} strokeWidth={2.2} />
              <span className="text-xs font-bold">{config.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-2 border-t border-[#EAEEFB] pt-3">
        <BrushSizeSelector value={brushSize} onChange={onBrushSizeChange} />
      </div>
    </aside>
  );
}
