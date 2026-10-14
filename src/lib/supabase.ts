// Supabase 연결. 프로젝트 이름: my-invitation
//
// URL과 키는 .env.local에 넣는다 (이 파일은 git에 올라가지 않는다).
// 브라우저에도 나가는 값이라 공개용 anon 키만 쓴다. service_role 키는 쓰지 않는다.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

// 연결을 한 번만 만들어 두고 계속 다시 쓴다.
// 함수 안에서 확인하므로, .env.local이 없어도 빌드는 깨지지 않는다.
export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      ".env.local에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 넣어주세요. " +
        "값은 Supabase 대시보드 > Project Settings > API 에서 복사할 수 있습니다.",
    );
  }

  client = createClient(url, anonKey);
  return client;
}
