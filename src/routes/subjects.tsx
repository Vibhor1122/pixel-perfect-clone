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

export const Route = createFileRoute("/subjects")({
  head: () => ({
    meta: [
      { title: `Subjects — ${APP_NAME}` },
      {
        name: "description",
        content: "View your subjects, teachers and attendance.",
      },
    ],
  }),
  component: SubjectsPage,
});

type Subject = {
  id: string;
  name: string;
  teacher_id: string | null;
};

type Teacher = {
  id: string;
  full_name: string | null;
};

type AttendanceSummary = {
  subject: string;
  percentage: number;
};

function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [attendance, setAttendance] = useState<AttendanceSummary[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadSubjects();
  }, []);

  async function loadSubjects() {
    setLoading(true);
    setError("");

    const { data: subjectData, error: subjectError } =
      await supabase
        .from("subjects")
        .select("id, name, teacher_id")
        .order("name", { ascending: true });

    if (subjectError) {
      setError(subjectError.message);
      setLoading(false);
      return;
    }

    const loadedSubjects = (subjectData ?? []) as Subject[];

    setSubjects(loadedSubjects);

    const teacherIds = [
      ...new Set(
        loadedSubjects
          .map((subject) => subject.teacher_id)
          .filter((id): id is string => Boolean(id))
      ),
    ];

    if (teacherIds.length > 0) {
      const { data: teacherData, error: teacherError } =
        await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", teacherIds);

      if (teacherError) {
        setError(teacherError.message);
        setLoading(false);
        return;
      }

      setTeachers((teacherData ?? []) as Teacher[]);
    } else {
      setTeachers([]);
    }

    const { data: attendanceData, error: attendanceError } =
      await supabase.rpc("get_my_attendance_summary");

    if (attendanceError) {
      setError(attendanceError.message);
      setLoading(false);
      return;
    }

    setAttendance(
      (attendanceData ?? []) as AttendanceSummary[]
    );

    setLoading(false);
  }

  function getTeacherName(teacherId: string | null) {
    if (!teacherId) {
      return "No teacher assigned";
    }

    const teacher = teachers.find(
      (item) => item.id === teacherId
    );

    return teacher?.full_name || "Teacher";
  }

  function getAttendance(subjectName: string) {
    const record = attendance.find(
      (item) => item.subject === subjectName
    );

    return record?.percentage ?? null;
  }

  if (loading) {
    return (
      <AppShell title="Subjects">
        <Panel className="text-center">
          <p className="text-[13px] text-muted-foreground">
            Loading subjects...
          </p>
        </Panel>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Subjects">
        <Panel className="text-center">
          <h2 className="font-display text-lg font-semibold">
            Could not load subjects
          </h2>

          <p className="mt-2 text-[12px] text-destructive">
            {error}
          </p>

          <button
            type="button"
            onClick={() => void loadSubjects()}
            className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-[12px] font-medium text-primary-foreground"
          >
            Try Again
          </button>
        </Panel>
      </AppShell>
    );
  }

  return (
    <AppShell title="Subjects">
      <section>
        {subjects.length > 0 ? (
          <SectionHeader
            title="My Subjects"
            meta={`${subjects.length} subjects`}
          />
        ) : (
          <SectionHeader title="My Subjects" />
        )}

        {subjects.length === 0 ? (
          <Panel className="text-center">
            <p className="text-[12px] text-muted-foreground">
              No subjects have been added for your course and semester yet.
            </p>
          </Panel>
        ) : (
          <div className="space-y-3">
            {subjects.map((subject) => {
              const percentage = getAttendance(subject.name);

              return (
                <SoftCard key={subject.id}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[14px] font-medium leading-snug">
                        {subject.name}
                      </h3>

                      <p className="mt-1 text-[12px] text-muted-foreground">
                        {getTeacherName(subject.teacher_id)}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[16px] font-semibold text-primary">
                        {percentage !== null
                          ? `${percentage}%`
                          : "—"}
                      </p>

                      <p className="text-[10px] text-muted-foreground">
                        Attendance
                      </p>
                    </div>
                  </div>
                </SoftCard>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}