import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AppShell,
  Panel,
  SectionHeader,
  SoftCard,
} from "@/components/AppShell";
import { useRole } from "@/lib/role-context";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin-announcements")({
  component: AdminAnnouncementsPage,
});

type Announcement = {
  id: string;
  title: string;
  body: string;
  kind: string;
  event_date: string | null;
  course: string | null;
  semester: number | null;
  created_at: string;
};

function AdminAnnouncementsPage() {
  const { role, loading: roleLoading } = useRole();
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState("general");
  const [eventDate, setEventDate] = useState("");
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");

  useEffect(() => {
    if (!roleLoading && role === "admin") {
      void loadAnnouncements();
    }
  }, [roleLoading, role]);

  async function loadAnnouncements() {
    setLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("announcements")
      .select(
        "id, title, body, kind, event_date, course, semester, created_at"
      )
      .order("created_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    setAnnouncements((data ?? []) as Announcement[]);
    setLoading(false);
  }

  async function createAnnouncement() {
    if (!title.trim() || !body.trim()) {
      setError("Please enter both a title and announcement message.");
      return;
    }

    if ((course.trim() && !semester) || (!course.trim() && semester)) {
      setError(
        "For a class-specific announcement, enter both course and semester."
      );
      return;
    }

  const semesterNumber = semester ? Number(semester) : null;

if (
  semesterNumber !== null &&
  (!Number.isInteger(semesterNumber) || semesterNumber < 1)
) {
  setError("Please enter a valid semester number.");
  return;
}

    setSaving(true);
    setError("");
    setSuccess("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Could not identify the logged-in admin.");
      setSaving(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("announcements")
      .insert({
        title: title.trim(),
        body: body.trim(),
        kind,
        event_date: eventDate || null,
        course: course.trim() || null,
        semester: semesterNumber,
        created_by: user.id,
      });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setTitle("");
    setBody("");
    setKind("general");
    setEventDate("");
    setCourse("");
    setSemester("");

    setSuccess("Announcement published successfully.");
    setSaving(false);

    await loadAnnouncements();
  }

  async function deleteAnnouncement(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this announcement?"
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");

    const { error: deleteError } = await supabase
      .from("announcements")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setSuccess("Announcement deleted.");
    await loadAnnouncements();
  }

  if (roleLoading) {
    return (
      <AppShell title="Announcements">
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
      <AppShell title="Announcements">
        <Panel className="text-center">
          <h2 className="font-display text-lg font-semibold">
            Admin access only
          </h2>

          <button
            type="button"
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
    <AppShell
      title="Manage Announcements"
      subtitle="Administration"
    >
      <section>
        <SectionHeader title="Publish Announcement" />

        <Panel>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                Title
              </label>

              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Mid Semester Examination"
                className="w-full rounded-xl bg-card/70 px-3 py-2.5 text-[13px] outline-none ring-hairline"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                Message
              </label>

              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Write the announcement..."
                rows={4}
                className="w-full resize-none rounded-xl bg-card/70 px-3 py-2.5 text-[13px] outline-none ring-hairline"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                Type
              </label>

              <select
                value={kind}
                onChange={(event) => setKind(event.target.value)}
                className="w-full rounded-xl bg-card/70 px-3 py-2.5 text-[13px] outline-none ring-hairline"
              >
                <option value="general">General</option>
                <option value="academic">Academic</option>
                <option value="exam">Exam</option>
                <option value="holiday">Holiday</option>
                <option value="deadline">Deadline</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                Event date (optional)
              </label>

              <input
                type="date"
                value={eventDate}
                onChange={(event) =>
                  setEventDate(event.target.value)
                }
                className="w-full rounded-xl bg-card/70 px-3 py-2.5 text-[13px] outline-none ring-hairline"
              />

              <p className="mt-1 text-[10px] text-muted-foreground">
                Use this for exams, holidays, deadlines or other
                date-specific notices.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                  Course
                </label>

                <input
                  value={course}
                  onChange={(event) =>
                    setCourse(event.target.value)
                  }
                  placeholder="e.g. BTech CS"
                  className="w-full rounded-xl bg-card/70 px-3 py-2.5 text-[13px] outline-none ring-hairline"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                  Semester
                </label>

                <input
                  type="number"
                  min="1"
                  value={semester}
                  onChange={(event) =>
                    setSemester(event.target.value)
                  }
                  placeholder="e.g. 1"
                  className="w-full rounded-xl bg-card/70 px-3 py-2.5 text-[13px] outline-none ring-hairline"
                />
              </div>
            </div>

            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Leave both Course and Semester empty to publish to
              everyone. Fill both to target one class.
            </p>

            {error ? (
              <div className="rounded-xl bg-destructive/10 px-3 py-2.5 text-[12px] text-destructive">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-xl bg-primary/10 px-3 py-2.5 text-[12px] text-primary">
                {success}
              </div>
            ) : null}

            <button
              type="button"
              disabled={saving}
              onClick={() => void createAnnouncement()}
              className="w-full rounded-xl bg-primary px-4 py-3 text-[12px] font-medium text-primary-foreground disabled:opacity-60"
            >
              {saving ? "Publishing..." : "Publish Announcement"}
            </button>
          </div>
        </Panel>
      </section>

      <section>
        <SectionHeader
          title="Published Announcements"
          meta={`${announcements.length} total`}
        />

        {loading ? (
          <Panel className="text-center">
            <p className="text-[12px] text-muted-foreground">
              Loading announcements...
            </p>
          </Panel>
        ) : announcements.length === 0 ? (
          <SoftCard>
            <p className="text-[12px] text-muted-foreground">
              No announcements have been published yet.
            </p>
          </SoftCard>
        ) : (
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <SoftCard key={announcement.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-medium capitalize text-primary">
                        {announcement.kind}
                      </span>

                      <span className="text-[10px] text-muted-foreground">
                        {announcement.course &&
                        announcement.semester
                          ? `${announcement.course} · Semester ${announcement.semester}`
                          : "Everyone"}
                      </span>
                    </div>

                    <h3 className="text-[14px] font-medium">
                      {announcement.title}
                    </h3>

                    <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                      {announcement.body}
                    </p>

                    {announcement.event_date ? (
                      <p className="mt-2 text-[11px] font-medium text-primary">
                        Date: {announcement.event_date}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void deleteAnnouncement(announcement.id)
                    }
                    className="shrink-0 rounded-lg bg-destructive/10 px-2.5 py-1.5 text-[10px] font-medium text-destructive"
                  >
                    Delete
                  </button>
                </div>
              </SoftCard>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}