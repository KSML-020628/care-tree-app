"use client";

import { Sparkles } from "lucide-react";
import { useEffect } from "react";

interface SeedDropAnimationProps {
  onComplete?: () => void;
  durationMs?: number;
}

/** 해바라씨가 떨어져 항아리에 들어간 뒤, 아주 짧게 반짝이는 작은 별 4개. 화면 흔들림이나 반복 없이 한 번만 재생된다. */
const SPARKLES = [
  { top: "-4px", left: "-20px", delayMs: 260, size: 13 },
  { top: "-14px", left: "8px", delayMs: 380, size: 11 },
  { top: "2px", left: "22px", delayMs: 480, size: 10 },
  { top: "8px", left: "-26px", delayMs: 560, size: 10 },
];

/** 해바라씨 하나가 톡 떨어지는 짧은 연출. 큰 화면 흔들림이나 반복 깜빡임 없이 한 번만 재생된다. */
export default function SeedDropAnimation({ onComplete, durationMs = 900 }: SeedDropAnimationProps) {
  useEffect(() => {
    if (!onComplete) return;
    const timer = window.setTimeout(onComplete, durationMs);
    return () => window.clearTimeout(timer);
  }, [onComplete, durationMs]);

  return (
    <div className="pointer-events-none relative flex justify-center" aria-hidden="true">
      <span className="text-3xl" style={{ animation: `seed-drop ${durationMs}ms ease-in forwards` }}>
        🌻
      </span>
      {SPARKLES.map((sparkle, index) => (
        <Sparkles
          key={index}
          aria-hidden="true"
          size={sparkle.size}
          className="absolute text-accent-yellow-dark opacity-0"
          style={{
            top: sparkle.top,
            left: `calc(50% + ${sparkle.left})`,
            animation: `sparkle-pulse 500ms ease-out ${sparkle.delayMs}ms 1 forwards`,
          }}
        />
      ))}
    </div>
  );
}
