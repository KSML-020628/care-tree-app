"use client";

import { useEffect } from "react";

interface SeedDropAnimationProps {
  onComplete?: () => void;
  durationMs?: number;
}

/** 해바라씨 하나가 톡 떨어지는 짧은 연출. 큰 화면 흔들림이나 반복 깜빡임 없이 한 번만 재생된다. */
export default function SeedDropAnimation({ onComplete, durationMs = 900 }: SeedDropAnimationProps) {
  useEffect(() => {
    if (!onComplete) return;
    const timer = window.setTimeout(onComplete, durationMs);
    return () => window.clearTimeout(timer);
  }, [onComplete, durationMs]);

  return (
    <div className="pointer-events-none flex justify-center" aria-hidden="true">
      <span className="text-3xl" style={{ animation: `seed-drop ${durationMs}ms ease-in forwards` }}>
        🌻
      </span>
    </div>
  );
}
