import { Suspense } from "react";
import { notFound } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import NavBar from "@/components/NavBar";
import ResponseRow from "@/components/ResponseRow";
import SectionHeader from "@/components/SectionHeader";
import StatCard from "@/components/StatCard";
import { getInvitation, getRsvps, summarize } from "@/lib/data";
import CopyInviteLinkButton from "./CopyInviteLinkButton";

// /i/[id]/responses : 호스트가 응답 목록과 참석·불참 수, 참석 인원 합계를 본다 (Figma node 69:881)
// 초대장과 응답을 Supabase에서 읽어온다. 없는 id면 404 화면을 보여준다.
export default function ResponsesPage({ params }: PageProps<"/i/[id]/responses">) {
  return (
    <main className="mx-auto flex w-full max-w-mobile flex-col gap-20 bg-surface-default">
      <NavBar title="응답 현황" />
      {/* 주소의 id는 요청 때 정해지는 값이라 Suspense 안에서 읽는다 */}
      <Suspense>
        <Responses params={params} />
      </Suspense>
    </main>
  );
}

async function Responses({ params }: Pick<PageProps<"/i/[id]/responses">, "params">) {
  const { id } = await params;
  const invitation = await getInvitation(id);

  if (!invitation) notFound();

  const rsvps = await getRsvps(invitation.id);
  // 참석 수 · 불참 수 · 참석 인원 합계(참석한 사람 + 동반 인원)를 한 번에 계산한다
  const { yesCount, noCount, totalPeople } = summarize(rsvps);

  return (
    <div className="flex w-full flex-col gap-40 px-page-horizontal pb-80">
      <SectionHeader
        subtitle="Responses"
        title={invitation.title}
        titleAs="h1"
        description={`${invitation.date} · ${invitation.location}`}
      />

      <div className="flex w-full gap-8">
        <StatCard label="참석" value={`${yesCount}명`} className="min-w-0 flex-1" />
        <StatCard label="불참" value={`${noCount}명`} className="min-w-0 flex-1" />
        <StatCard
          label="참석 인원 합계"
          value={`${totalPeople}명`}
          highlight
          className="min-w-0 flex-1"
        />
      </div>
      <p className="text-caption-md text-text-tertiary">
        참석 인원 합계 = 참석한 사람 + 동반 인원
      </p>

      <section className="flex w-full flex-col gap-8">
        <h2 className="text-heading-md text-text-strong">응답 목록</h2>
        {rsvps.length === 0 ? (
          <EmptyState
            title="아직 응답이 없어요"
            description="초대장 링크를 공유하면 응답이 여기에 쌓여요."
          />
        ) : (
          rsvps.map((r) => (
            <ResponseRow
              key={r.id}
              name={r.name}
              status={r.status}
              // 불참이면 동반 인원을 넣지 않는다
              meta={r.status === "yes" ? `동반 ${r.companions}명` : undefined}
            />
          ))
        )}
      </section>

      <CopyInviteLinkButton id={invitation.id} />
    </div>
  );
}
