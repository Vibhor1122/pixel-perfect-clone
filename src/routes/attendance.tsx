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
const ATTENDANCE_API_URL =
  import.meta.env["VITE_ATTENDANCE_API_URL"];

export const Route = createFileRoute("/attendance")({
  head: () => ({
    meta: [
      { title: `Attendance — ${APP_NAME}` },
      {
        name: "description",
        content: "View your overall and subject-wise attendance.",
      },
    ],
  }),
  component: AttendancePage,
});

type SubjectAttendance = {
  subject: string;
  total_classes: number;
  present_classes: number;
  percentage: number;
};

type OverallAttendance = {
  total_classes: number;
  present_classes: number;
  percentage: number;
};

function AttendancePage() {
  const [attendance, setAttendance] = useState<SubjectAttendance[]>([]);
  const [overall, setOverall] = useState<OverallAttendance | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadAttendance();
  }, []);

async function loadAttendance() {
  setLoading(true);
  setError("");

  try {
    if (!ATTENDANCE_API_URL) {
      throw new Error("Attendance API is not configured.");
    }

    // Find the logged-in student
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Could not identify the logged-in student.");
    }

    // Get the student's college ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("college_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      throw new Error("Could not load your student profile.");
    }

    const studentId = profile.college_id || user.id;
    console.log("Current student ID:", studentId);

    // Read attendance from Google Sheet
    const response = await fetch(ATTENDANCE_API_URL);

    if (!response.ok) {
      throw new Error("Could not connect to the attendance sheet.");
    }

    const result = await response.json();
    console.log("Attendance sheet response:", result);

    if (!result.success) {
      throw new Error(
        result.error || "Could not load attendance."
      );
    }

    // Keep only this student's attendance
   const normalizeStudentId = (value: unknown) =>
  String(value ?? "").replace(/^0+/, "");

const myRecords = (result.records ?? []).filter(
  (record: {
    studentId: string;
  }) =>
    normalizeStudentId(record.studentId) ===
    normalizeStudentId(studentId)
);
    // Group the student's records by subject
    const subjectMap = new Map<
      string,
      {
        total: number;
        present: number;
      }
    >();

    for (const record of myRecords) {
      const subjectName = String(record.subjectName || "Subject");

      const current = subjectMap.get(subjectName) ?? {
        total: 0,
        present: 0,
      };

      current.total += 1;

      if (record.status === "present") {
        current.present += 1;
      }

      subjectMap.set(subjectName, current);
    }

    const subjectAttendance: SubjectAttendance[] =
      Array.from(subjectMap.entries()).map(
        ([subjectName, counts]) => ({
          subject: subjectName,
          total_classes: counts.total,
          present_classes: counts.present,
          percentage:
            counts.total > 0
              ? Math.round(
                  (counts.present / counts.total) * 100
                )
              : 0,
        })
      );

    const totalClasses = myRecords.length;

    const presentClasses = myRecords.filter(
      (record: { status: string }) =>
        record.status === "present"
    ).length;

    setAttendance(subjectAttendance);

    setOverall({
      total_classes: totalClasses,
      present_classes: presentClasses,
      percentage:
        totalClasses > 0
          ? Math.round(
              (presentClasses / totalClasses) * 100
            )
          : 0,
    });
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Could not load attendance."
    );
  } finally {
    setLoading(false);
  }
}
  if (loading) {
    return (
      <AppShell title="Attendance">
        <Panel className="text-center">
          <p className="text-[13px] text-muted-foreground">
            Loading attendance...
          </p>
        </Panel>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Attendance">
        <Panel className="text-center">
          <h2 className="font-display text-lg font-semibold">
            Could not load attendance
          </h2>

          <p className="mt-2 text-[12px] text-destructive">
            {error}
          </p>

          <button
            type="button"
            onClick={() => void loadAttendance()}
            className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-[12px] font-medium text-primary-foreground"
          >
            Try Again
          </button>
        </Panel>
      </AppShell>
    );
  }

  const hasAttendance =
    overall !== null && overall.total_classes > 0;

  return (
    <AppShell title="Attendance">
      <section>
        <Panel className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Overall Attendance
          </p>

          <p className="mt-2 font-display text-4xl font-semibold text-primary">
            {hasAttendance ? `${overall.percentage}%` : "—"}
          </p>

          <p className="mt-2 text-[12px] text-muted-foreground">
            {hasAttendance
              ? `${overall.present_classes} of ${overall.total_classes} classes attended`
              : "No attendance has been recorded yet"}
          </p>
        </Panel>
      </section>

      <section>
        {attendance.length > 0 ? (
  <SectionHeader
    title="Subject Attendance"
    meta={`${attendance.length} subjects`}
  />
) : (
  <SectionHeader title="Subject Attendance" />
)}

        {attendance.length === 0 ? (
          <Panel className="text-center">
            <p className="text-[12px] text-muted-foreground">
              No attendance has been recorded for you yet.
            </p>
          </Panel>
        ) : (
          <div className="space-y-3">
            {attendance.map((item) => (
              <SoftCard key={item.subject}>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[14px] font-medium leading-snug">
                      {item.subject}
                    </h3>

                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {item.present_classes} of {item.total_classes} classes attended
                    </p>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary/10">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.min(
                            Math.max(item.percentage, 0),
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <p className="shrink-0 text-[18px] font-semibold text-primary">
                    {item.percentage}%
                  </p>
                </div>
              </SoftCard>
            ))}
          </div>
        )}
      </section>

      <p className="px-2 text-center text-[11px] leading-relaxed text-muted-foreground">
        Attendance shown here is your current attendance percentage.
      </p>
    </AppShell>
  );
}