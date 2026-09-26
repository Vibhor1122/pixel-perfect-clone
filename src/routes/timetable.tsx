import { createFileRoute } from "@tanstack/react-router";
import {
  AppShell,
  SectionHeader,
  SoftCard,
} from "@/components/AppShell";
import { APP_NAME } from "@/lib/mock-data";

export const Route = createFileRoute("/timetable")({
  head: () => ({
    meta: [
      { title: `Timetable — ${APP_NAME}` },
      {
        name: "description",
        content: "View your weekly class timetable.",
      },
    ],
  }),
  component: TimetablePage,
});

const timetable = [
  {
    day: "Monday",
    classes: [
      {
        subject: "Engineering Mathematics",
        time: "9:00 AM – 10:00 AM",
        room: "B-204",
        teacher: "Dr. Rajesh Kumar",
      },
      {
        subject: "Python Programming",
        time: "10:00 AM – 11:00 AM",
        room: "Computer Lab 2",
        teacher: "Ms. Leena Fernandes",
      },
      {
        subject: "Engineering Physics",
        time: "11:00 AM – 12:00 PM",
        room: "A-105",
        teacher: "Dr. Amit Sharma",
      },
    ],
  },

  {
    day: "Tuesday",
    classes: [
      {
        subject: "Engineering Chemistry",
        time: "9:00 AM – 10:00 AM",
        room: "B-201",
        teacher: "Dr. Neha Gupta",
      },
      {
        subject: "Communication Skills",
        time: "10:00 AM – 11:00 AM",
        room: "C-103",
        teacher: "Ms. Priya Mehta",
      },
      {
        subject: "Engineering Mathematics",
        time: "11:00 AM – 12:00 PM",
        room: "B-204",
        teacher: "Dr. Rajesh Kumar",
      },
    ],
  },

  {
    day: "Wednesday",
    classes: [
      {
        subject: "Python Programming",
        time: "9:00 AM – 11:00 AM",
        room: "Computer Lab 2",
        teacher: "Ms. Leena Fernandes",
      },
      {
        subject: "Engineering Physics",
        time: "11:00 AM – 12:00 PM",
        room: "A-105",
        teacher: "Dr. Amit Sharma",
      },
    ],
  },

  {
    day: "Thursday",
    classes: [
      {
        subject: "Engineering Mathematics",
        time: "9:00 AM – 10:00 AM",
        room: "B-204",
        teacher: "Dr. Rajesh Kumar",
      },
      {
        subject: "Engineering Chemistry",
        time: "10:00 AM – 11:00 AM",
        room: "B-201",
        teacher: "Dr. Neha Gupta",
      },
    ],
  },

  {
    day: "Friday",
    classes: [
      {
        subject: "Communication Skills",
        time: "9:00 AM – 10:00 AM",
        room: "C-103",
        teacher: "Ms. Priya Mehta",
      },
      {
        subject: "Python Programming",
        time: "10:00 AM – 11:00 AM",
        room: "Computer Lab 2",
        teacher: "Ms. Leena Fernandes",
      },
    ],
  },
];

function TimetablePage() {
  return (
    <AppShell title="Timetable">
      <section>
        <SectionHeader
          title="Weekly Schedule"
          meta="Mon – Fri"
        />

        <div className="space-y-5">
          {timetable.map((day) => (
            <div key={day.day}>
              <h3 className="mb-2 px-1 font-display text-[15px] font-semibold">
                {day.day}
              </h3>

              <div className="space-y-2">
                {day.classes.map((classItem, index) => (
                  <SoftCard
                    key={`${day.day}-${classItem.subject}-${index}`}
                    className="!p-3.5"
                  >
                    <div className="flex gap-3">
                      <div className="w-[82px] shrink-0">
                        <p className="text-[11px] font-medium text-primary">
                          {classItem.time.split(" – ")[0]}
                        </p>

                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {classItem.time.split(" – ")[1]}
                        </p>
                      </div>

                      <div className="min-w-0 flex-1 border-l border-foreground/10 pl-3">
                        <h4 className="text-[13px] font-medium leading-snug">
                          {classItem.subject}
                        </h4>

                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {classItem.teacher}
                        </p>

                        <p className="mt-1 text-[11px] font-medium text-primary">
                          {classItem.room}
                        </p>
                      </div>
                    </div>
                  </SoftCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}