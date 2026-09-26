import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, Panel } from "@/components/AppShell";
import { Field, inputClass, PrimaryButton } from "@/components/Field";
import { COURSES, SEMESTERS } from "@/lib/mock-data";
import { useRole } from "@/lib/role-context";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin-create-user")({
  component: AdminCreateUserPage,
});

type AccountRole = "student" | "teacher" | "cr";

function AdminCreateUserPage() {
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useRole();

  const [accountRole, setAccountRole] = useState<AccountRole>("student");
  const [fullName, setFullName] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [course, setCourse] = useState(COURSES[0]);
  const [semester, setSemester] = useState("5");
  

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (roleLoading) {
    return (
      <AppShell title="Create Account">
        <Panel className="text-center">
          <p className="text-[13px] text-muted-foreground">
            Checking admin access...
          </p>
        </Panel>
      </AppShell>
    );
  }

  if (role !== "admin") {
    return (
      <AppShell title="Create Account">
        <Panel className="text-center">
          <h2 className="font-display text-lg font-semibold">
            Admin access only
          </h2>

          <p className="mt-2 text-[12px] text-muted-foreground">
            Only an administrator can create college accounts.
          </p>

          <button
            onClick={() => navigate({ to: "/home" })}
            className="mt-4 rounded-xl bg-primary px-4 py-2.5 text-[12px] font-medium text-primary-foreground"
          >
            Return Home
          </button>
        </Panel>
      </AppShell>
    );
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!fullName.trim() || !email.trim() || !password) {
      setError("Name, email and password are required.");
      return;
    }

    if (password.length < 6) {
      setError("Temporary password must be at least 6 characters.");
      return;
    }

    setSubmitting(true);

    const { data, error: functionError } =
      await supabase.functions.invoke("create-user", {
        body: {
          full_name: fullName.trim(),
          college_id: collegeId.trim() || null,
          email: email.trim(),
          password,
          role: accountRole,

          course:
            accountRole === "student" || accountRole === "cr"
              ? course
              : null,

          semester:
            accountRole === "student" || accountRole === "cr"
              ? Number(semester)
              : null,

        
        },
      });

    if (functionError) {
  console.error("Create user function error:", functionError);

  try {
    const response = (functionError as any).context;

    if (response) {
      const body = await response.json();
      console.error("Edge Function response:", body);

      setError(body?.error || functionError.message);
    } else {
      setError(functionError.message);
    }
  } catch {
    setError(functionError.message);
  }

  setSubmitting(false);
  return;
}

    if (data?.error) {
      setError(data.error);
      setSubmitting(false);
      return;
    }

    setMessage(
      `${
        accountRole === "cr"
          ? "CR"
          : accountRole.charAt(0).toUpperCase() + accountRole.slice(1)
      } account created successfully.`
    );

    setFullName("");
    setCollegeId("");
    setEmail("");
    setPassword("");
    setSubmitting(false);
  }

  const needsClass =
    accountRole === "student" || accountRole === "cr";

  return (
    <AppShell
      title="Create Account"
      subtitle="Administration"
      back={{ to: "/admin", label: "Admin Dashboard" }}
    >
      <section>
        <Panel>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Account type
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setAccountRole("student")}
              className={`rounded-xl px-2 py-2.5 text-[12px] font-medium ring-hairline ${
                accountRole === "student"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/60 text-muted-foreground"
              }`}
            >
              Student
            </button>

            <button
              type="button"
              onClick={() => setAccountRole("teacher")}
              className={`rounded-xl px-2 py-2.5 text-[12px] font-medium ring-hairline ${
                accountRole === "teacher"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/60 text-muted-foreground"
              }`}
            >
              Teacher
            </button>

            <button
              type="button"
              onClick={() => setAccountRole("cr")}
              className={`rounded-xl px-2 py-2.5 text-[12px] font-medium ring-hairline ${
                accountRole === "cr"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/60 text-muted-foreground"
              }`}
            >
              CR
            </button>
          </div>
        </Panel>
      </section>

      <form
        onSubmit={handleCreate}
        className="frost space-y-4 rounded-3xl p-5 shadow-frost ring-hairline"
      >
        <Field label="Full name">
          <input
            className={inputClass}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
            required
          />
        </Field>

        <Field label="College ID / Roll number">
          <input
            className={inputClass}
            value={collegeId}
            onChange={(e) => setCollegeId(e.target.value)}
            placeholder={
              accountRole === "teacher"
                ? "Faculty ID"
                : "Roll number"
            }
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@college.edu"
            required
          />
        </Field>

        {needsClass && (
  <>
    <Field label="Course">
      <select
        className={inputClass}
        value={course}
        onChange={(e) => setCourse(e.target.value)}
      >
        {COURSES.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </Field>

    <Field label="Semester">
      <select
        className={inputClass}
        value={semester}
        onChange={(e) => setSemester(e.target.value)}
      >
        {SEMESTERS.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </Field>
  </>
)}
        <Field label="Temporary password">
          <input
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
            required
          />
        </Field>

        {error && (
          <div className="rounded-xl bg-destructive/10 px-3 py-2.5 text-[12px] text-destructive">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-xl bg-primary/10 px-3 py-2.5 text-[12px] text-primary">
            {message}
          </div>
        )}

        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? "Creating Account..." : "Create Account"}
        </PrimaryButton>
      </form>
    </AppShell>
  );
}