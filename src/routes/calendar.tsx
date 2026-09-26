import { createFileRoute } from "@tanstack/react-router";
import { AppShell, SectionHeader, SoftCard } from "@/components/AppShell";
import { MonthCalendar } from "@/components/MonthCalendar";
import { ANNOUNCEMENT_KIND_LABEL, APP_NAME, getAnnouncements } from "@/lib/mock-data";
import { formatLong } from "@/lib/date-utils";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: `Calendar — ${APP_NAME}` },
      {
        name: "description",
        content: "Monthly academic calendar with markers for classes, exams and announcements.",
      },
      { property: "og:title", content: `Calendar — ${APP_NAME}` },
      {
        property: "og:description",
        content: "Monthly academic calendar with markers for classes, exams and announcements.",
      },
    ],
  }),
  component: CalendarPage,
});

function CalendarPage() {
  const marked = getAnnouncements();

  return (
    <AppShell title="Calendar">
      <MonthCalendar />
      <section>
        <SectionHeader title="Marked dates" />
        <div className="space-y-3">
          {marked.map((a) => (
            <SoftCard key={a.id}>
              <p className="text-[11px] font-medium text-muted-foreground">{formatLong(a.date)}</p>
              <h4 className="mt-1 text-[14px] font-medium leading-snug">{a.title}</h4>
              <p className="mt-1 text-[12px] text-muted-foreground">
                {ANNOUNCEMENT_KIND_LABEL[a.kind]}
              </p>
            </SoftCard>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
