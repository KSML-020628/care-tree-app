import { createClient } from "@supabase/supabase-js";

/**
 * 공동 캔버스(weekly_canvases·drawing_contributions)만 이 클라이언트로 Supabase에 저장한다.
 * 아직 Supabase Auth를 쓰지 않으므로(등록번호 mock 로그인 그대로 유지) anon 키만 쓰고,
 * 서버 전용 service_role 키는 이 파일에 절대 두지 않는다.
 *
 * 브라우저에 노출돼도 되는 값만 이 파일에 둔다 — anon 키는 RLS로 보호되는 게 전제다.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * 환경변수가 없는 개발 환경에서도 앱이 죽지 않도록, 값이 없으면 더미 URL로 생성만 해 둔다.
 * 실제 호출은 isSupabaseConfigured를 먼저 확인하는 lib/mock/weekly-canvas.ts 쪽에서 막는다.
 */
export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key",
);
