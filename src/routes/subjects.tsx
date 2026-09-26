import { createFileRoute } from "@tanstack/react-router";
import {
  AppShell,
  SectionHeader,
  SoftCard,
} from "@/components/AppShell";
import { APP_NAME } from "@/lib/mock-data";

export const Route = createFileRoute("/subjects")({
  head: () => ({
    meta: [
      { title: `Subjects — ${APP_NAME}` },
      {
        name: "description",
        content: "View your subjects, teachers, attendance and study material.",
      },
    ],
  }),
  component: SubjectsPage,
});

const subjects = [
  {
    name: "Engineering Mathematics",
    teacher: "Dr. Rajesh Kumar",
    attendance: 86,
  },
  {
    name: "Python Programming",
    teacher: "Ms. Leena Fernandes",
    attendance: 91,
  },
  {
    name: "Engineering Physics",
    teacher: "Dr. Amit Sharma",
    attendance: 74,
  },
  {
    name: "Engineering Chemistry",
    teacher: "Dr. Neha Gupta",
    attendance: 79,
  },
  {
    name: "Communication Skills",
    teacher: "Ms. Priya Mehta",
    attendance: 88,
  },
];

function SubjectsPage() {
  return (
    <AppShell title="Subjects">
      <section>
        <SectionHeader
          title="My Subjects"
          meta={`${subjects.length} subjects`}
        />

        <div className="space-y-3">
          {subjects.map((subject) => (
            <SoftCard key={subject.name}>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-[14px] font-medium leading-snug">
                    {subject.name}
                  </h3>

                  <p className="mt-1 text-[12px] text-muted-foreground">
                    {subject.teacher}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[16px] font-semibold text-primary">
                    {subject.attendance}%
                  </p>

                  <p className="text-[10px] text-muted-foreground">
                    Attendance
                  </p>
                </div>
              </div>
            </SoftCard>
          ))}
        </div>
      </section>
    </AppShell>
  );
}