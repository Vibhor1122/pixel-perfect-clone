import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AppShell,
  Panel,
  SectionHeader,
  SoftCard,
} from "@/components/AppShell";
import { APP_NAME } from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/timetable")({
  head: () => ({
    meta: [
      { title: `Timetable — ${APP_NAME}` },
      {
        name: "description",
        content: "View and manage the weekly class timetable.",
      },
    ],
  }),
  component: TimetablePage,
});

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

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
  course: string;
  semester: number;
  day: string;
  subject_id: string;
  start_time: string;
  end_time: string;
  room: string | null;
};

function TimetablePage() {
  const { role } = useRole();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [entries, setEntries] = useState<TimetableEntry[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [day, setDay] = useState("Monday");
  const [subjectId, setSubjectId] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [room, setRoom] = useState("");

  const canEdit = role === "cr";

  useEffect(() => {
    void loadTimetable();
  }, []);

  async function loadTimetable() {
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

    setProfile(profileData);

    if (!profileData.course || !profileData.semester) {
      setError("Your account does not have complete class information.");
      setLoading(false);
      return;
    }

    const { data: subjectData, error: subjectError } =
      await supabase
        .from("subjects")
        .select("id, name")
        .eq("course", profileData.course)
        .eq("semester", profileData.semester)
        .order("name");

    if (subjectError) {
      setError(subjectError.message);
      setLoading(false);
      return;
    }

    const loadedSubjects = (subjectData ?? []) as Subject[];

    setSubjects(loadedSubjects);

   const firstLoadedSubject = loadedSubjects[0];

if (firstLoadedSubject && !subjectId) {
  setSubjectId(firstLoadedSubject.id);
}

    const { data: timetableData, error: timetableError } =
      await supabase
        .from("timetable_entries")
        .select(
          "id, course, semester, day, subject_id, start_time, end_time, room"
        )
        .eq("course", profileData.course)
        .eq("semester", profileData.semester)
        .order("start_time");

    if (timetableError) {
      setError(timetableError.message);
      setLoading(false);
      return;
    }

    setEntries((timetableData ?? []) as TimetableEntry[]);
    setLoading(false);
  }

  function subjectName(id: string) {
    return (
      subjects.find((subject) => subject.id === id)?.name ??
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

  function resetForm() {
    setEditingId(null);
    setDay("Monday");

    const firstSubject = subjects[0];

if (firstSubject) {
  setSubjectId(firstSubject.id);
} else {
  setSubjectId("");
}

    setStartTime("09:00");
    setEndTime("10:00");
    setRoom("");
    setShowForm(false);
    setError("");
  }

  function startEditing(entry: TimetableEntry) {
    setEditingId(entry.id);
    setDay(entry.day);
    setSubjectId(entry.subject_id);
    setStartTime(entry.start_time.slice(0, 5));
    setEndTime(entry.end_time.slice(0, 5));
    setRoom(entry.room ?? "");
    setShowForm(true);
    setError("");
  }

  async function saveEntry() {
    setError("");

    if (!profile?.course || !profile.semester) {
      setError("Your class information is not available.");
      return;
    }

    if (!subjectId) {
      setError("Please select a subject.");
      return;
    }

    if (!startTime || !endTime) {
      setError("Please select the class start and end time.");
      return;
    }

    if (endTime <= startTime) {
      setError("End time must be after start time.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Your login session could not be verified.");
      setSaving(false);
      return;
    }

    if (editingId) {
      const { error: updateError } = await supabase
        .from("timetable_entries")
        .update({
          day,
          subject_id: subjectId,
          start_time: startTime,
          end_time: endTime,
          room: room.trim() || null,
        })
        .eq("id", editingId);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("timetable_entries")
        .insert({
          course: profile.course,
          semester: profile.semester,
          day,
          subject_id: subjectId,
          start_time: startTime,
          end_time: endTime,
          room: room.trim() || null,
          created_by: user.id,
        });

      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    resetForm();
    await loadTimetable();
  }

  async function deleteEntry(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this class?"
    );

    if (!confirmed) {
      return;
    }

    setError("");

    const { error: deleteError } = await supabase
      .from("timetable_entries")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadTimetable();
  }

  if (loading) {
    return (
      <AppShell title="Timetable">
        <Panel className="text-center">
          <p className="text-[12px] text-muted-foreground">
            Loading timetable...
          </p>
        </Panel>
      </AppShell>
    );
  }

  return (
    <AppShell title="Timetable">
      {profile?.course && profile.semester ? (
        <div className="rounded-xl bg-primary/5 px-3 py-2.5 text-[11px] text-muted-foreground ring-hairline">
          {profile.course} · Semester {profile.semester}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl bg-destructive/10 px-3 py-2.5 text-[12px] text-destructive">
          {error}
        </div>
      ) : null}

      {canEdit ? (
        <section>
          {!showForm ? (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);

               const firstSubject = subjects[0];

                if (firstSubject) {
                 setSubjectId(firstSubject.id);
}

                setShowForm(true);
              }}
              disabled={subjects.length === 0}
              className="w-full rounded-xl bg-primary px-4 py-3 text-[13px] font-medium text-primary-foreground disabled:opacity-50"
            >
              + Add Class
            </button>
          ) : (
            <Panel>
              <SectionHeader
                title={editingId ? "Edit Class" : "Add Class"}
              />

              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Day
                  </label>

                  <select
                    value={day}
                    onChange={(event) =>
                      setDay(event.target.value)
                    }
                    className="mt-1.5 w-full rounded-xl bg-card/70 px-3 py-2.5 text-[13px] outline-none ring-hairline"
                  >
                    {DAYS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Subject
                  </label>

                  <select
                    value={subjectId}
                    onChange={(event) =>
                      setSubjectId(event.target.value)
                    }
                    className="mt-1.5 w-full rounded-xl bg-card/70 px-3 py-2.5 text-[13px] outline-none ring-hairline"
                  >
                    {subjects.map((subject) => (
                      <option
                        key={subject.id}
                        value={subject.id}
                      >
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground">
                      Start Time
                    </label>

                    <input
                      type="time"
                      value={startTime}
                      onChange={(event) =>
                        setStartTime(event.target.value)
                      }
                      className="mt-1.5 w-full rounded-xl bg-card/70 px-3 py-2.5 text-[13px] outline-none ring-hairline"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-muted-foreground">
                      End Time
                    </label>

                    <input
                      type="time"
                      value={endTime}
                      onChange={(event) =>
                        setEndTime(event.target.value)
                      }
                      className="mt-1.5 w-full rounded-xl bg-card/70 px-3 py-2.5 text-[13px] outline-none ring-hairline"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-muted-foreground">
                    Room
                  </label>

                  <input
                    type="text"
                    value={room}
                    onChange={(event) =>
                      setRoom(event.target.value)
                    }
                    placeholder="Example: B-204"
                    className="mt-1.5 w-full rounded-xl bg-card/70 px-3 py-2.5 text-[13px] outline-none ring-hairline"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 rounded-xl bg-card/70 px-4 py-3 text-[12px] font-medium ring-hairline"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void saveEntry()}
                    className="flex-1 rounded-xl bg-primary px-4 py-3 text-[12px] font-medium text-primary-foreground disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Save Changes"
                        : "Add Class"}
                  </button>
                </div>
              </div>
            </Panel>
          )}
        </section>
      ) : null}

      <section>
        <SectionHeader
          title="Weekly Schedule"
          meta="Mon – Sat"
        />

        {entries.length === 0 ? (
          <Panel className="text-center">
            <p className="text-[12px] text-muted-foreground">
              No classes have been added to your timetable yet.
            </p>
          </Panel>
        ) : (
          <div className="space-y-5">
            {DAYS.map((currentDay) => {
              const dayEntries = entries
                .filter((entry) => entry.day === currentDay)
                .sort((a, b) =>
                  a.start_time.localeCompare(b.start_time)
                );

              if (dayEntries.length === 0) {
                return null;
              }

              return (
                <div key={currentDay}>
                  <h3 className="mb-2 px-1 font-display text-[15px] font-semibold">
                    {currentDay}
                  </h3>

                  <div className="space-y-2">
                    {dayEntries.map((entry) => (
                      <SoftCard
                        key={entry.id}
                        className="!p-3.5"
                      >
                        <div className="flex gap-3">
                          <div className="w-[82px] shrink-0">
                            <p className="text-[11px] font-medium text-primary">
                              {formatTime(entry.start_time)}
                            </p>

                            <p className="mt-0.5 text-[10px] text-muted-foreground">
                              {formatTime(entry.end_time)}
                            </p>
                          </div>

                          <div className="min-w-0 flex-1 border-l border-foreground/10 pl-3">
                            <h4 className="text-[13px] font-medium leading-snug">
                              {subjectName(entry.subject_id)}
                            </h4>

                            <p className="mt-1 text-[11px] font-medium text-primary">
                              {entry.room || "Room not specified"}
                            </p>

                            {canEdit ? (
                              <div className="mt-3 flex gap-3">
                                <button
                                  type="button"
                                  onClick={() =>
                                    startEditing(entry)
                                  }
                                  className="text-[11px] font-medium text-primary"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    void deleteEntry(entry.id)
                                  }
                                  className="text-[11px] font-medium text-destructive"
                                >
                                  Delete
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </SoftCard>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}