import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell, Panel, SectionHeader, SoftCard } from "@/components/AppShell";
import { MonthCalendar } from "@/components/MonthCalendar";
import { APP_NAME } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: `Calendar — ${APP_NAME}` },
      {
        name: "description",
        content: "Monthly academic calendar with real class activity.",
      },
    ],
  }),
  component: CalendarPage,
});

type ClassRecord = {
  id: string;
  class_date: string;
  summary: string | null;
  timetable_entry_id: string;
};

type TimetableEntry = {
  id: string;
  subject_id: string;
};

type Subject = {
  id: string;
  name: string;
};

type MarkedActivity = {
  id: string;
  date: string;
  subject: string;
  summary: string | null;
};

function CalendarPage() {
  const [activities, setActivities] = useState<MarkedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadActivities();
  }, []);

  async function loadActivities() {
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
      setError("Could not load your class information.");
      setLoading(false);
      return;
    }

    if (!profile.course || !profile.semester) {
      setError("Your account does not have complete class information.");
      setLoading(false);
      return;
    }

    const { data: timetableData, error: timetableError } =
      await supabase
        .from("timetable_entries")
        .select("id, subject_id")
        .eq("course", profile.course)
        .eq("semester", profile.semester);

    if (timetableError) {
      setError(timetableError.message);
      setLoading(false);
      return;
    }

    const timetableEntries =
      (timetableData ?? []) as TimetableEntry[];

    if (timetableEntries.length === 0) {
      setActivities([]);
      setLoading(false);
      return;
    }

    const timetableIds = timetableEntries.map((entry) => entry.id);

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

    const { data: recordData, error: recordError } =
      await supabase
        .from("class_records")
        .select("id, class_date, summary, timetable_entry_id")
        .in("timetable_entry_id", timetableIds)
        .order("class_date", { ascending: false });

    if (recordError) {
      setError(recordError.message);
      setLoading(false);
      return;
    }

    const records = (recordData ?? []) as ClassRecord[];

    const loadedActivities = records.map((record) => {
      const timetableEntry = timetableEntries.find(
        (entry) => entry.id === record.timetable_entry_id
      );

      const subject = subjects.find(
        (item) => item.id === timetableEntry?.subject_id
      );

      return {
        id: record.id,
        date: record.class_date,
        subject: subject?.name ?? "Unknown Subject",
        summary: record.summary,
      };
    });

    setActivities(loadedActivities);
    setLoading(false);
  }

  return (
    <AppShell title="Calendar">
      <MonthCalendar />

      <section>
        <SectionHeader title="Class activity" />

        {error ? (
          <div className="rounded-xl bg-destructive/10 px-3 py-2.5 text-[12px] text-destructive">
            {error}
          </div>
        ) : loading ? (
          <Panel className="text-center">
            <p className="text-[12px] text-muted-foreground">
              Loading class activity...
            </p>
          </Panel>
        ) : activities.length === 0 ? (
          <SoftCard>
            <p className="text-[13px] text-muted-foreground">
              No class activity has been recorded yet.
            </p>
          </SoftCard>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <SoftCard key={activity.id}>
                <p className="text-[11px] font-medium text-muted-foreground">
                  {activity.date}
                </p>

                <h4 className="mt-1 text-[14px] font-medium leading-snug">
                  {activity.subject}
                </h4>

                <p className="mt-1 line-clamp-2 text-[12px] text-muted-foreground">
                  {activity.summary || "Class activity recorded"}
                </p>
              </SoftCard>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}