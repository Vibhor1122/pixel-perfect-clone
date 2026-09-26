import { createFileRoute, Link } from "@tanstack/react-router";
import { APP_NAME } from "@/lib/mock-data";
import { Field, inputClass, PrimaryButton } from "@/components/Field";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: `Reset password — ${APP_NAME}` },
      { name: "description", content: "Request a password reset link for your college account." },
      { property: "og:title", content: `Reset password — ${APP_NAME}` },
      {
        property: "og:description",
        content: "Request a password reset link for your college account.",
      },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col justify-center overflow-hidden bg-background px-5 py-10 text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-warm/15 blur-3xl" />
      </div>

      <Link to="/" className="text-[12px] font-medium text-primary">
        ← Back to login
      </Link>

      <h1 className="mt-4 font-display text-[24px] font-semibold leading-tight">Forgot password</h1>
      <p className="mt-1 text-[12px] text-muted-foreground">
        Enter your college email and we'll send reset instructions.
      </p>

      <form className="frost mt-5 space-y-4 rounded-3xl p-5 shadow-frost ring-hairline">
        <Field label="College email">
          <input type="email" className={inputClass} placeholder="aarav.mehta@kestrel.edu" />
        </Field>
        <PrimaryButton type="button">Send reset link</PrimaryButton>
      </form>
    </div>
  );
}
