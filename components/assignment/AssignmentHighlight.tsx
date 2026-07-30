import type { CSSProperties, ReactNode } from "react";

interface AssignmentHighlightProps {
  style: CSSProperties;
  children?: ReactNode;
}

/** 배정된 사분면 자리에 노란 테두리와 은은한 빛을 그려서, 숫자 없이도 시각적으로 바로 알아볼 수 있게 한다. */
export default function AssignmentHighlight({ style, children }: AssignmentHighlightProps) {
  return (
    <div
      className="absolute rounded-2xl border-[6px] border-accent-yellow-dark shadow-[0_0_0_6px_rgba(255,216,77,0.35)]"
      style={{ ...style, animation: "gentle-pop 500ms ease-out" }}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}
