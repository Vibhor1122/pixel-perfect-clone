import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell, SectionHeader, SoftCard } from "@/components/AppShell";
import { MonthCalendar } from "@/components/MonthCalendar";
import {
  ANNOUNCEMENT_KIND_LABEL,
  APP_NAME,
  getAnnouncements,
  getSessionsForDate,
} from "@/lib/mock-data";
import { toISO } from "@/lib/date-utils";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: `Home — ${APP_NAME}` },
      {
        name: "description",
        content: "Your monthly class calendar, today's classes and the latest college announcements.",
      },
      { property: "og:title", content: `Home — ${APP_NAME}` },
      {
        property: "og:description",
        content: "Your monthly class calendar, today's classes and the latest college announcements.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const today = new Date();
  const todayISO = toISO(today);
  const announcements = getAnnouncements(today);
  const sessions = getSessionsForDate(todayISO);

  return (
    <AppShell title="Student Home">
      <MonthCalendar />

      <section>
        <SectionHeader title="Announcements" meta={`${announcements.length} recent`} />
        <div className="space-y-3">
          {announcements.slice(0, 3).map((a) => (
            <SoftCard key={a.id}>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="size-2 shrink-0 rounded-full bg-primary" />
                <span className="text-[11px] font-medium text-muted-foreground">
                  {ANNOUNCEMENT_KIND_LABEL[a.kind]} · {a.from}
                </span>
              </div>
              <h4 className="text-[14px] font-medium leading-snug text-pretty">{a.title}</h4>
              <p className="mt-1 text-[12px] leading-snug text-muted-foreground text-pretty">{a.body}</p>
            </SoftCard>
          ))}
        </div>
        <div className="mt-3 px-1">
          <Link to="/announcements" className="text-[12px] font-medium text-primary">
            View all announcements →
          </Link>
        </div>
      </section>

      <section>
        <SectionHeader title="Today's classes" meta={`${sessions.length} sessions`} />
        <div className="space-y-3">
          {sessions.map((s) => (
            <Link
              key={s.id}
              to="/day/$date"
              params={{ date: todayISO }}
              className="frost block rounded-2xl p-4 shadow-frost-sm ring-hairline"
            >
              <div className="flex items-start gap-3">
                <span className="w-12 shrink-0 pt-0.5 text-[12px] font-medium leading-tight text-primary">
                  {s.start}
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="text-[14px] font-medium leading-snug">{s.subject}</h4>
                  <p className="text-[12px] text-muted-foreground">
                    {s.topic} · {s.room}
                  </p>
                </div>
                <span className="shrink-0 rounded-lg bg-card/70 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground ring-hairline">
                  {s.notes.length} PDF
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
