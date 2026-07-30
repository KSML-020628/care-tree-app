import { vi } from "vitest";
import { fakeSupabaseClient } from "./helpers/fake-supabase";

/**
 * 모든 테스트에서 lib/supabase/client.ts를 인메모리 대역으로 바꿔치기한다.
 * 실제 Supabase 프로젝트로 네트워크 요청을 보내지 않고도, weekly-canvas.ts의 실제 코드를 그대로 검증한다.
 */
vi.mock("@/lib/supabase/client", () => ({
  supabase: fakeSupabaseClient,
  isSupabaseConfigured: true,
}));
