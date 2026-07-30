"use client";

import { useEffect, useState } from "react";
import TabletShell from "@/components/common/TabletShell";
import type { ArtworkAnalysisResponse } from "@/lib/ai/artwork-analysis.types";

interface DebugEntry {
  contributionId: string;
  response: ArtworkAnalysisResponse;
}

const AI_DEBUG_ENABLED = process.env.NEXT_PUBLIC_ENABLE_AI_DEBUG === "true";

function findStoredAnalyses(): DebugEntry[] {
  if (typeof window === "undefined") return [];
  const entries: DebugEntry[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || !key.startsWith("care-tree:artwork-analysis:")) continue;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      entries.push({
        contributionId: key.replace("care-tree:artwork-analysis:", ""),
        response: JSON.parse(raw) as ArtworkAnalysisResponse,
      });
    } catch {
      // 손상된 데이터는 건너뛴다.
    }
  }
  return entries;
}

/**
 * 개발/발표 데모용 AI 적용 확인 화면. NEXT_PUBLIC_ENABLE_AI_DEBUG=true 일 때만 내용을 보여준다.
 * 아동 화면 어디에도 "AI"라는 말이나 이 경로로 가는 링크를 노출하지 않는다.
 */
export default function AiDebugPage() {
  const [entries, setEntries] = useState<DebugEntry[] | null>(null);

  useEffect(() => {
    if (!AI_DEBUG_ENABLED) return;
    // localStorage는 브라우저에만 있어서, 서버 렌더링 결과와 달라지지 않도록 마운트된 뒤에만 읽는다.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 위 이유로 의도된 패턴
    setEntries(findStoredAnalyses());
  }, []);

  if (!AI_DEBUG_ENABLED) {
    return (
      <TabletShell>
        <div className="flex flex-1 items-center justify-center px-10 text-center">
          <p className="text-lg font-bold text-text-secondary">
            이 화면은 지금 꺼져 있어요. (NEXT_PUBLIC_ENABLE_AI_DEBUG=true 로 켤 수 있어요)
          </p>
        </div>
      </TabletShell>
    );
  }

  return (
    <TabletShell>
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <h1 className="text-2xl font-extrabold text-text-primary">AI 적용 확인 (개발자용)</h1>
        <p className="mt-1 text-sm text-text-secondary">
          아동 화면에는 노출되지 않는 내부 확인용 화면입니다.
        </p>

        {!entries || entries.length === 0 ? (
          <p className="mt-6 text-text-secondary">아직 분석 결과가 없어요. 그림을 제출해 보세요.</p>
        ) : (
          <div className="mt-6 grid gap-4">
            {entries.map(({ contributionId, response }) => (
              <div key={contributionId} className="rounded-2xl border-2 border-[#DCE3FF] bg-white p-4 text-sm">
                <p className="font-bold text-text-primary">{contributionId}</p>
                <dl className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <div>
                    <dt className="text-text-secondary">source</dt>
                    <dd className="font-semibold">{response.source}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">motionPreset</dt>
                    <dd className="font-semibold">{response.analysis.motionPreset}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">praiseCategory</dt>
                    <dd className="font-semibold">{response.analysis.praiseCategory}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">confidence</dt>
                    <dd className="font-semibold">{response.analysis.confidence}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">reviewRequired</dt>
                    <dd className="font-semibold">{String(response.analysis.reviewRequired)}</dd>
                  </div>
                  <div>
                    <dt className="text-text-secondary">colors</dt>
                    <dd className="font-semibold">{response.analysis.dominantColorFamilies.join(", ")}</dd>
                  </div>
                </dl>
                <p className="mt-2 text-text-secondary">
                  detectedElements: {response.analysis.detectedElements.join(", ") || "(없음)"}
                </p>
                <p className="mt-1 text-text-primary">caption: {response.analysis.caption}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </TabletShell>
  );
}
