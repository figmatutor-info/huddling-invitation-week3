// Supabase에서 초대장·응답을 읽고 쓰는 함수들.
// 테이블 모양은 supabase/schema.sql 과 같다.

import { getSupabase } from "./supabase";
import { LIMITS } from "./limits";
import type { Invitation, NewInvitation, NewRsvp, Rsvp } from "./types";

// DB는 invitation_id 처럼 밑줄 이름을 쓰고, 화면 코드는 invitationId 를 쓴다.
// 아래 두 함수가 그 사이를 바꿔준다.
type InvitationRow = {
  id: string;
  title: string;
  date: string;
  location: string;
  body: string;
};

type RsvpRow = {
  id: string;
  invitation_id: string;
  name: string;
  status: "yes" | "no";
  companions: number;
};

function toRsvp(row: RsvpRow): Rsvp {
  return {
    id: row.id,
    invitationId: row.invitation_id,
    name: row.name,
    status: row.status,
    companions: row.companions,
  };
}

// 게스트가 보낸 값은 서버에서 다시 검사한다. 빈 값·너무 긴 글자·음수 인원을 막는다.
function checkText(value: string, max: number, label: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) throw new Error(`${label}을(를) 입력해주세요.`);
  if (trimmed.length > max) throw new Error(`${label}은(는) ${max}자까지 쓸 수 있어요.`);
  return trimmed;
}

// ── 초대장 ──────────────────────────────────────────────

// 초대장 id는 UUID다 (supabase/schema.sql 참고).
// 주소에 엉뚱한 글자가 들어오면 DB에 물어보기 전에 걸러낸다.
// (UUID가 아닌 값을 그대로 보내면 DB가 오류를 내서 화면이 깨진다)
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// id로 초대장 하나를 가져온다. 없으면 null
export async function getInvitation(id: string): Promise<Invitation | null> {
  if (!UUID_PATTERN.test(id)) return null;

  const { data, error } = await getSupabase()
    .from("invitations")
    .select("id, title, date, location, body")
    .eq("id", id)
    .maybeSingle<InvitationRow>();

  if (error) throw new Error(`초대장을 불러오지 못했어요: ${error.message}`);
  return data;
}

// 초대장을 발행한다. 만들어진 초대장(id 포함)을 돌려준다.
export async function createInvitation(input: NewInvitation): Promise<Invitation> {
  const row = {
    title: checkText(input.title, LIMITS.title, "제목"),
    date: checkText(input.date, LIMITS.date, "일시"),
    location: checkText(input.location, LIMITS.location, "장소"),
    body: checkText(input.body, LIMITS.body, "본문"),
  };

  const { data, error } = await getSupabase()
    .from("invitations")
    .insert(row)
    .select("id, title, date, location, body")
    .single<InvitationRow>();

  if (error) throw new Error(`초대장을 만들지 못했어요: ${error.message}`);
  return data;
}

// ── 참석 응답 ───────────────────────────────────────────

// 초대장 하나의 응답을 먼저 보낸 순서대로 가져온다.
export async function getRsvps(invitationId: string): Promise<Rsvp[]> {
  if (!UUID_PATTERN.test(invitationId)) return [];

  const { data, error } = await getSupabase()
    .from("rsvps")
    .select("id, invitation_id, name, status, companions")
    .eq("invitation_id", invitationId)
    .order("created_at", { ascending: true })
    .returns<RsvpRow[]>();

  if (error) throw new Error(`응답을 불러오지 못했어요: ${error.message}`);
  return data.map(toRsvp);
}

// 참석 응답을 보낸다.
export async function createRsvp(input: NewRsvp): Promise<Rsvp> {
  // 불참이면 동반 인원은 0으로 맞춘다 (DB에도 같은 규칙이 걸려 있다).
  const companions = input.status === "yes" ? input.companions : 0;

  if (!Number.isInteger(companions) || companions < 0) {
    throw new Error("동반 인원은 0 이상의 숫자여야 해요.");
  }

  const row = {
    invitation_id: input.invitationId,
    name: checkText(input.name, LIMITS.name, "이름"),
    status: input.status,
    companions,
  };

  const { data, error } = await getSupabase()
    .from("rsvps")
    .insert(row)
    .select("id, invitation_id, name, status, companions")
    .single<RsvpRow>();

  if (error) throw new Error(`응답을 보내지 못했어요: ${error.message}`);
  return toRsvp(data);
}

// 응답 현황 숫자: 참석 수 · 불참 수 · 참석 인원 합계(동반 포함)
export function summarize(rsvps: Rsvp[]) {
  const attending = rsvps.filter((r) => r.status === "yes");
  return {
    yesCount: attending.length,
    noCount: rsvps.length - attending.length,
    totalPeople: attending.reduce((sum, r) => sum + 1 + r.companions, 0),
  };
}
