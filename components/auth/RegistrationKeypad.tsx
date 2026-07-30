"use client";

import { Delete } from "lucide-react";
import { UI_TEXT } from "@/lib/constants/ui-text";

interface RegistrationKeypadProps {
  onDigit: (digit: string) => void;
  onBackspace: () => void;
  onClearAll: () => void;
  digitsEntered: number;
  maxDigits: number;
}

const DIGIT_ROWS: readonly (readonly string[])[] = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
];

const KEY_CLASSES =
  "flex h-20 items-center justify-center rounded-3xl bg-white text-3xl font-extrabold text-text-primary shadow-[0_5px_0_rgba(97,112,154,0.2)] active:translate-y-[3px] active:shadow-[0_1px_0_rgba(97,112,154,0.2)] disabled:opacity-40 disabled:pointer-events-none";

/** 브라우저 기본 키보드 대신 쓰는 화면 안 숫자 키패드. 아이가 손가락으로 크게 눌러도 실수하지 않도록 버튼을 크게 둔다. */
export default function RegistrationKeypad({
  onDigit,
  onBackspace,
  onClearAll,
  digitsEntered,
  maxDigits,
}: RegistrationKeypadProps) {
  const isFull = digitsEntered >= maxDigits;

  return (
    <div className="mx-auto grid w-full max-w-md grid-cols-3 gap-3">
      {DIGIT_ROWS.flat().map((digit) => (
        <button
          key={digit}
          type="button"
          className={KEY_CLASSES}
          onClick={() => onDigit(digit)}
          disabled={isFull}
          aria-label={`숫자 ${digit}`}
        >
          {digit}
        </button>
      ))}

      <button
        type="button"
        className={`${KEY_CLASSES} text-base`}
        onClick={onClearAll}
        disabled={digitsEntered === 0}
        aria-label={UI_TEXT.login.clearAll}
      >
        {UI_TEXT.login.clearAll}
      </button>

      <button
        type="button"
        className={KEY_CLASSES}
        onClick={() => onDigit("0")}
        disabled={isFull}
        aria-label="숫자 0"
      >
        0
      </button>

      <button
        type="button"
        className={KEY_CLASSES}
        onClick={onBackspace}
        disabled={digitsEntered === 0}
        aria-label={UI_TEXT.login.clear}
      >
        <Delete aria-hidden="true" size={30} />
      </button>
    </div>
  );
}
