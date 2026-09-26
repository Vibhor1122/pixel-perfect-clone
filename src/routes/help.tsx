import { createFileRoute } from "@tanstack/react-router";
import {
  AppShell,
  Panel,
  SectionHeader,
  SoftCard,
} from "@/components/AppShell";
import { APP_NAME } from "@/lib/mock-data";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: `Help & Support — ${APP_NAME}` },
      {
        name: "description",
        content: "Get help and contact support.",
      },
    ],
  }),
  component: HelpPage,
});

function HelpPage() {
  return (
    <AppShell title="Help & Support">
      <section>
        <Panel>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Need Help?
          </p>

          <h2 className="mt-2 font-display text-xl font-semibold">
            We're here to help
          </h2>

          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
            If you're having trouble with your account, attendance,
            subjects, or any other part of the app, contact support.
          </p>
        </Panel>
      </section>

      <section>
        <SectionHeader title="Contact Support" />

        <SoftCard>
          <p className="text-[11px] font-medium text-muted-foreground">
            Support Email
          </p>

          <p className="mt-1 text-[14px] font-medium">
            vibhornarang12@gmail.com
          </p>

          <a
            href="mailto:vibhornarang12@gmail.com"
            className="mt-4 inline-flex rounded-xl bg-primary px-4 py-2.5 text-[12px] font-medium text-primary-foreground"
          >
            Email Support
          </a>
        </SoftCard>
      </section>

      <p className="px-2 text-center text-[11px] leading-relaxed text-muted-foreground">
        Please include a description of the issue when contacting support.
      </p>
    </AppShell>
  );
}