import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  AppShell,
  Panel,
  SectionHeader,
  SoftCard,
} from "@/components/AppShell";
import { useRole } from "@/lib/role-context";
import { APP_NAME } from "@/lib/mock-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: `Admin Dashboard — ${APP_NAME}` },
      {
        name: "description",
        content: "Manage Kestrel Campus users and academic information.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { role, loading } = useRole();
  const navigate = useNavigate();
  const [chatEnabled, setChatEnabled] = useState(true);
const [chatLoading, setChatLoading] = useState(true);
const [chatSaving, setChatSaving] = useState(false);
const [chatError, setChatError] = useState("");
useEffect(() => {
  if (!loading && role === "admin") {
    void loadChatSetting();
  }
}, [loading, role]);

async function loadChatSetting() {
  setChatLoading(true);
  setChatError("");

  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("id", "class_chat_enabled")
    .single();

  if (error) {
    setChatError(error.message);
    setChatLoading(false);
    return;
  }

  setChatEnabled(data.value);
  setChatLoading(false);
}

async function toggleChat() {
  setChatSaving(true);
  setChatError("");

  const newValue = !chatEnabled;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    setChatError("Could not identify the logged-in admin.");
    setChatSaving(false);
    return;
  }

  const { error } = await supabase
    .from("app_settings")
    .update({
      value: newValue,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", "class_chat_enabled");

  if (error) {
    setChatError(error.message);
    setChatSaving(false);
    return;
  }

  setChatEnabled(newValue);
  setChatSaving(false);
}

  if (loading) {
    return (
      <AppShell title="Admin Dashboard">
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
      <AppShell title="Admin Dashboard">
        <Panel className="text-center">
          <h2 className="font-display text-lg font-semibold">
            Admin access only
          </h2>

          <p className="mt-2 text-[12px] text-muted-foreground">
            You do not have permission to access this page.
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

  return (
    <AppShell title="Admin Dashboard" subtitle="Administration">
      <section>
        <Panel>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Administration
          </p>

          <h2 className="mt-2 font-display text-xl font-semibold">
            Manage your college
          </h2>

          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
            Create accounts, manage users and maintain academic information.
          </p>
        </Panel>
      </section>

      <section>
        <SectionHeader title="User Management" />

        <div className="space-y-3">
          <SoftCard>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-[14px] font-medium">Create Account</h3>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Add a student, teacher or class representative.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate({ to: "/admin-create-user" })}
                className="shrink-0 rounded-xl bg-primary px-3 py-2 text-[11px] font-medium text-primary-foreground"
              >
                Create
              </button>
            </div>
          </SoftCard>

          <SoftCard>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-[14px] font-medium">Manage Users</h3>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  View and manage existing college accounts.
                </p>
              </div>

              <button
                type="button"
                className="shrink-0 rounded-xl bg-card/70 px-3 py-2 text-[11px] font-medium text-primary ring-hairline"
              >
                View
              </button>
            </div>
          </SoftCard>
        </div>
      </section>
      <section>
  <SectionHeader title="Class Chat Control" />

  <SoftCard>
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-[14px] font-medium">
            Class Chat
          </h3>

          {!chatLoading ? (
            <span
              className={[
                "rounded-lg px-2 py-1 text-[10px] font-medium",
                chatEnabled
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive",
              ].join(" ")}
            >
              {chatEnabled ? "Enabled" : "Disabled"}
            </span>
          ) : null}
        </div>

        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          {chatEnabled
            ? "Students and class representatives can currently use Class Chat."
            : "Class Chat is currently disabled for students and class representatives."}
        </p>
      </div>

      <button
        type="button"
        disabled={chatLoading || chatSaving}
        onClick={() => void toggleChat()}
        className={[
          "shrink-0 rounded-xl px-3 py-2 text-[11px] font-medium disabled:opacity-60",
          chatEnabled
            ? "bg-destructive/10 text-destructive"
            : "bg-primary text-primary-foreground",
        ].join(" ")}
      >
        {chatSaving
          ? "Saving..."
          : chatEnabled
            ? "Disable"
            : "Enable"}
      </button>
    </div>

    {chatError ? (
      <div className="mt-3 rounded-xl bg-destructive/10 px-3 py-2.5 text-[11px] text-destructive">
        {chatError}
      </div>
    ) : null}
  </SoftCard>
</section>

      <section>
        <SectionHeader title="Academic Management" />

        <div className="space-y-3">
          <SoftCard>
  <div className="flex items-center justify-between gap-4">
    <div>
      <h3 className="text-[14px] font-medium">Subjects</h3>

      <p className="mt-1 text-[11px] text-muted-foreground">
        Create subjects and assign teachers.
      </p>
    </div>

    <button
      type="button"
      onClick={() => navigate({ to: "/admin-subjects" })}
      className="shrink-0 rounded-xl bg-primary px-3 py-2 text-[11px] font-medium text-primary-foreground"
    >
      Manage
    </button>
  </div>
</SoftCard>

          <SoftCard>
            <h3 className="text-[14px] font-medium">Timetable</h3>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Manage class schedules and rooms.
            </p>
          </SoftCard>

         <SoftCard>
  <div className="flex items-center justify-between gap-4">
    <div>
      <h3 className="text-[14px] font-medium">
        Announcements
      </h3>

      <p className="mt-1 text-[11px] text-muted-foreground">
        Publish notices, holidays, deadlines and other updates.
      </p>
    </div>

    <button
      type="button"
      onClick={() =>
        navigate({ to: "/admin-announcements" })
      }
      className="shrink-0 rounded-xl bg-primary px-3 py-2 text-[11px] font-medium text-primary-foreground"
    >
      Manage
    </button>
  </div>
</SoftCard>
        </div>
      </section>
    </AppShell>
  );
}