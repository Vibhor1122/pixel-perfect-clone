import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AppShell,
  Panel,
  SectionHeader,
  SoftCard,
} from "@/components/AppShell";
import { APP_NAME, COURSES, SEMESTERS } from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin-subjects")({
  head: () => ({
    meta: [
      { title: `Manage Subjects — ${APP_NAME}` },
      {
        name: "description",
        content: "Create subjects and assign teachers.",
      },
    ],
  }),
  component: AdminSubjectsPage,
});

type Teacher = {
  id: string;
  full_name: string | null;
};

type Subject = {
  id: string;
  name: string;
  course: string;
  semester: number;
  teacher_id: string | null;
};

function AdminSubjectsPage() {
  const { role, loading: roleLoading } = useRole();
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roleLoading && role === "admin") {
      void loadData();
    }
  }, [roleLoading, role]);

  async function loadData() {
    setLoading(true);
    setError("");

    const { data: subjectData, error: subjectError } = await supabase
      .from("subjects")
      .select("id, name, course, semester, teacher_id")
      .order("course")
      .order("semester")
      .order("name");

    if (subjectError) {
      setError(subjectError.message);
      setLoading(false);
      return;
    }

    const { data: teacherData, error: teacherError } = await supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "teacher")
      .order("full_name");

    if (teacherError) {
      setError(teacherError.message);
      setLoading(false);
      return;
    }

    setSubjects((subjectData ?? []) as Subject[]);
    setTeachers((teacherData ?? []) as Teacher[]);
    setLoading(false);
  }

  async function createSubject() {
    setMessage("");
    setError("");

    if (!name.trim() || !course || !semester) {
      setError("Please enter the subject name, course and semester.");
      return;
    }

    setSaving(true);

    const { error: insertError } = await supabase
      .from("subjects")
      .insert({
        name: name.trim(),
        course,
        semester: Number(semester),
        teacher_id: teacherId || null,
      });

    if (insertError) {
      if (insertError.code === "23505") {
        setError(
          "This subject already exists for the selected course and semester."
        );
      } else {
        setError(insertError.message);
      }

      setSaving(false);
      return;
    }

    setName("");
    setCourse("");
    setSemester("");
    setTeacherId("");

    setMessage("Subject created successfully.");

    await loadData();

    setSaving(false);
  }

  function teacherName(teacherId: string | null) {
    if (!teacherId) {
      return "No teacher assigned";
    }

    const teacher = teachers.find(
      (item) => item.id === teacherId
    );

    return teacher?.full_name || "Teacher";
  }

  if (roleLoading) {
    return (
      <AppShell title="Manage Subjects">
        <Panel className="text-center">
          <p className="text-[13px] text-muted-foreground">
            Checking admin access...
          </p>
        </Panel>
      </AppShell>
    );
  }

  if (role !== "admin") {
    return (
      <AppShell title="Manage Subjects">
        <Panel className="text-center">
          <h2 className="font-display text-lg font-semibold">
            Admin access only
          </h2>

          <p className="mt-2 text-[12px] text-muted-foreground">
            You do not have permission to access this page.
          </p>

          <button
            type="button"
            onClick={() => navigate({ to: "/home" })}
            className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-[12px] font-medium text-primary-foreground"
          >
            Return Home
          </button>
        </Panel>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Manage Subjects"
      subtitle="Administration"
      back={{
        to: "/admin",
        label: "Admin Dashboard",
      }}
    >
      <section>
        <SectionHeader title="Create Subject" />

        <Panel>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">
                Subject Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Engineering Mathematics"
                className="mt-1.5 w-full rounded-xl bg-card/70 px-3 py-2.5 text-[13px] outline-none ring-hairline"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-muted-foreground">
                Course
              </label>

              <select
                value={course}
                onChange={(event) => setCourse(event.target.value)}
                className="mt-1.5 w-full rounded-xl bg-card/70 px-3 py-2.5 text-[13px] outline-none ring-hairline"
              >
                <option value="">Select course</option>

                {COURSES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-muted-foreground">
                Semester
              </label>

              <select
                value={semester}
                onChange={(event) => setSemester(event.target.value)}
                className="mt-1.5 w-full rounded-xl bg-card/70 px-3 py-2.5 text-[13px] outline-none ring-hairline"
              >
                <option value="">Select semester</option>

                {SEMESTERS.map((item) => (
                  <option key={item} value={item}>
                    Semester {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium text-muted-foreground">
                Teacher
              </label>

              <select
                value={teacherId}
                onChange={(event) => setTeacherId(event.target.value)}
                className="mt-1.5 w-full rounded-xl bg-card/70 px-3 py-2.5 text-[13px] outline-none ring-hairline"
              >
                <option value="">No teacher assigned</option>

                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.full_name || "Unnamed Teacher"}
                  </option>
                ))}
              </select>

              {teachers.length === 0 ? (
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  No teacher accounts have been created yet.
                </p>
              ) : null}
            </div>

            {error ? (
              <p className="text-[12px] text-destructive">
                {error}
              </p>
            ) : null}

            {message ? (
              <p className="text-[12px] font-medium text-primary">
                {message}
              </p>
            ) : null}

            <button
              type="button"
              disabled={saving}
              onClick={() => void createSubject()}
              className="w-full rounded-xl bg-primary px-4 py-3 text-[13px] font-medium text-primary-foreground disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Subject"}
            </button>
          </div>
        </Panel>
      </section>

      <section>
        <SectionHeader
          title="Existing Subjects"
          meta={`${subjects.length} subjects`}
        />

        {loading ? (
          <Panel className="text-center">
            <p className="text-[12px] text-muted-foreground">
              Loading subjects...
            </p>
          </Panel>
        ) : subjects.length === 0 ? (
          <Panel className="text-center">
            <p className="text-[12px] text-muted-foreground">
              No subjects have been created yet.
            </p>
          </Panel>
        ) : (
          <div className="space-y-3">
            {subjects.map((subject) => (
              <SoftCard key={subject.id}>
                <h3 className="text-[14px] font-medium">
                  {subject.name}
                </h3>

                <p className="mt-1 text-[11px] text-muted-foreground">
                  {subject.course} · Semester {subject.semester}
                </p>

                <p className="mt-2 text-[11px] text-muted-foreground">
                  Teacher: {teacherName(subject.teacher_id)}
                </p>
              </SoftCard>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}