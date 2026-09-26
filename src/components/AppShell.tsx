import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { COLLEGE_NAME, CURRENT_USER, ROLE_LABELS } from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";

type NavItem = { label: string; to: string };

function navItems(role: string | null): NavItem[] {
  const items: NavItem[] = [
    { label: "Home", to: "/home" },
    { label: "Calendar", to: "/calendar" },
    { label: "Subjects", to: "/subjects" },
    { label: "Attendance", to: "/attendance" },
    { label: "Timetable", to: "/timetable" },
  ];
  if (role !== "teacher") items.push({ label: "Class Chat", to: "/chat" });
  items.push({ label: "Announcements", to: "/announcements" });
  if (role === "cr") items.push({ label: "Mark Attendance", to: "/marks-attendance" });
  if (role === "admin") items.push({ label: "Admin Dashboard", to: "/admin" });
  items.push({ label: "Help & Support", to: "/help" });
  items.push({ label: "Settings", to: "/settings" });
  return items;
}

export function AppShell({
  title,
  subtitle,
  children,
  back,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  back?: { to: string; label: string };
}) {
  const [open, setOpen] = useState(false);
  const { role, loading } = useRole();
  const navigate = useNavigate();

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute bottom-0 left-6 h-72 w-72 rounded-full bg-warm/15 blur-3xl" />
      </div>

      <header className="frost sticky top-0 z-40 ring-hairline">
        <div className="flex h-14 items-center gap-3 px-4">
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-card/70 ring-hairline transition-transform active:scale-95"
          >
            <span className="inline-flex flex-col gap-[3px]">
              <span className="block h-[1.5px] w-4 bg-current" />
              <span className="block h-[1.5px] w-4 bg-current" />
              <span className="block h-[1.5px] w-4 bg-current" />
            </span>
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {subtitle ?? COLLEGE_NAME}
            </p>
            <h1 className="truncate font-display text-[15px] font-semibold leading-tight">{title}</h1>
          </div>
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-card/70 text-sm font-semibold text-primary ring-hairline">
            {CURRENT_USER.initials}
          </div>
        </div>
      </header>

      {back ? (
        <div className="px-4 pt-3">
          <Link to={back.to} className="text-[12px] font-medium text-primary">
            ← {back.label}
          </Link>
        </div>
      ) : null}

      <main className="space-y-4 px-4 pb-16 pt-4">{children}</main>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/25"
          />
          <div className="frost-3 absolute bottom-0 left-0 top-0 flex w-[74%] max-w-[320px] flex-col rounded-r-3xl shadow-frost-lg ring-hairline">
            <div className="flex items-center gap-3 px-5 pb-4 pt-6">
              <div className="grid size-11 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
                {CURRENT_USER.initials}
              </div>
              <div className="min-w-0">
                <p className="font-display text-[15px] font-semibold leading-tight">{CURRENT_USER.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {CURRENT_USER.course} · Sem {CURRENT_USER.semester}
                </p>
              </div>
            </div>
            <div className="px-5 pb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-medium text-accent ring-1 ring-accent/20">
                <span className="size-1.5 shrink-0 rounded-full bg-accent" />
                {loading ? "Loading..." : role ? `${ROLE_LABELS[role]} role` : "No role"}
              </span>
            </div>
            <nav className="flex-1 overflow-y-auto px-3">
              {navItems(role).map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-foreground/70"
                  activeProps={{ className: "bg-card/70 ring-hairline text-foreground" }}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setOpen(false);
                  navigate({ to: "/" });
                }}
                className="w-full rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-destructive"
              >
                Logout
              </button>
            </nav>
            <div className="px-5 pb-6 text-[11px] text-muted-foreground">
              Signed in as {CURRENT_USER.name}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SectionHeader({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="mb-2 flex items-center justify-between px-1">
      <h3 className="font-display text-[16px] font-semibold leading-tight">{title}</h3>
      {meta ? <span className="text-[11px] font-medium text-muted-foreground">{meta}</span> : null}
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`frost rounded-3xl p-4 shadow-frost ring-hairline ${className}`}>{children}</div>
  );
}

export function SoftCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`frost-2 rounded-2xl p-4 shadow-frost-sm ring-hairline ${className}`}>
      {children}
    </div>
  );
}
