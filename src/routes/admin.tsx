import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
        <SectionHeader title="Academic Management" />

        <div className="space-y-3">
          <SoftCard>
            <h3 className="text-[14px] font-medium">Subjects</h3>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Create subjects and assign teachers.
            </p>
          </SoftCard>

          <SoftCard>
            <h3 className="text-[14px] font-medium">Timetable</h3>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Manage class schedules and rooms.
            </p>
          </SoftCard>

          <SoftCard>
            <h3 className="text-[14px] font-medium">Announcements</h3>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Publish notices, holidays, deadlines and other updates.
            </p>
          </SoftCard>
        </div>
      </section>
    </AppShell>
  );
}