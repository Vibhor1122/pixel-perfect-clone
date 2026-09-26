import { createFileRoute } from "@tanstack/react-router";
import {
  AppShell,
  Panel,
  SectionHeader,
  SoftCard,
} from "@/components/AppShell";
import { APP_NAME } from "@/lib/mock-data";

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

const attendance = [
  { subject: "Engineering Mathematics", percentage: 86 },
  { subject: "Python Programming", percentage: 91 },
  { subject: "Engineering Physics", percentage: 74 },
  { subject: "Engineering Chemistry", percentage: 79 },
  { subject: "Communication Skills", percentage: 88 },
];

function AttendancePage() {
  const overall = Math.round(
    attendance.reduce((sum, item) => sum + item.percentage, 0) /
      attendance.length
  );

  return (
    <AppShell title="Attendance">
      <section>
        <Panel className="text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Overall Attendance
          </p>

          <p className="mt-2 font-display text-4xl font-semibold text-primary">
            {overall}%
          </p>

          <p className="mt-2 text-[12px] text-muted-foreground">
            Across all subjects
          </p>
        </Panel>
      </section>

      <section>
        <SectionHeader
          title="Subject Attendance"
          meta={`${attendance.length} subjects`}
        />

        <div className="space-y-3">
          {attendance.map((item) => (
            <SoftCard key={item.subject}>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-[14px] font-medium leading-snug">
                    {item.subject}
                  </h3>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary/10">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.min(item.percentage, 100)}%`,
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
      </section>

      <p className="px-2 text-center text-[11px] leading-relaxed text-muted-foreground">
        Attendance shown here is your current attendance percentage.
      </p>
    </AppShell>
  );
}