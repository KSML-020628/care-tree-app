"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TabletShell from "@/components/common/TabletShell";
import ProfileOnboardingIntro from "@/components/onboarding/ProfileOnboardingIntro";
import { UI_TEXT } from "@/lib/constants/ui-text";
import { buildDefaultCareHamProfile } from "@/lib/profile/profile-storage";
import { useProfileStore } from "@/lib/store/profile-store";
import { useSessionStore } from "@/lib/store/session-store";

/**
 * 최초 로그인 사용자에게만 보여주는 프로필 그림 안내 화면.
 * 이미 프로필이 있는 사용자가 새로고침·재로그인으로 여기 다시 들어오면 즉시 /home으로 보낸다.
 */
export default function ProfileOnboardingPage() {
  const router = useRouter();
  const hydrated = useSessionStore((state) => state.hydrated);
  const user = useSessionStore((state) => state.user);
  const profile = useProfileStore((state) => state.profile);
  const profileLoaded = useProfileStore((state) => state.loaded);
  const loadProfile = useProfileStore((state) => state.loadProfile);
  const saveAndSetProfile = useProfileStore((state) => state.saveAndSetProfile);
  const [startingDefault, setStartingDefault] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    loadProfile(user.id);
  }, [hydrated, user, router, loadProfile]);

  useEffect(() => {
    if (profileLoaded && profile?.onboardingCompleted) router.replace("/home");
  }, [profileLoaded, profile, router]);

  function handleStartDrawing(suggestion?: string) {
    const query = suggestion ? `?suggestion=${encodeURIComponent(suggestion)}` : "";
    router.push(`/profile/draw${query}`);
  }

  async function handleStartWithDefaultCareHam() {
    if (!user || startingDefault) return;
    setStartingDefault(true);
    const draft = buildDefaultCareHamProfile(user.id, user.nickname);
    await saveAndSetProfile(draft);
    router.replace("/home");
  }

  if (!user || !profileLoaded || profile?.onboardingCompleted) {
    return (
      <TabletShell background="sky">
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xl font-bold text-text-secondary">{UI_TEXT.common.loading}</p>
        </div>
      </TabletShell>
    );
  }

  return (
    <TabletShell background="sky">
      <ProfileOnboardingIntro
        onStartDrawing={handleStartDrawing}
        onStartWithDefaultCareHam={handleStartWithDefaultCareHam}
      />
    </TabletShell>
  );
}
