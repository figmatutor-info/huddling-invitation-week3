// 서비스에서 쓰는 데이터 모양. 가짜 데이터(mock.ts)와 진짜 DB(data.ts)가 같이 쓴다.

// 초대장: 제목 · 일시 · 장소 · 본문
export type Invitation = {
  id: string;
  title: string; // 최대 2줄, 줄바꿈(\n)은 그대로 보여준다
  date: string; // 일시. 화면에 보이는 글자 그대로 저장한다
  location: string; // 장소. 주소를 글자로만 표시한다 (지도 없음)
  body: string; // 본문. 줄바꿈(\n)은 그대로 보여준다
};

// 참석 응답: 이름 · 참석 여부 · 동반 인원
export type Rsvp = {
  id: string;
  invitationId: string;
  name: string;
  status: "yes" | "no"; // yes 참석 · no 불참
  companions: number; // 본인을 제외한 동반 인원. 불참이면 0
};

// 새로 만들 때 받는 값. id는 DB가 만들어 주므로 뺀다.
export type NewInvitation = Omit<Invitation, "id">;
export type NewRsvp = Omit<Rsvp, "id">;
