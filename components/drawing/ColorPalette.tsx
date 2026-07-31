"use client";

import { Check } from "lucide-react";
import { COLOR_PALETTE, type ColorOption } from "@/lib/config/colors";
import { UI_TEXT } from "@/lib/constants/ui-text";

interface ColorPaletteProps {
  colorId: string;
  onColorChange: (colorId: string) => void;
  /** 기본은 전체 팔레트. 프로필 그림판처럼 더 단순한 화면에서는 색 목록을 줄여서 넘긴다. */
  colors?: readonly ColorOption[];
}

/** 오른쪽 색상 영역. 큰 원형 버튼이라 손가락이 서툰 아이도 실수 없이 누를 수 있다. */
export default function ColorPalette({ colorId, onColorChange, colors = COLOR_PALETTE }: ColorPaletteProps) {
  return (
    <aside className="flex w-[152px] shrink-0 flex-col gap-3 overflow-y-auto rounded-[24px] bg-white p-3 shadow-soft">
      <p className="text-center text-sm font-bold text-text-secondary">{UI_TEXT.drawing.colors}</p>
      <div className="grid grid-cols-3 gap-2.5">
        {colors.map((color) => {
          const selected = color.id === colorId;
          return (
            <button
              key={color.id}
              type="button"
              onClick={() => onColorChange(color.id)}
              aria-label={color.label}
              aria-pressed={selected}
              className={[
                "relative flex h-12 w-12 items-center justify-center rounded-full border-2",
                color.id === "white" ? "border-[#DCE3FF]" : "border-transparent",
                selected ? "ring-4 ring-primary-blue ring-offset-2" : "",
              ].join(" ")}
              style={{ background: color.swatch }}
            >
              {selected && (
                <Check
                  aria-hidden="true"
                  size={20}
                  strokeWidth={3.4}
                  className={color.id === "white" || color.id === "yellow" ? "text-text-primary" : "text-white"}
                />
              )}
              {color.isGlitterMetal && (
                <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 text-xs">
                  ✨
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
