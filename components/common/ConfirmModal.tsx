"use client";

import { UI_TEXT } from "@/lib/constants/ui-text";
import ChildButton from "./ChildButton";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

/** 실수로 지우거나 화면을 벗어나는 일을 막기 위한 확인창. 항상 "아니요"가 먼저, 강한 동작이 뒤에 온다. */
export default function ConfirmModal({
  open,
  title,
  body,
  confirmLabel = UI_TEXT.common.confirmYes,
  cancelLabel = UI_TEXT.common.confirmNo,
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B234A]/45 px-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-2xl">
        <h2 id="confirm-modal-title" className="text-2xl font-extrabold text-text-primary">
          {title}
        </h2>
        {body && <p className="mt-3 text-lg text-text-secondary">{body}</p>}
        <div className="mt-8 grid grid-cols-2 gap-4">
          <ChildButton variant="ghost" size="medium" onClick={onCancel} aria-label={cancelLabel}>
            {cancelLabel}
          </ChildButton>
          <ChildButton
            variant={danger ? "danger" : "primary"}
            size="medium"
            onClick={onConfirm}
            aria-label={confirmLabel}
          >
            {confirmLabel}
          </ChildButton>
        </div>
      </div>
    </div>
  );
}
