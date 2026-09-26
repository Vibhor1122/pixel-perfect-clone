import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  AppShell,
  Panel,
  SectionHeader,
} from "@/components/AppShell";
import { APP_NAME } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: `Settings — ${APP_NAME}` },
      {
        name: "description",
        content: "Manage your account settings.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function changePassword() {
    setError("");
    setMessage("");

    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);

    const { error: updateError } =
      await supabase.auth.updateUser({
        password: newPassword,
      });

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setNewPassword("");
    setConfirmPassword("");

    setMessage("Password changed successfully.");
    setSaving(false);
  }

  return (
    <AppShell title="Settings">
      <section>
        <Panel>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Account Settings
          </p>

          <h2 className="mt-2 font-display text-xl font-semibold">
            Manage your account
          </h2>

          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
            Update your account password and security settings.
          </p>
        </Panel>
      </section>

      <section>
        <SectionHeader title="Change Password" />

        <Panel>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-medium text-muted-foreground">
                New Password
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(event.target.value)
                }
                placeholder="Enter new password"
                autoComplete="new-password"
                className="mt-1.5 w-full rounded-xl bg-card/70 px-3 py-2.5 text-[13px] outline-none ring-hairline"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium text-muted-foreground">
                Confirm New Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Enter new password again"
                autoComplete="new-password"
                className="mt-1.5 w-full rounded-xl bg-card/70 px-3 py-2.5 text-[13px] outline-none ring-hairline"
              />
            </div>

            {error ? (
              <p className="text-[12px] text-destructive">
                {error}
              </p>
            ) : null}

            {message ? (
              <p className="text-[12px] font-medium text-primary">
                {message}
              </p>
            ) : null}

            <button
              type="button"
              disabled={saving}
              onClick={() => void changePassword()}
              className="w-full rounded-xl bg-primary px-4 py-3 text-[13px] font-medium text-primary-foreground disabled:opacity-50"
            >
              {saving ? "Changing Password..." : "Change Password"}
            </button>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}