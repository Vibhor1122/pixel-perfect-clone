import { createFileRoute } from "@tanstack/react-router";
import {
  AppShell,
  SectionHeader,
  SoftCard,
} from "@/components/AppShell";
import {
  ANNOUNCEMENT_KIND_LABEL,
  APP_NAME,
  getAnnouncements,
} from "@/lib/mock-data";

export const Route = createFileRoute("/announcements")({
  head: () => ({
    meta: [
      { title: `Announcements — ${APP_NAME}` },
      {
        name: "description",
        content:
          "College announcements, notices, deadlines and academic updates.",
      },
    ],
  }),
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  const announcements = getAnnouncements(new Date());

  return (
    <AppShell title="Announcements">
      <section>
        <SectionHeader
          title="College Updates"
          meta={`${announcements.length} announcements`}
        />

        <div className="space-y-3">
          {announcements.map((announcement) => (
            <SoftCard key={announcement.id}>
              <div className="mb-2 flex items-center gap-2">
                <span className="size-2 shrink-0 rounded-full bg-primary" />

                <span className="text-[11px] font-medium text-muted-foreground">
                  {ANNOUNCEMENT_KIND_LABEL[announcement.kind]} ·{" "}
                  {announcement.from}
                </span>
              </div>

              <h3 className="text-[15px] font-medium leading-snug">
                {announcement.title}
              </h3>

              <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                {announcement.body}
              </p>
            </SoftCard>
          ))}

          {announcements.length === 0 && (
            <SoftCard>
              <p className="text-center text-[13px] text-muted-foreground">
                No announcements right now.
              </p>
            </SoftCard>
          )}
        </div>
      </section>
    </AppShell>
  );
}