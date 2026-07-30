"use client";

import { useState } from "react";
import { CARE_HAM_CONFIG, DEFAULT_MASCOT_IMAGE, type ActiveCareHamType } from "@/lib/mascot/mascot-config";

export type CareHamSize = "SMALL" | "MEDIUM" | "LARGE";
export type CareHamReactionType = "WAVE" | "BOUNCE" | "CHEER" | "FADE";

export interface CareHamProps {
  type: ActiveCareHamType;
  size?: CareHamSize;
  reaction?: CareHamReactionType;
  message?: string;
  className?: string;
}

const SIZE_PX: Record<CareHamSize, number> = { SMALL: 56, MEDIUM: 88, LARGE: 132 };

const REACTION_CLASS: Record<CareHamReactionType, string> = {
  WAVE: "[animation:wave-wiggle_1.2s_ease-in-out_2]",
  BOUNCE: "[animation:bounce-soft_1.1s_ease-in-out_infinite]",
  CHEER: "[animation:gentle-pop_450ms_ease-out]",
  FADE: "transition-opacity duration-500 opacity-100",
};

type LoadStage = "primary" | "default" | "emoji";

/**
 * 케어햄 마스코트. 개별 이미지가 없어도(placeholder 단계) 절대 화면이 깨지지 않는다.
 * 1) 종류별 이미지 -> 2) 공용 default-ham.webp -> 3) 귀여운 이모지 순서로 대체한다.
 * 실제 이미지는 public/images/mascots/ 아래 같은 파일명으로 넣기만 하면 자동 적용된다.
 */
export default function CareHam({ type, size = "MEDIUM", reaction, message, className = "" }: CareHamProps) {
  const config = CARE_HAM_CONFIG[type];
  const [stage, setStage] = useState<LoadStage>("primary");
  const pixelSize = SIZE_PX[size];
  const reactionClass = reaction ? REACTION_CLASS[reaction] : "";

  function handleError() {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[CareHam] ${stage === "primary" ? config.imagePath : DEFAULT_MASCOT_IMAGE} 이미지를 찾지 못해 대체 이미지를 표시해요.`);
    }
    setStage((current) => (current === "primary" ? "default" : "emoji"));
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        className={`flex items-center justify-center rounded-full bg-primary-blue-light/25 ${reactionClass}`}
        style={{ width: pixelSize, height: pixelSize }}
      >
        {stage === "emoji" ? (
          <span style={{ fontSize: pixelSize * 0.55 }} aria-hidden="true">
            {config.emojiFallback}
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={stage === "primary" ? config.imagePath : DEFAULT_MASCOT_IMAGE}
            alt={config.label}
            width={pixelSize}
            height={pixelSize}
            className="h-full w-full rounded-full object-contain"
            onError={handleError}
          />
        )}
      </div>
      {message && <p className="max-w-[180px] text-center text-sm font-bold text-text-primary">{message}</p>}
    </div>
  );
}
