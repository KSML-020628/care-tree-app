import type { ReactNode } from "react";
import type { MotionPreset } from "@/lib/ai/artwork-analysis.types";

interface ArtworkMotionProps {
  preset: MotionPreset;
  children: ReactNode;
  className?: string;
}

const MOTION_CLASS: Record<MotionPreset, string> = {
  GENTLE_SWAY: "[animation:gentle-sway_3.5s_ease-in-out_infinite]",
  SOFT_BOUNCE: "[animation:bounce-soft_1.6s_ease-in-out_infinite]",
  SPARKLE: "[animation:sparkle-pulse_1.8s_ease-in-out_infinite]",
  FLOAT: "[animation:float-drift_5s_ease-in-out_infinite]",
  FADE_IN: "[animation:gentle-pop_700ms_ease-out]",
  NONE: "",
};

/** AI(또는 fallback)가 고른 motionPreset 하나만 그대로 적용한다. 좌표·합성 로직에는 관여하지 않는다. */
export default function ArtworkMotion({ preset, children, className = "" }: ArtworkMotionProps) {
  return <div className={`${MOTION_CLASS[preset]} ${className}`}>{children}</div>;
}
