"use client";

import { TreePine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import RegistrationDisplay from "@/components/auth/RegistrationDisplay";
import RegistrationKeypad from "@/components/auth/RegistrationKeypad";
import ChildButton from "@/components/common/ChildButton";
import TabletShell from "@/components/common/TabletShell";
import CareHam from "@/components/mascot/CareHam";
import CareHamSpeechBubble from "@/components/mascot/CareHamSpeechBubble";
import { UI_TEXT } from "@/lib/constants/ui-text";
import { verifyRegistrationNumber } from "@/lib/mock/users";
import { useSessionStore } from "@/lib/store/session-store";

const REGISTRATION_LENGTH = 6;
const WELCOME_DELAY_MS = 1100;

type Status = "idle" | "checking" | "error" | "welcome";

export default function LoginPage() {
  const router = useRouter();
  const login = useSessionStore((state) => state.login);
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  function handleDigit(digit: string) {
    if (status === "checking") return;
    setStatus("idle");
    setCode((current) => (current.length >= REGISTRATION_LENGTH ? current : current + digit));
  }

  function handleBackspace() {
    if (status === "checking") return;
    setStatus("idle");
    setCode((current) => current.slice(0, -1));
  }

  function handleClearAll() {
    if (status === "checking") return;
    setStatus("idle");
    setCode("");
  }

  async function handleSubmit() {
    if (code.length !== REGISTRATION_LENGTH || status === "checking") return;
    setStatus("checking");
    const user = await verifyRegistrationNumber(code);
    if (!user) {
      setStatus("error");
      setCode("");
      return;
    }
    login(user);
    setStatus("welcome");
    window.setTimeout(() => router.push("/weekly-theme"), WELCOME_DELAY_MS);
  }

  if (status === "welcome") {
    return (
      <TabletShell background="sky">
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-10 py-6 [animation:gentle-pop_400ms_ease-out]">
          <CareHamSpeechBubble tone="accent">반가워! 같이 색칠하러 가자!</CareHamSpeechBubble>
          <CareHam type="GUIDE" size="LARGE" reaction="WAVE" />
        </div>
      </TabletShell>
    );
  }

  return (
    <TabletShell background="sky">
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-10 py-6">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-white text-primary-blue shadow-soft">
            <TreePine aria-hidden="true" size={44} />
          </div>
          <h1 className="text-3xl font-extrabold text-text-primary">{UI_TEXT.common.serviceName}</h1>
        </div>

        <div className="w-full max-w-md rounded-[28px] bg-white/90 p-8 shadow-soft">
          <p className="text-center text-xl font-bold text-text-primary">{UI_TEXT.login.title}</p>
          <p className="mt-1 text-center text-sm font-semibold text-text-secondary">{UI_TEXT.login.subtitle}</p>

          <div className="mt-6">
            <RegistrationDisplay value={code} />
          </div>

          <p
            className="mt-4 min-h-[1.5rem] text-center text-base font-semibold text-warm"
            role="alert"
            aria-live="polite"
          >
            {status === "error" ? UI_TEXT.login.softError : status === "checking" ? UI_TEXT.login.checking : ""}
          </p>

          <div className="mt-4">
            <RegistrationKeypad
              onDigit={handleDigit}
              onBackspace={handleBackspace}
              onClearAll={handleClearAll}
              digitsEntered={code.length}
              maxDigits={REGISTRATION_LENGTH}
            />
          </div>
        </div>

        <ChildButton
          variant="accent"
          size="large"
          fullWidth
          className="max-w-md"
          disabled={code.length !== REGISTRATION_LENGTH || status === "checking"}
          onClick={handleSubmit}
          aria-label={UI_TEXT.login.submit}
        >
          {UI_TEXT.login.submit}
        </ChildButton>
      </div>
    </TabletShell>
  );
}
