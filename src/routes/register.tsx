import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { APP_NAME, COURSES, SEMESTERS } from "@/lib/mock-data";
import { Field, inputClass, PrimaryButton } from "@/components/Field";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: `Create student account — ${APP_NAME}` },
      {
        name: "description",
        content:
          "Students can register with their roll number, course and semester.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState(COURSES[0]);
  const [semester, setSemester] = useState("5");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!fullName.trim() || !rollNumber.trim() || !email.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          college_id: rollNumber.trim(),
          course,
          semester: Number(semester),
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Account could not be created.");
      setLoading(false);
      return;
    }

    setMessage(
      "Account created successfully. Check your email if verification is required."
    );

    setLoading(false);

    setTimeout(() => {
      navigate({ to: "/" });
    }, 1500);
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[430px] overflow-hidden bg-background px-5 py-8 text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
      </div>

      <Link to="/" className="text-[12px] font-medium text-primary">
        ← Back to login
      </Link>

      <h1 className="mt-4 font-display text-[24px] font-semibold leading-tight">
        Create account
      </h1>

      <p className="mt-1 text-[12px] text-muted-foreground">
        Students can create an account here. For teacher and CR accounts,
        please contact the admin.
      </p>

      <form
        className="frost mt-5 space-y-4 rounded-3xl p-5 shadow-frost ring-hairline"
        onSubmit={handleRegister}
      >
        <Field label="Full name">
          <input
            className={inputClass}
            placeholder="Aarav Mehta"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </Field>

        <Field label="Roll number">
          <input
            className={inputClass}
            placeholder="CS21B001"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
            required
          />
        </Field>

        <Field label="College email">
          <input
            type="email"
            className={inputClass}
            placeholder="aarav.mehta@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        <Field label="Course">
          <select
            className={inputClass}
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          >
            {COURSES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>

        <Field label="Semester">
          <select
            className={inputClass}
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
          >
            {SEMESTERS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>

        <Field label="Password">
          <input
            type="password"
            className={inputClass}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Field>

        <Field label="Confirm password">
          <input
            type="password"
            className={inputClass}
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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

        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </PrimaryButton>
      </form>
    </div>
  );
}