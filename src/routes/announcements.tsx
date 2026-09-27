import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AppShell,
  Panel,
  SectionHeader,
  SoftCard,
} from "@/components/AppShell";
import { APP_NAME } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

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

type Announcement = {
  id: string;
  title: string;
  body: string;
  kind: string;
  event_date: string | null;
  course: string | null;
  semester: number | null;
  created_at: string;
};

const KIND_LABELS: Record<string, string> = {
  general: "General",
  academic: "Academic",
  exam: "Exam",
  holiday: "Holiday",
  deadline: "Deadline",
  urgent: "Urgent",
};

function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadAnnouncements();
  }, []);

  async function loadAnnouncements() {
    setLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("announcements")
      .select(
        "id, title, body, kind, event_date, course, semester, created_at"
      )
      .order("created_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    setAnnouncements((data ?? []) as Announcement[]);
    setLoading(false);
  }

  return (
    <AppShell title="Announcements">
      <section>
        <SectionHeader
          title="College Updates"
          meta={
            loading
              ? "Loading..."
              : `${announcements.length} announcements`
          }
        />

        {error ? (
          <div className="mb-3 rounded-xl bg-destructive/10 px-3 py-2.5 text-[12px] text-destructive">
            {error}
          </div>
        ) : null}

        {loading ? (
          <Panel className="text-center">
            <p className="text-[12px] text-muted-foreground">
              Loading announcements...
            </p>
          </Panel>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <SoftCard key={announcement.id}>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="size-2 shrink-0 rounded-full bg-primary" />

                  <span className="text-[11px] font-medium text-muted-foreground">
                    {KIND_LABELS[announcement.kind] ??
                      announcement.kind}
                  </span>

                  {announcement.course &&
                  announcement.semester ? (
                    <span className="text-[10px] text-muted-foreground">
                      · {announcement.course} · Semester{" "}
                      {announcement.semester}
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">
                      · College-wide
                    </span>
                  )}
                </div>

                <h3 className="text-[15px] font-medium leading-snug">
                  {announcement.title}
                </h3>

                <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                  {announcement.body}
                </p>

                {announcement.event_date ? (
                  <p className="mt-2 text-[11px] font-medium text-primary">
                    Event date: {announcement.event_date}
                  </p>
                ) : null}
              </SoftCard>
            ))}

            {announcements.length === 0 ? (
              <SoftCard>
                <p className="text-center text-[13px] text-muted-foreground">
                  No announcements right now.
                </p>
              </SoftCard>
            ) : null}
          </div>
        )}
      </section>
    </AppShell>
  );
}