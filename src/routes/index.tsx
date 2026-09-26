import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { APP_NAME, COLLEGE_NAME } from "@/lib/mock-data";
import { Field, inputClass, PrimaryButton } from "@/components/Field";
import { supabase } from "@/lib/supabase";
import { useRole } from "@/lib/role-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${APP_NAME} — Sign in` },
      {
        name: "description",
        content:
          "Sign in to Kestrel Campus to see your class calendar, notes, attendance and college announcements.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { refreshRole } = useRole();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const { error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    await refreshRole();

    setLoading(false);
    navigate({ to: "/home" });
  }

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col justify-center overflow-hidden bg-background px-5 py-10 text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-accent/25 blur-3xl" />
        <div className="absolute bottom-0 left-6 h-72 w-72 rounded-full bg-warm/15 blur-3xl" />
      </div>

      <div className="mb-7 flex flex-col items-center text-center">
        <div className="grid size-16 place-items-center rounded-2xl bg-card/70 font-display text-2xl font-semibold text-primary shadow-frost ring-hairline">
          K
        </div>

        <h1 className="mt-4 font-display text-[26px] font-semibold leading-tight">
          {APP_NAME}
        </h1>

        <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {COLLEGE_NAME}
        </p>
      </div>

      <form
        className="frost space-y-4 rounded-3xl p-5 shadow-frost ring-hairline"
        onSubmit={handleLogin}
      >
        <Field label="Email">
          <input
            type="email"
            className={inputClass}
            placeholder="student@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
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

        {error && (
          <div className="rounded-xl bg-destructive/10 px-3 py-2.5 text-[12px] text-destructive">
            {error}
          </div>
        )}

        <PrimaryButton type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </PrimaryButton>

        <div className="text-center">
          <Link
            to="/forgot-password"
            className="text-[12px] font-medium text-primary"
          >
            Forgot password?
          </Link>
        </div>
      </form>

      <p className="mt-6 text-center text-[13px] text-muted-foreground">
        New student?{" "}
        <Link to="/register" className="font-medium text-primary">
          Create Account
        </Link>
      </p>
    </div>
  );
}