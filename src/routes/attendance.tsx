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

    const { data: subjectData, error: subjectError } =
      await supabase.rpc("get_my_attendance_summary");

    if (subjectError) {
      setError(subjectError.message);
      setLoading(false);
      return;
    }

    const { data: overallData, error: overallError } =
      await supabase.rpc("get_my_overall_attendance");

    if (overallError) {
      setError(overallError.message);
      setLoading(false);
      return;
    }

    setAttendance(
      (subjectData ?? []) as SubjectAttendance[]
    );

    setOverall(
      overallData && overallData.length > 0
        ? (overallData[0] as OverallAttendance)
        : null
    );

    setLoading(false);
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