"use client";

import { useEffect, useState } from "react";
import CareHam, { type CareHamProps } from "./CareHam";
import CareHamSpeechBubble from "./CareHamSpeechBubble";

interface CareHamReactionProps extends Omit<CareHamProps, "message"> {
  message: string;
  /** 지정하면 이 시간(ms) 뒤 스스로 사라진다. 예: 자동 저장 알림은 최초 1회만 짧게 보여준다. */
  autoHideMs?: number;
  onHide?: () => void;
}

/** 케어햄 + 말풍선을 함께 보여주는 알림형 연출. */
export default function CareHamReaction({
  type,
  size = "MEDIUM",
  reaction = "BOUNCE",
  message,
  autoHideMs,
  onHide,
  className,
}: CareHamReactionProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!autoHideMs) return;
    const timer = window.setTimeout(() => {
      setVisible(false);
      onHide?.();
    }, autoHideMs);
    return () => window.clearTimeout(timer);
  }, [autoHideMs, onHide]);

  if (!visible) return null;

  return (
    <div className={`flex flex-col items-center gap-2 ${className ?? ""}`}>
      <CareHamSpeechBubble>{message}</CareHamSpeechBubble>
      <CareHam type={type} size={size} reaction={reaction} />
    </div>
  );
}
