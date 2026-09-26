import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  AppShell,
  Panel,
  SectionHeader,
  SoftCard,
} from "@/components/AppShell";
import { APP_NAME } from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";

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

const subjects = [
  "Engineering Mathematics",
  "Python Programming",
  "Engineering Physics",
  "Engineering Chemistry",
  "Communication Skills",
];

const students = [
  { id: 1, roll: "01", name: "Aarav Mehta" },
  { id: 2, roll: "02", name: "Aditi Sharma" },
  { id: 3, roll: "03", name: "Arjun Verma" },
  { id: 4, roll: "04", name: "Ishita Gupta" },
  { id: 5, roll: "05", name: "Kabir Singh" },
  { id: 6, roll: "06", name: "Meera Kapoor" },
  { id: 7, roll: "07", name: "Rohan Yadav" },
  { id: 8, roll: "08", name: "Sanya Jain" },
];

type AttendanceStatus = "present" | "absent";

function MarkAttendancePage() {
  const { role } = useRole();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(subjects[0]);
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [attendance, setAttendance] = useState<
    Record<number, AttendanceStatus>
  >(
    Object.fromEntries(
      students.map((student) => [student.id, "present"])
    ) as Record<number, AttendanceStatus>
  );

  const [saved, setSaved] = useState(false);

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
    studentId: number,
    status: AttendanceStatus
  ) {
    setAttendance((current) => ({
      ...current,
      [studentId]: status,
    }));

    setSaved(false);
  }

  function markEveryonePresent() {
    setAttendance(
      Object.fromEntries(
        students.map((student) => [student.id, "present"])
      ) as Record<number, AttendanceStatus>
    );

    setSaved(false);
  }

  function saveAttendance() {
    setSaved(true);
  }

  return (
    <AppShell
      title="Mark Attendance"
      subtitle="Class Representative"
      back={{ to: "/attendance", label: "Attendance" }}
    >
      <section>
        <Panel>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Subject
              </label>

              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setSaved(false);
                }}
                className="w-full rounded-xl bg-card/70 px-3 py-3 text-[13px] outline-none ring-hairline"
              >
                {subjects.map((item) => (
                  <option key={item}>{item}</option>
                ))}
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
          meta={`${students.length} students`}
        />

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
            onClick={markEveryonePresent}
            className="text-[11px] font-medium text-primary"
          >
            All Present
          </button>
        </div>

        <div className="space-y-2">
          {students.map((student) => {
            const status = attendance[student.id];

            return (
              <SoftCard
                key={student.id}
                className="!p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                    {student.roll}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium">
                      {student.name}
                    </p>

                    <p className="text-[10px] text-muted-foreground">
                      Roll No. {student.roll}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-1.5">
                    <button
                      onClick={() =>
                        changeStatus(student.id, "present")
                      }
                      className={`grid size-9 place-items-center rounded-xl text-[12px] font-semibold ring-hairline ${
                        status === "present"
                          ? "bg-primary text-primary-foreground"
                          : "bg-card/60 text-muted-foreground"
                      }`}
                      aria-label={`Mark ${student.name} present`}
                    >
                      P
                    </button>

                    <button
                      onClick={() =>
                        changeStatus(student.id, "absent")
                      }
                      className={`grid size-9 place-items-center rounded-xl text-[12px] font-semibold ring-hairline ${
                        status === "absent"
                          ? "bg-destructive text-white"
                          : "bg-card/60 text-muted-foreground"
                      }`}
                      aria-label={`Mark ${student.name} absent`}
                    >
                      A
                    </button>
                  </div>
                </div>
              </SoftCard>
            );
          })}
        </div>
      </section>

      <section className="sticky bottom-3">
        <button
          onClick={saveAttendance}
          className="w-full rounded-2xl bg-primary px-4 py-3.5 text-[13px] font-semibold text-primary-foreground shadow-frost"
        >
          {saved ? "Attendance Saved ✓" : "Save Attendance"}
        </button>
      </section>
    </AppShell>
  );
}