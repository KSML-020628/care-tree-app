"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

type Variant = "primary" | "accent" | "ghost" | "danger";
type Size = "medium" | "large";

interface ChildButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-primary-blue text-white shadow-[0_6px_0_rgba(56,84,216,0.55)] active:shadow-[0_2px_0_rgba(56,84,216,0.55)] hover:brightness-105",
  accent:
    "bg-accent-yellow text-text-primary shadow-[0_6px_0_rgba(244,190,36,0.65)] active:shadow-[0_2px_0_rgba(244,190,36,0.65)] hover:brightness-105",
  ghost:
    "bg-white text-text-primary border-2 border-[#DCE3FF] shadow-[0_4px_0_rgba(97,112,154,0.18)] active:shadow-[0_1px_0_rgba(97,112,154,0.18)]",
  danger:
    "bg-white text-[#E0564B] border-2 border-[#FFD3CC] shadow-[0_4px_0_rgba(224,86,75,0.18)] active:shadow-[0_1px_0_rgba(224,86,75,0.18)]",
};

const SIZE_CLASSES: Record<Size, string> = {
  medium: "min-h-[56px] px-6 text-lg rounded-[20px] gap-2",
  large: "min-h-[76px] px-9 text-2xl rounded-[26px] gap-3",
};

/**
 * 이 서비스의 모든 주요 버튼이 쓰는 공통 버튼.
 * 실수로 눌러도 되돌릴 수 있는 화면이 대부분이므로, 대신 "누르는 느낌"을 분명하게 준다.
 */
export default function ChildButton({
  children,
  variant = "primary",
  size = "large",
  icon: Icon,
  fullWidth,
  className = "",
  disabled,
  ...rest
}: ChildButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center font-bold transition-transform duration-150",
        "active:translate-y-[3px] disabled:opacity-45 disabled:pointer-events-none disabled:active:translate-y-0",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {Icon && <Icon aria-hidden="true" size={size === "large" ? 28 : 22} strokeWidth={2.4} />}
      <span>{children}</span>
    </button>
  );
}
