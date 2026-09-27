import { createFileRoute, useNavigate } from "@tanstack/react-router";
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

const ATTENDANCE_API_URL =
  import.meta.env["VITE_ATTENDANCE_API_URL"];
  console.log("Attendance API loaded:", Boolean(ATTENDANCE_API_URL));

export const Route = createFileRoute("/marks-attendance")({
  head: () => ({
    meta: [
      { title: `Mark Attendance — ${APP_NAME}` },
      {
        name: "description",
        content: "Mark class attendance.",
      },
    ],
  }),
  component: MarkAttendancePage,
});



type AttendanceStatus = "present" | "absent";

type Student = {
  id: string;
  college_id: string | null;
  full_name: string | null;
};

type CrProfile = {
  course: string | null;
  semester: number | null;
};

function MarkAttendancePage() {
  const { role, loading: roleLoading } = useRole();
  const navigate = useNavigate();

 type Subject = {
  id: string;
  name: string;
};

const [subjects, setSubjects] = useState<Subject[]>([]);
const [subject, setSubject] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [students, setStudents] = useState<Student[]>([]);
  const [crProfile, setCrProfile] = useState<CrProfile | null>(null);

  const [attendance, setAttendance] = useState<
    Record<string, AttendanceStatus>
  >({});

  const [loadingStudents, setLoadingStudents] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roleLoading && role === "cr") {
      void loadClass();
    }
  }, [role, roleLoading]);

  async function loadClass() {
    setLoadingStudents(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Could not identify the logged-in CR.");
      setLoadingStudents(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("course, semester")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      setError("Could not load your class information.");
      setLoadingStudents(false);
      return;
    }

    setCrProfile(profile);

    if (!profile.course || !profile.semester) {
      setError(
        "Your CR account does not have complete class information."
      );
      setLoadingStudents(false);
      return;
    }
    // LOAD SUBJECTS FOR THIS CR'S COURSE AND SEMESTER
const { data: classSubjects, error: subjectsError } =
  await supabase
    .from("subjects")
    .select("id, name")
    .eq("course", profile.course)
    .eq("semester", profile.semester)
    .order("name", { ascending: true });

if (subjectsError) {
  setError(subjectsError.message);
  setLoadingStudents(false);
  return;
}

const loadedSubjects = classSubjects ?? [];

setSubjects(loadedSubjects);

if (loadedSubjects.length > 0) {
  setSubject(loadedSubjects[0]!.id);
} else {
  setSubject("");
}

    const { data: classStudents, error: studentsError } =
      await supabase
        .from("profiles")
        .select("id, college_id, full_name")
        .eq("role", "student")
        .eq("course", profile.course)
        .eq("semester", profile.semester)
        .order("college_id", { ascending: true });

    if (studentsError) {
      setError(studentsError.message);
      setLoadingStudents(false);
      return;
    }

    const loadedStudents = classStudents ?? [];

    setStudents(loadedStudents);

    setAttendance(
      Object.fromEntries(
        loadedStudents.map((student) => [
          student.id,
          "present",
        ])
      ) as Record<string, AttendanceStatus>
    );

    setLoadingStudents(false);
  }

  if (roleLoading) {
    return (
      <AppShell title="Mark Attendance">
        <Panel className="text-center">
          <p className="text-[13px] text-muted-foreground">
            Checking CR access...
          </p>
        </Panel>
      </AppShell>
    );
  }

  if (role !== "cr") {
    return (
      <AppShell title="Attendance">
        <Panel className="text-center">
          <h2 className="font-display text-lg font-semibold">
            CR access only
          </h2>

          <p className="mt-2 text-[12px] text-muted-foreground">
            Only the class representative can mark attendance.
          </p>

          <button
            onClick={() => navigate({ to: "/attendance" })}
            className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-[12px] font-medium text-primary-foreground"
          >
            View Attendance
          </button>
        </Panel>
      </AppShell>
    );
  }

  const presentCount = Object.values(attendance).filter(
    (status) => status === "present"
  ).length;

  const absentCount = students.length - presentCount;

  function changeStatus(
    studentId: string,
    status: AttendanceStatus
  ) {
    setAttendance((current) => ({
      ...current,
      [studentId]: status,
    }));

    setSaved(false);
    setError("");
  }

  function markEveryonePresent() {
    setAttendance(
      Object.fromEntries(
        students.map((student) => [
          student.id,
          "present",
        ])
      ) as Record<string, AttendanceStatus>
    );

    setSaved(false);
    setError("");
  }

 async function saveAttendance() {
  setError("");
  setSaved(false);

  if (!crProfile) {
    setError("Class information is not available.");
    return;
  }

  if (!crProfile.course || !crProfile.semester) {
    setError("Your CR account has incomplete class information.");
    return;
  }

  if (!subject) {
    setError("Please select a subject.");
    return;
  }

  if (students.length === 0) {
    setError("There are no students in this class.");
    return;
  }

  if (!ATTENDANCE_API_URL) {
    setError("Attendance API is not configured.");
    return;
  }

  const selectedSubject = subjects.find(
    (item) => item.id === subject
  );

  if (!selectedSubject) {
    setError("Could not identify the selected subject.");
    return;
  }

  setSaving(true);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    setError("Your login session could not be verified.");
    setSaving(false);
    return;
  }

  const records = students.map((student) => ({
    date,
    course: crProfile.course,
    semester: crProfile.semester,
    subjectId: selectedSubject.id,
    subjectName: selectedSubject.name,
    studentId: student.college_id || student.id,
    studentName: student.full_name || "Student",
    status: attendance[student.id] ?? "present",
    markedBy: user.id,
  }));

 try {
  console.log("Sending attendance to Google Sheets", records);

  const response = await fetch(ATTENDANCE_API_URL, {
      method: "POST",
      body: JSON.stringify({
        records,
      }),
    });

    console.log(
  "Google response received:",
  response.status,
  response.url
);

    if (!response.ok) {
      throw new Error("Attendance server returned an error.");
    }

    const result = await response.json();
    console.log("Google response data:", result);

    if (!result.success) {
      throw new Error(
        result.error || "Could not save attendance."
      );
    }

    setSaved(true);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Could not save attendance."
    );
  } finally {
    setSaving(false);
  }
}

   

  return (
    <AppShell
      title="Mark Attendance"
      subtitle="Class Representative"
      back={{ to: "/attendance", label: "Attendance" }}
    >
      <section>
        <Panel>
          {crProfile && (
            <div className="mb-4 rounded-xl bg-primary/5 px-3 py-2.5 text-[11px] text-muted-foreground ring-hairline">
              {crProfile.course} · Semester {crProfile.semester}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Subject
              </label>

              <select
  value={subject}
  disabled={subjects.length === 0}
  onChange={(e) => {
    setSubject(e.target.value);
    setSaved(false);
    setError("");
  }}
  className="w-full rounded-xl bg-card/70 px-3 py-3 text-[13px] outline-none ring-hairline disabled:opacity-60"
>
  {subjects.length === 0 ? (
    <option value="">No subjects available</option>
  ) : (
subjects.map((item) => (
  <option key={item.id} value={item.id}>
    {item.name}
  </option>
))
  )}
</select>
            </div>

            <div>
              <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Date
              </label>

              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSaved(false);
                  setError("");
                }}
                className="w-full rounded-xl bg-card/70 px-3 py-3 text-[13px] outline-none ring-hairline"
              />
            </div>
          </div>
        </Panel>
      </section>

      <section>
        <SectionHeader
          title="Students"
          meta={
            loadingStudents
              ? "Loading..."
              : `${students.length} students`
          }
        />

        {error && (
          <div className="mb-3 rounded-xl bg-destructive/10 px-3 py-2.5 text-[12px] text-destructive">
            {error}
          </div>
        )}

        {!loadingStudents && students.length > 0 && (
          <div className="mb-3 flex items-center justify-between px-1">
            <div className="flex gap-3 text-[11px]">
              <span className="font-medium text-primary">
                {presentCount} Present
              </span>

              <span className="text-muted-foreground">
                {absentCount} Absent
              </span>
            </div>

            <button
              type="button"
              onClick={markEveryonePresent}
              className="text-[11px] font-medium text-primary"
            >
              All Present
            </button>
          </div>
        )}

        {loadingStudents ? (
          <Panel className="text-center">
            <p className="text-[12px] text-muted-foreground">
              Loading students...
            </p>
          </Panel>
        ) : students.length === 0 ? (
          <Panel className="text-center">
            <p className="text-[12px] text-muted-foreground">
              No students were found in your class.
            </p>
          </Panel>
        ) : (
          <div className="space-y-2">
            {students.map((student) => {
              const status = attendance[student.id];
              const roll = student.college_id || "—";

              return (
                <SoftCard
                  key={student.id}
                  className="!p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid min-h-9 min-w-9 shrink-0 place-items-center rounded-full bg-primary/10 px-2 text-[10px] font-semibold text-primary">
                      {roll}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">
                        {student.full_name || "Student"}
                      </p>

                      <p className="text-[10px] text-muted-foreground">
                        Roll No. {roll}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          changeStatus(student.id, "present")
                        }
                        className={`grid size-9 place-items-center rounded-xl text-[12px] font-semibold ring-hairline ${
                          status === "present"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card/60 text-muted-foreground"
                        }`}
                      >
                        P
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          changeStatus(student.id, "absent")
                        }
                        className={`grid size-9 place-items-center rounded-xl text-[12px] font-semibold ring-hairline ${
                          status === "absent"
                            ? "bg-destructive text-white"
                            : "bg-card/60 text-muted-foreground"
                        }`}
                      >
                        A
                      </button>
                    </div>
                  </div>
                </SoftCard>
              );
            })}
          </div>
        )}
      </section>

      {students.length > 0 && (
        <section className="sticky bottom-3">
          <button
            type="button"
            onClick={saveAttendance}
            disabled={saving}
            className="w-full rounded-2xl bg-primary px-4 py-3.5 text-[13px] font-semibold text-primary-foreground shadow-frost disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving
              ? "Saving Attendance..."
              : saved
                ? "Attendance Saved ✓"
                : "Save Attendance"}
          </button>
        </section>
      )}
    </AppShell>
  );
}