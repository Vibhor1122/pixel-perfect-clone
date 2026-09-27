import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  buildMonthGrid,
  MONTHS,
  toISO,
  WEEK_LETTERS,
} from "@/lib/date-utils";
import { supabase } from "@/lib/supabase";

export function MonthCalendar() {
  const navigate = useNavigate();

  const today = new Date();
  const todayISO = toISO(today);

  const [cursor, setCursor] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const [activityDates, setActivityDates] = useState<Set<string>>(
    new Set()
  );

  const cells = buildMonthGrid(cursor.year, cursor.month);

  useEffect(() => {
    void loadActivityDates();
  }, [cursor.year, cursor.month]);

  async function loadActivityDates() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setActivityDates(new Set());
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("course, semester")
      .eq("id", user.id)
      .single();

    if (!profile?.course || !profile.semester) {
      setActivityDates(new Set());
      return;
    }

    const { data: timetableData } = await supabase
      .from("timetable_entries")
      .select("id")
      .eq("course", profile.course)
      .eq("semester", profile.semester);

    if (!timetableData || timetableData.length === 0) {
      setActivityDates(new Set());
      return;
    }

    const timetableIds = timetableData.map(
      (entry) => entry.id
    );

    const firstDay = `${cursor.year}-${String(
      cursor.month + 1
    ).padStart(2, "0")}-01`;

    const lastDate = new Date(
      cursor.year,
      cursor.month + 1,
      0
    ).getDate();

    const lastDay = `${cursor.year}-${String(
      cursor.month + 1
    ).padStart(2, "0")}-${String(lastDate).padStart(2, "0")}`;

    const { data: records } = await supabase
      .from("class_records")
      .select("class_date")
      .in("timetable_entry_id", timetableIds)
      .gte("class_date", firstDay)
      .lte("class_date", lastDay);

    const dates = new Set(
      (records ?? []).map((record) => record.class_date)
    );

    setActivityDates(dates);
  }

  const shift = (delta: number) => {
    const d = new Date(
      cursor.year,
      cursor.month + delta,
      1
    );

    setCursor({
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  };

  return (
    <section className="frost rounded-3xl p-4 shadow-frost ring-hairline">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {MONTHS[cursor.month]} {cursor.year}
          </p>

          <h2 className="font-display text-[22px] font-semibold leading-tight">
            Calendar
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label="Previous month"
            onClick={() => shift(-1)}
            className="grid size-8 place-items-center rounded-full bg-card/70 text-muted-foreground ring-hairline"
          >
            ‹
          </button>

          <button
            onClick={() =>
              setCursor({
                year: today.getFullYear(),
                month: today.getMonth(),
              })
            }
            className="shrink-0 text-[13px] font-medium text-primary"
          >
            Today
          </button>

          <button
            aria-label="Next month"
            onClick={() => shift(1)}
            className="grid size-8 place-items-center rounded-full bg-card/70 text-muted-foreground ring-hairline"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mb-2 grid grid-cols-7 gap-y-2 text-center">
        {WEEK_LETTERS.map((letter, index) => (
          <span
            key={index}
            className="text-[10px] font-medium text-muted-foreground"
          >
            {letter}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {cells.map((cell) => {
          const isToday = cell.iso === todayISO;

          const hasActivity =
            !cell.outside && activityDates.has(cell.iso);

          return (
            <button
              key={cell.iso}
              onClick={() =>
                navigate({
                  to: "/day/$date",
                  params: { date: cell.iso },
                })
              }
              className="flex flex-col items-center py-1"
            >
              <span
                className={[
                  "grid size-7 place-items-center rounded-full text-[13px]",
                  cell.outside
                    ? "text-foreground/25"
                    : "text-foreground/70",
                  isToday
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "",
                ].join(" ")}
              >
                {cell.day}
              </span>

              <span className="mt-0.5 flex h-1.5 items-center">
                {hasActivity ? (
                  <span className="size-1.5 rounded-full bg-primary" />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3 text-[10px] font-medium text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-primary" />
          Class activity
        </span>

        <span className="inline-flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-accent" />
          Today
        </span>
      </div>
    </section>
  );
}