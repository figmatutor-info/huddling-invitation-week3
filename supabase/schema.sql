-- 허들링 초대장 - Supabase 테이블 + RLS
-- Supabase 프로젝트: my-invitation
--
-- 쓰는 법: Supabase 대시보드 > SQL Editor 에 이 파일 전체를 붙여넣고 Run.
-- 컬럼은 src/lib/mock.ts 의 Invitation · Rsvp 타입과 같게 맞췄다.
-- 글자 수 제한은 src/lib/limits.ts 의 LIMITS 와 같은 값이다.


-- ============================================================
-- 1. invitations : 초대장 (제목 · 일시 · 장소 · 본문)
-- ============================================================

create table public.invitations (
  -- 순서대로 늘어나는 숫자를 쓰지 않는다. 추측하기 어려운 UUID를 쓴다.
  id uuid primary key default gen_random_uuid(),

  -- 빈 값과 너무 긴 글자를 DB에서 한 번 더 막는다 (btrim = 앞뒤 공백 제거)
  title    text not null check (char_length(btrim(title))    between 1 and 40),
  date     text not null check (char_length(btrim(date))     between 1 and 40),
  location text not null check (char_length(btrim(location)) between 1 and 100),
  body     text not null check (char_length(btrim(body))     between 1 and 1000),

  created_at timestamptz not null default now()
);


-- ============================================================
-- 2. rsvps : 참석 응답 (이름 · 참석 여부 · 동반 인원)
-- ============================================================

create table public.rsvps (
  id uuid primary key default gen_random_uuid(),

  -- 어느 초대장의 응답인지. 없는 초대장에는 응답을 넣을 수 없다.
  invitation_id uuid not null references public.invitations (id) on delete cascade,

  name text not null check (char_length(btrim(name)) between 1 and 20),

  -- yes = 참석 · no = 불참. 이 두 값 외에는 들어갈 수 없다.
  status text not null check (status in ('yes', 'no')),

  -- 본인을 제외한 동반 인원. 음수를 막는다.
  companions integer not null default 0 check (companions >= 0),

  created_at timestamptz not null default now(),

  -- 불참이면 동반 인원은 반드시 0
  constraint rsvps_no_companions_when_absent
    check (status = 'yes' or companions = 0)
);

-- 응답 현황 화면은 초대장 하나의 응답을 모아서 읽는다. 그 조회를 빠르게 한다.
create index rsvps_invitation_id_idx on public.rsvps (invitation_id);


-- ============================================================
-- 3. RLS (행 단위 접근 규칙) 켜기
-- ============================================================
-- RLS를 켜면 "허용한다"고 적어둔 동작만 된다.
-- 아래에서 읽기(select)와 쓰기(insert) 규칙만 만들고
-- 수정(update) · 삭제(delete) 규칙은 만들지 않는다. 규칙이 없으면 막힌다.

alter table public.invitations enable row level security;
alter table public.rsvps       enable row level security;


-- 읽기: 누구나 (로그인 없이 쓰는 서비스라 anon = 비로그인 방문자)
create policy "누구나 초대장 읽기" on public.invitations
  for select to anon, authenticated
  using (true);

create policy "누구나 응답 읽기" on public.rsvps
  for select to anon, authenticated
  using (true);


-- 쓰기: 누구나
create policy "누구나 초대장 만들기" on public.invitations
  for insert to anon, authenticated
  with check (true);

create policy "누구나 응답 보내기" on public.rsvps
  for insert to anon, authenticated
  with check (true);


-- update · delete 정책은 일부러 만들지 않는다 → 수정 · 삭제 모두 막힘


-- ============================================================
-- 4. 수정 · 삭제 권한 자체를 회수 (이중 잠금)
-- ============================================================
-- 위 RLS만으로도 막히지만, 권한 자체를 빼두면 실수로 정책을 하나 더
-- 만들더라도 수정 · 삭제가 열리지 않는다.

revoke update, delete on public.invitations from anon, authenticated;
revoke update, delete on public.rsvps       from anon, authenticated;
