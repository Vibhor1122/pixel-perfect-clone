import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AppShell,
  Panel,
  SectionHeader,
  SoftCard,
} from "@/components/AppShell";
import { APP_NAME } from "@/lib/mock-data";
import { formatLong } from "@/lib/date-utils";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/day/$date")({
  head: () => ({
    meta: [
      { title: `Daily activity — ${APP_NAME}` },
      {
        name: "description",
        content: "Classes scheduled for the selected date.",
      },
    ],
  }),
  component: DayPage,
});

type Profile = {
  course: string | null;
  semester: number | null;
};

type Subject = {
  id: string;
  name: string;
};

type TimetableEntry = {
  id: string;
  subject_id: string;
  start_time: string;
  end_time: string;
  room: string | null;
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function DayPage() {
  const { date } = Route.useParams();

  const [sessions, setSessions] = useState<TimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadDay();
  }, [date]);

  async function loadDay() {
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

    const { data: profileData, error: profileError } =
      await supabase
        .from("profiles")
        .select("course, semester")
        .eq("id", user.id)
        .single();

    if (profileError || !profileData) {
      setError("Could not load your class information.");
      setLoading(false);
      return;
    }

    const profile = profileData as Profile;

    if (!profile.course || !profile.semester) {
      setError("Your account does not have complete class information.");
      setLoading(false);
      return;
    }

    const selectedDate = new Date(`${date}T12:00:00`);
    const dayName = DAY_NAMES[selectedDate.getDay()];

    if (!dayName) {
      setError("Invalid date.");
      setLoading(false);
      return;
    }

    const { data: subjectData, error: subjectError } =
      await supabase
        .from("subjects")
        .select("id, name")
        .eq("course", profile.course)
        .eq("semester", profile.semester);

    if (subjectError) {
      setError(subjectError.message);
      setLoading(false);
      return;
    }

    setSubjects((subjectData ?? []) as Subject[]);

    if (dayName === "Sunday") {
      setSessions([]);
      setLoading(false);
      return;
    }

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

    setSessions((timetableData ?? []) as TimetableEntry[]);
    setLoading(false);
  }

  function subjectName(subjectId: string) {
    return (
      subjects.find((subject) => subject.id === subjectId)?.name ??
      "Unknown Subject"
    );
  }

  function formatTime(time: string) {
    const [hoursText, minutes] = time.split(":");
    const hours = Number(hoursText);

    const suffix = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;

    return `${displayHour}:${minutes} ${suffix}`;
  }

  return (
    <AppShell
      title="Daily activity"
      back={{ to: "/calendar", label: "Calendar" }}
    >
      <Panel>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Selected date
        </p>

        <h2 className="mt-1 font-display text-[20px] font-semibold leading-tight">
          {formatLong(date)}
        </h2>

        <p className="mt-1 text-[12px] text-muted-foreground">
          {loading
            ? "Loading schedule..."
            : `${sessions.length} ${
                sessions.length === 1 ? "class" : "classes"
              } scheduled`}
        </p>
      </Panel>

      {error ? (
        <div className="rounded-xl bg-destructive/10 px-3 py-2.5 text-[12px] text-destructive">
          {error}
        </div>
      ) : null}

      <section>
        <SectionHeader title="Classes" />

        {loading ? (
          <Panel className="text-center">
            <p className="text-[12px] text-muted-foreground">
              Loading classes...
            </p>
          </Panel>
        ) : sessions.length === 0 ? (
          <SoftCard>
            <p className="text-[13px] text-muted-foreground">
              No classes scheduled for this date.
            </p>
          </SoftCard>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <SoftCard key={session.id}>
                <div className="flex gap-3">
                  <div className="w-[82px] shrink-0">
                    <p className="text-[11px] font-medium text-primary">
                      {formatTime(session.start_time)}
                    </p>

                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {formatTime(session.end_time)}
                    </p>
                  </div>

                  <div className="min-w-0 flex-1 border-l border-foreground/10 pl-3">
                    <h4 className="font-display text-[15px] font-semibold leading-snug">
                      {subjectName(session.subject_id)}
                    </h4>

                    <p className="mt-1 text-[11px] font-medium text-primary">
                      {session.room || "Room not specified"}
                    </p>
                  </div>
                </div>
              </SoftCard>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}