import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AppShell,
  Panel,
  SectionHeader,
  SoftCard,
} from "@/components/AppShell";
import { MonthCalendar } from "@/components/MonthCalendar";
import { APP_NAME } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";
import { toISO } from "@/lib/date-utils";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: `Home — ${APP_NAME}` },
      {
        name: "description",
        content:
          "Your monthly class calendar, today's classes and the latest college announcements.",
      },
    ],
  }),
  component: HomePage,
});

type Announcement = {
  id: string;
  title: string;
  body: string;
  kind: string;
  event_date: string | null;
  created_at: string;
};

type TimetableEntry = {
  id: string;
  subject_id: string;
  start_time: string;
  end_time: string;
  room: string | null;
};

type Subject = {
  id: string;
  name: string;
};

type TodayClass = {
  id: string;
  subject: string;
  startTime: string;
  endTime: string;
  room: string | null;
};

const KIND_LABELS: Record<string, string> = {
  general: "General",
  academic: "Academic",
  exam: "Exam",
  holiday: "Holiday",
  deadline: "Deadline",
  urgent: "Urgent",
};

function HomePage() {
  const today = new Date();
  const todayISO = toISO(today);

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadHome();
  }, []);

  async function loadHome() {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Could not identify the logged-in user.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("course, semester")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      setError("Could not load your profile.");
      setLoading(false);
      return;
    }

    const { data: announcementData, error: announcementError } =
      await supabase
        .from("announcements")
        .select("id, title, body, kind, event_date, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

    if (announcementError) {
      setError(announcementError.message);
      setLoading(false);
      return;
    }

    setAnnouncements((announcementData ?? []) as Announcement[]);

    if (!profile.course || !profile.semester) {
      setTodayClasses([]);
      setLoading(false);
      return;
    }

    const dayName = today.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const { data: timetableData, error: timetableError } =
      await supabase
        .from("timetable_entries")
        .select("id, subject_id, start_time, end_time, room")
        .eq("course", profile.course)
        .eq("semester", profile.semester)
        .eq("day", dayName)
        .order("start_time", { ascending: true });

    if (timetableError) {
      setError(timetableError.message);
      setLoading(false);
      return;
    }

    const timetableEntries =
      (timetableData ?? []) as TimetableEntry[];

    if (timetableEntries.length === 0) {
      setTodayClasses([]);
      setLoading(false);
      return;
    }

    const subjectIds = [
      ...new Set(
        timetableEntries.map((entry) => entry.subject_id)
      ),
    ];

    const { data: subjectData, error: subjectError } =
      await supabase
        .from("subjects")
        .select("id, name")
        .in("id", subjectIds);

    if (subjectError) {
      setError(subjectError.message);
      setLoading(false);
      return;
    }

    const subjects = (subjectData ?? []) as Subject[];

    const classes = timetableEntries.map((entry) => {
      const subject = subjects.find(
        (item) => item.id === entry.subject_id
      );

      return {
        id: entry.id,
        subject: subject?.name ?? "Unknown Subject",
        startTime: entry.start_time,
        endTime: entry.end_time,
        room: entry.room,
      };
    });

    setTodayClasses(classes);
    setLoading(false);
  }

  return (
    <AppShell title="Home">
      <MonthCalendar />

      {error ? (
        <div className="rounded-xl bg-destructive/10 px-3 py-2.5 text-[12px] text-destructive">
          {error}
        </div>
      ) : null}

      <section>
        <SectionHeader
          title="Announcements"
          meta={`${announcements.length} recent`}
        />

        {loading ? (
          <Panel className="text-center">
            <p className="text-[12px] text-muted-foreground">
              Loading announcements...
            </p>
          </Panel>
        ) : announcements.length === 0 ? (
          <SoftCard>
            <p className="text-[12px] text-muted-foreground">
              No announcements yet.
            </p>
          </SoftCard>
        ) : (
          <div className="space-y-3">
            {announcements.slice(0, 3).map((announcement) => (
              <SoftCard key={announcement.id}>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="size-2 shrink-0 rounded-full bg-primary" />

                  <span className="text-[11px] font-medium text-muted-foreground">
                    {KIND_LABELS[announcement.kind] ??
                      announcement.kind}
                  </span>
                </div>

                <h4 className="text-[14px] font-medium leading-snug text-pretty">
                  {announcement.title}
                </h4>

                <p className="mt-1 text-[12px] leading-snug text-muted-foreground text-pretty">
                  {announcement.body}
                </p>

                {announcement.event_date ? (
                  <p className="mt-2 text-[11px] font-medium text-primary">
                    {announcement.event_date}
                  </p>
                ) : null}
              </SoftCard>
            ))}
          </div>
        )}

        <div className="mt-3 px-1">
          <Link
            to="/announcements"
            className="text-[12px] font-medium text-primary"
          >
            View all announcements →
          </Link>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Today's classes"
          meta={`${todayClasses.length} sessions`}
        />

        {loading ? (
          <Panel className="text-center">
            <p className="text-[12px] text-muted-foreground">
              Loading today's classes...
            </p>
          </Panel>
        ) : todayClasses.length === 0 ? (
          <SoftCard>
            <p className="text-[12px] text-muted-foreground">
              No classes scheduled for today.
            </p>
          </SoftCard>
        ) : (
          <div className="space-y-3">
            {todayClasses.map((session) => (
              <Link
                key={session.id}
                to="/day/$date"
                params={{ date: todayISO }}
                className="frost block rounded-2xl p-4 shadow-frost-sm ring-hairline"
              >
                <div className="flex items-start gap-3">
                  <span className="w-14 shrink-0 pt-0.5 text-[12px] font-medium leading-tight text-primary">
                    {session.startTime.slice(0, 5)}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-[14px] font-medium leading-snug">
                      {session.subject}
                    </h4>

                    <p className="text-[12px] text-muted-foreground">
                      {session.startTime.slice(0, 5)} –{" "}
                      {session.endTime.slice(0, 5)}
                      {session.room
                        ? ` · ${session.room}`
                        : ""}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}