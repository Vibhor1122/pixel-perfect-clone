import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { buildMonthGrid, MONTHS, toISO, WEEK_LETTERS } from "@/lib/date-utils";
import { getAnnouncements, hasContent } from "@/lib/mock-data";

export function MonthCalendar() {
  const navigate = useNavigate();
  const today = new Date();
  const todayISO = toISO(today);
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const cells = buildMonthGrid(cursor.year, cursor.month);
  const announcementDates = new Set(getAnnouncements(today).map((a) => a.date));

  const shift = (delta: number) => {
    const d = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  };

  return (
    <section className="frost rounded-3xl p-4 shadow-frost ring-hairline">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {MONTHS[cursor.month]} {cursor.year}
          </p>
          <h2 className="font-display text-[22px] font-semibold leading-tight">Calendar</h2>
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
            onClick={() => setCursor({ year: today.getFullYear(), month: today.getMonth() })}
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
        {WEEK_LETTERS.map((letter, i) => (
          <span key={i} className="text-[10px] font-medium text-muted-foreground">
            {letter}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-center">
        {cells.map((cell) => {
          const isToday = cell.iso === todayISO;
          const showClass = !cell.outside && hasContent(cell.iso);
          const showAnn = !cell.outside && announcementDates.has(cell.iso);
          return (
            <button
              key={cell.iso}
              onClick={() => navigate({ to: "/day/$date", params: { date: cell.iso } })}
              className="flex flex-col items-center py-1"
            >
              <span
                className={[
                  "grid size-7 place-items-center rounded-full text-[13px]",
                  cell.outside ? "text-foreground/25" : "text-foreground/70",
                  isToday ? "bg-primary font-semibold text-primary-foreground" : "",
                ].join(" ")}
              >
                {cell.day}
              </span>
              <span className="mt-0.5 flex h-1.5 items-center gap-0.5">
                {showClass ? <span className="size-1.5 rounded-full bg-primary" /> : null}
                {showAnn ? <span className="size-1.5 rounded-full bg-warm" /> : null}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3 text-[10px] font-medium text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-primary" />
          Classes
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-warm" />
          Announcement
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-accent" />
          Today
        </span>
      </div>
    </section>
  );
}
