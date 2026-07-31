"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import ChildButton from "@/components/common/ChildButton";
import TabletShell from "@/components/common/TabletShell";
import DrawingCanvas, { type DrawingCanvasHandle } from "@/components/drawing/DrawingCanvas";
import ProfilePreviewCard from "@/components/profile/ProfilePreviewCard";
import { UI_TEXT } from "@/lib/constants/ui-text";
import { buildDrawnProfile } from "@/lib/profile/profile-storage";
import { useDrawingStore } from "@/lib/store/drawing-store";
import { useProfileStore } from "@/lib/store/profile-store";
import { useSessionStore } from "@/lib/store/session-store";
import { clearDrawingProgress } from "@/lib/storage/local-drawing-storage";

const BLANK_LINE_ART =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

function buildProfileDrawingId(participantId: string): string {
  return `profile-${participantId}`;
}

function ProfilePreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  const hydrated = useSessionStore((state) => state.hydrated);
  const user = useSessionStore((state) => state.user);
  const profile = useProfileStore((state) => state.profile);
  const saveAndSetProfile = useProfileStore((state) => state.saveAndSetProfile);

  const strokes = useDrawingStore((state) => state.strokes);
  const drawingAssignmentId = useDrawingStore((state) => state.assignmentId);
  const loadForAssignment = useDrawingStore((state) => state.loadForAssignment);

  const canvasRef = useRef<DrawingCanvasHandle>(null);
  const [avatarImageUrl, setAvatarImageUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    const profileDrawingId = buildProfileDrawingId(user.id);
    if (drawingAssignmentId !== profileDrawingId) loadForAssignment(profileDrawingId);
  }, [hydrated, user, router, drawingAssignmentId, loadForAssignment]);

  // 그림판을 화면 밖에 잠깐 띄워서, 지금까지 그린 프로필 그림을 이미지로 내보낸다.
  useEffect(() => {
    if (!user || drawingAssignmentId !== buildProfileDrawingId(user.id)) return;
    const timer = window.setTimeout(() => {
      const exported = canvasRef.current?.exportDrawingLayer();
      if (exported) setAvatarImageUrl(exported);
    }, 50);
    return () => window.clearTimeout(timer);
  }, [user, drawingAssignmentId, strokes]);

  async function handleConfirm() {
    if (!user || !avatarImageUrl || isSaving) return;
    setIsSaving(true);
    const artistName = profile?.artistName ?? user.nickname;
    const draft = buildDrawnProfile(user.id, artistName, avatarImageUrl);
    await saveAndSetProfile(draft);
    clearDrawingProgress(buildProfileDrawingId(user.id));
    router.replace(mode === "edit" ? "/profile" : "/home");
  }

  function handleKeepDrawing() {
    const query = mode ? `?mode=${encodeURIComponent(mode)}` : "";
    router.push(`/profile/draw${query}`);
  }

  if (!user) {
    return (
      <TabletShell>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-xl font-bold text-text-secondary">{UI_TEXT.common.loading}</p>
        </div>
      </TabletShell>
    );
  }

  return (
    <TabletShell background="sky">
      {/* 화면에는 보이지 않지만, 그림을 내보내기 위해 실제로 떠 있어야 하는 그림판. */}
      <div
        className="pointer-events-none fixed left-0 top-0 -z-10 h-[512px] w-[512px] opacity-0"
        aria-hidden="true"
      >
        <DrawingCanvas ref={canvasRef} lineArtSrc={BLANK_LINE_ART} readOnly />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-10 py-6">
        <h1 className="text-2xl font-extrabold text-text-primary">{UI_TEXT.profilePreview.heading}</h1>

        {avatarImageUrl ? (
          <ProfilePreviewCard avatarImageUrl={avatarImageUrl} artistName={profile?.artistName ?? user.nickname} />
        ) : (
          <p className="text-lg font-bold text-text-secondary">{UI_TEXT.common.loading}</p>
        )}

        <div className="grid w-full max-w-md grid-cols-2 gap-4">
          <ChildButton variant="ghost" size="large" disabled={isSaving} onClick={handleKeepDrawing}>
            {UI_TEXT.profilePreview.keepDrawing}
          </ChildButton>
          <ChildButton variant="accent" size="large" disabled={!avatarImageUrl || isSaving} onClick={handleConfirm}>
            {UI_TEXT.profilePreview.confirm}
          </ChildButton>
        </div>
      </div>
    </TabletShell>
  );
}

/** 프로필 그림을 바로 저장하지 않고, 확인 화면을 한 번 거친다(친구들에게 어떻게 보이는지 미리 보여준다). */
export default function ProfilePreviewPage() {
  return (
    <Suspense
      fallback={
        <TabletShell>
          <div className="flex flex-1 items-center justify-center">
            <p className="text-xl font-bold text-text-secondary">{UI_TEXT.common.loading}</p>
          </div>
        </TabletShell>
      }
    >
      <ProfilePreviewContent />
    </Suspense>
  );
}
