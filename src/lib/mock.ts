// 가짜 데이터 (docs/PRD.md 기준)
// Supabase를 연결하기 전까지 화면 개발·확인용으로 쓴다.

// 타입은 types.ts로 옮겼다. 기존 import가 깨지지 않게 여기서도 내보낸다.
import type { Invitation, Rsvp } from "./types";

export type { Invitation, Rsvp };

// 실제 서비스에서는 추측하기 어려운 ID(crypto.randomUUID())를 쓴다.
// "demo"는 가짜 데이터 확인용 ID다.
export const mockInvitation: Invitation = {
  id: "demo",
  title: "허들링 클럽 2번째\n오프라인 밋업",
  date: "2026년 11월 14일 (토) 09:00",
  location: "세종 남극 기지",
  body: "허들링 클럽의 두 번째 오프라인 밋업에 초대합니다.\n함께 모여 이야기 나누고 즐거운 시간 보내요.",
};

// 응답이 0건인 초대장. 응답 현황의 빈 화면(EmptyState) 확인용이다.
export const mockEmptyInvitation: Invitation = {
  id: "empty",
  title: "허들링 클럽 3번째\n오프라인 밋업",
  date: "2026년 12월 12일 (토) 14:00",
  location: "세종 남극 기지",
  body: "허들링 클럽의 세 번째 오프라인 밋업에 초대합니다.\n아직 아무도 응답하지 않은 초대장이에요.",
};

// demo 초대장의 응답: 참석 2명 · 불참 1명 (empty 초대장의 응답은 없다)
export const mockRsvps: Rsvp[] = [
  { id: "rsvp-1", invitationId: "demo", name: "김허들", status: "yes", companions: 1 },
  { id: "rsvp-2", invitationId: "demo", name: "이펭귄", status: "yes", companions: 0 },
  { id: "rsvp-3", invitationId: "demo", name: "박남극", status: "no", companions: 0 },
];

// id로 가짜 초대장을 찾는다. 없으면 null
export function getMockInvitation(id: string): Invitation | null {
  return [mockInvitation, mockEmptyInvitation].find((inv) => inv.id === id) ?? null;
}
