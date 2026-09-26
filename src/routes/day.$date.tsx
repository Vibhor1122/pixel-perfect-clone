import { createFileRoute } from "@tanstack/react-router";
import { AppShell, Panel, SectionHeader, SoftCard } from "@/components/AppShell";
import {
  ANNOUNCEMENT_KIND_LABEL,
  APP_NAME,
  getAnnouncements,
  getSessionsForDate,
} from "@/lib/mock-data";
import { formatLong } from "@/lib/date-utils";

export const Route = createFileRoute("/day/$date")({
  head: () => ({
    meta: [
      { title: `Daily activity — ${APP_NAME}` },
      {
        name: "description",
        content: "All classes, topics and PDF notes scheduled for the selected date.",
      },
      { property: "og:title", content: `Daily activity — ${APP_NAME}` },
      {
        property: "og:description",
        content: "All classes, topics and PDF notes scheduled for the selected date.",
      },
    ],
  }),
  component: DayPage,
});

function DayPage() {
  const { date } = Route.useParams();
  const sessions = getSessionsForDate(date);
  const announcements = getAnnouncements().filter((a) => a.date === date);

  return (
    <AppShell title="Daily activity" back={{ to: "/home", label: "Home" }}>
      <Panel>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Selected date
        </p>
        <h2 className="mt-1 font-display text-[20px] font-semibold leading-tight">
          {formatLong(date)}
        </h2>
        <p className="mt-1 text-[12px] text-muted-foreground">
          {sessions.length} {sessions.length === 1 ? "class" : "classes"} scheduled
        </p>
      </Panel>

      {announcements.length > 0 ? (
        <section>
          <SectionHeader title="Announcements" />
          <div className="space-y-3">
            {announcements.map((a) => (
              <SoftCard key={a.id}>
                <span className="text-[11px] font-medium text-warm">
                  {ANNOUNCEMENT_KIND_LABEL[a.kind]}
                </span>
                <h4 className="mt-1 text-[14px] font-medium leading-snug">{a.title}</h4>
                <p className="mt-1 text-[12px] text-muted-foreground">{a.body}</p>
              </SoftCard>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionHeader title="Classes" />
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <SoftCard>
              <p className="text-[13px] text-muted-foreground">No classes scheduled for this date.</p>
            </SoftCard>
          ) : null}

          {sessions.map((s) => (
            <article key={s.id} className="frost rounded-2xl p-4 shadow-frost-sm ring-hairline">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="font-display text-[15px] font-semibold leading-snug">{s.subject}</h4>
                  <p className="mt-0.5 text-[12px] font-medium text-primary">
                    {s.start} – {s.end}
                  </p>
                  <p className="mt-1 text-[12px] text-muted-foreground">Topic: {s.topic}</p>
                  <p className="text-[12px] text-muted-foreground">
                    {s.room} · {s.teacher}
                  </p>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                {s.notes.map((n) => (
                  <button
                    key={n.id}
                    className="flex w-full items-center gap-2 rounded-xl bg-card/70 px-3 py-2.5 text-left ring-hairline"
                  >
                    <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      PDF
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[12px] font-medium">{n.title}</span>
                    <span className="text-[11px] text-muted-foreground">{n.size}</span>
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
