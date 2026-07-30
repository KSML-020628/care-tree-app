"use client";

import { useEffect, useRef } from "react";
import { UI_TEXT } from "@/lib/constants/ui-text";
import type { WeeklyTheme } from "@/types/theme";
import FloatingDecoration from "./FloatingDecoration";

interface WeeklyThemeIntroProps {
  theme: WeeklyTheme;
  onFinished: () => void;
}

const INTRO_DURATION_MS = 3400;

/** 로그인 직후 잠깐 보여주는 이번 주 주제 화면. 시간이 지나면 저절로 다음 화면으로 넘어간다. */
export default function WeeklyThemeIntro({ theme, onFinished }: WeeklyThemeIntroProps) {
  const hasFinishedRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => finishOnce(), INTRO_DURATION_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function finishOnce() {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    onFinished();
  }

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-b from-[#CFE3FF] via-[#E4EEFF] to-[#F5F8FF]">
      <FloatingDecoration />

      <button
        type="button"
        onClick={finishOnce}
        aria-label={UI_TEXT.weeklyTheme.skip}
        className="absolute right-6 top-6 rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-text-secondary shadow-sm"
      >
        {UI_TEXT.weeklyTheme.skip}
      </button>

      <div
        className="flex flex-col items-center gap-4 text-center"
        style={{ animation: `theme-intro-fade ${INTRO_DURATION_MS}ms ease-in-out forwards` }}
      >
        <span className="text-8xl" aria-hidden="true">
          🌳
        </span>
        <p className="text-2xl font-bold text-text-secondary">{UI_TEXT.weeklyTheme.eyebrow}</p>
        <h1 className="text-6xl font-extrabold text-text-primary">{theme.title}</h1>
        <p className="mt-4 text-lg font-semibold text-text-secondary">{UI_TEXT.weeklyTheme.footerNote}</p>
      </div>
    </div>
  );
}
