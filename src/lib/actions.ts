// 서버 액션(Server Action): 화면에서 부르지만 실제 실행은 서버에서만 되는 함수.
// 맨 윗줄의 "use server" 가 그 표시다.
//
// 저장하는 일(발행 · 응답 보내기)은 전부 여기를 거친다.
// 그래야 게스트가 보낸 값을 서버에서 다시 검사한 뒤에 DB에 넣을 수 있다.

"use server";

import { createInvitation, createRsvp } from "./data";
import type { NewInvitation, NewRsvp } from "./types";

// 초대장을 발행하고, 새로 만들어진 id를 돌려준다.
// 화면은 이 id로 공유 링크(/i/[id])를 만든다.
export async function publishInvitation(input: NewInvitation): Promise<string> {
  const invitation = await createInvitation(input);
  return invitation.id;
}

// 참석 응답을 보낸다.
// 어느 초대장의 응답인지(invitationId)는 화면이 아니라 주소에서 온 값을 쓴다.
export async function submitRsvp(
  invitationId: string,
  data: Omit<NewRsvp, "invitationId">,
): Promise<void> {
  await createRsvp({ ...data, invitationId });
}
