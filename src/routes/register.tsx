import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { APP_NAME, COURSES, SECTIONS, SEMESTERS } from "@/lib/mock-data";
import { Field, inputClass, PrimaryButton } from "@/components/Field";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: `Create student account — ${APP_NAME}` },
      {
        name: "description",
        content: "Students can register with their roll number, course, semester and section.",
      },
      { property: "og:title", content: `Create student account — ${APP_NAME}` },
      {
        property: "og:description",
        content: "Students can register with their roll number, course, semester and section.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-background px-5 py-8 text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <Link to="/" className="text-[12px] font-medium text-primary">
        ← Back to login
      </Link>

      <h1 className="mt-4 font-display text-[24px] font-semibold leading-tight">Create account</h1>
      <p className="mt-1 text-[12px] text-muted-foreground">
        Student registration only. Teacher and CR accounts are created by the college admin.
      </p>

      <form
        className="frost mt-5 space-y-4 rounded-3xl p-5 shadow-frost ring-hairline"
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ to: "/home" });
        }}
      >
        <Field label="Full name">
          <input className={inputClass} placeholder="Aarav Mehta" />
        </Field>
        <Field label="Roll number">
          <input className={inputClass} placeholder="CS21B001" />
        </Field>
        <Field label="College email">
          <input type="email" className={inputClass} placeholder="aarav.mehta@kestrel.edu" />
        </Field>
        <Field label="Course">
          <select className={inputClass} defaultValue={COURSES[0]}>
            {COURSES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Semester">
            <select className={inputClass} defaultValue="5">
              {SEMESTERS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Section">
            <select className={inputClass} defaultValue="B">
              {SECTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Password">
          <input type="password" className={inputClass} placeholder="••••••••" />
        </Field>
        <Field label="Confirm password">
          <input type="password" className={inputClass} placeholder="••••••••" />
        </Field>

        <PrimaryButton type="submit">Create Account</PrimaryButton>
      </form>
    </div>
  );
}
