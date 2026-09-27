import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AppShell,
  Panel,
  SectionHeader,
  SoftCard,
} from "@/components/AppShell";
import { APP_NAME } from "@/lib/mock-data";
import { formatLong } from "@/lib/date-utils";
import { supabase } from "@/lib/supabase";
import { useRole } from "@/lib/role-context";
import {
  getGoogleDriveAccessToken,
  makeDriveFileViewable,
  uploadPdfToGoogleDrive,
} from "@/lib/google-drive";

export const Route = createFileRoute("/day/$date")({
  head: () => ({
    meta: [
      { title: `Daily activity — ${APP_NAME}` },
      {
        name: "description",
        content: "Classes scheduled for the selected date.",
      },
    ],
  }),
  component: DayPage,
});

type Profile = {
  course: string | null;
  semester: number | null;
};

type Subject = {
  id: string;
  name: string;
};

type TimetableEntry = {
  id: string;
  subject_id: string;
  start_time: string;
  end_time: string;
  room: string | null;
};

type ClassRecord = {
  id: string;
  timetable_entry_id: string;
  summary: string | null;
};

type ClassMaterial = {
  id: string;
  class_record_id: string;
  file_name: string;
  drive_file_id: string;
  drive_web_link: string;
};

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function DayPage() {
  const { date } = Route.useParams();
  const { role } = useRole();

  const [sessions, setSessions] = useState<TimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [records, setRecords] = useState<ClassRecord[]>([]);

  const [materials, setMaterials] = useState<ClassMaterial[]>([]);
const [uploadingSessionId, setUploadingSessionId] = useState<string | null>(
  null
);

  const [editingSessionId, setEditingSessionId] = useState<string | null>(
    null
  );
  const [summaryText, setSummaryText] = useState("");
  const [saving, setSaving] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    void loadDay();
  }, [date]);

  async function loadDay() {
    setLoading(true);
    setError("");
    setSuccess("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("Could not identify the logged-in user.");
      setLoading(false);
      return;
    }

    const { data: profileData, error: profileError } =
      await supabase
        .from("profiles")
        .select("course, semester")
        .eq("id", user.id)
        .single();

    if (profileError || !profileData) {
      setError("Could not load your class information.");
      setLoading(false);
      return;
    }

    const profile = profileData as Profile;

    if (!profile.course || !profile.semester) {
      setError("Your account does not have complete class information.");
      setLoading(false);
      return;
    }

    const selectedDate = new Date(`${date}T12:00:00`);
    const dayName = DAY_NAMES[selectedDate.getDay()];

    if (!dayName) {
      setError("Invalid date.");
      setLoading(false);
      return;
    }

    const { data: subjectData, error: subjectError } =
      await supabase
        .from("subjects")
        .select("id, name")
        .eq("course", profile.course)
        .eq("semester", profile.semester);

    if (subjectError) {
      setError(subjectError.message);
      setLoading(false);
      return;
    }

    setSubjects((subjectData ?? []) as Subject[]);

    if (dayName === "Sunday") {
      setSessions([]);
      setRecords([]);
      setLoading(false);
      return;
    }

    const { data: timetableData, error: timetableError } =
      await supabase
        .from("timetable_entries")
        .select("id, subject_id, start_time, end_time, room")
        .eq("course", profile.course)
        .eq("semester", profile.semester)
        .eq("day", dayName)
        .order("start_time", { ascending: true });

    if (timetableError) {
      setError(timetableError.message);
      setLoading(false);
      return;
    }

    const loadedSessions =
      (timetableData ?? []) as TimetableEntry[];

    setSessions(loadedSessions);

    if (loadedSessions.length === 0) {
      setRecords([]);
      setLoading(false);
      return;
    }

    const sessionIds = loadedSessions.map((session) => session.id);

    const { data: recordData, error: recordError } =
      await supabase
        .from("class_records")
        .select("id, timetable_entry_id, summary")
        .eq("class_date", date)
        .in("timetable_entry_id", sessionIds);

    if (recordError) {
      setError(recordError.message);
      setLoading(false);
      return;
    }

    const loadedRecords = (recordData ?? []) as ClassRecord[];

setRecords(loadedRecords);

if (loadedRecords.length === 0) {
  setMaterials([]);
  setLoading(false);
  return;
}

const recordIds = loadedRecords.map((record) => record.id);

const { data: materialData, error: materialError } =
  await supabase
    .from("class_materials")
    .select(
      "id, class_record_id, file_name, drive_file_id, drive_web_link"
    )
    .in("class_record_id", recordIds)
    .order("created_at", { ascending: true });

if (materialError) {
  setError(materialError.message);
  setLoading(false);
  return;
}

setMaterials((materialData ?? []) as ClassMaterial[]);
setLoading(false);
  }

  function subjectName(subjectId: string) {
    return (
      subjects.find((subject) => subject.id === subjectId)?.name ??
      "Unknown Subject"
    );
  }

  function getRecord(sessionId: string) {
    return records.find(
      (record) => record.timetable_entry_id === sessionId
    );
  }

  function formatTime(time: string) {
    const parts = time.split(":");
    const hours = Number(parts[0]);
    const minutes = parts[1] ?? "00";

    const suffix = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;

    return `${displayHour}:${minutes} ${suffix}`;
  }

  function startEditing(sessionId: string) {
    const existingRecord = getRecord(sessionId);

    setEditingSessionId(sessionId);
    setSummaryText(existingRecord?.summary ?? "");
    setError("");
    setSuccess("");
  }

  function cancelEditing() {
    setEditingSessionId(null);
    setSummaryText("");
  }
  async function uploadPdf(
  sessionId: string,
  file: File
) {
  if (file.type !== "application/pdf") {
    setError("Please select a PDF file.");
    return;
  }

  const record = getRecord(sessionId);

  if (!record) {
    setError(
      "Please add and save the class summary before uploading a PDF."
    );
    return;
  }

  setUploadingSessionId(sessionId);
  setError("");
  setSuccess("");

  try {
    const accessToken = await getGoogleDriveAccessToken();

    const uploadedFile = await uploadPdfToGoogleDrive(
      file,
      accessToken
    );

    await makeDriveFileViewable(
      uploadedFile.id,
      accessToken
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Could not identify the logged-in user.");
    }

    const { error: materialError } = await supabase
      .from("class_materials")
      .insert({
        class_record_id: record.id,
        file_name: uploadedFile.name,
        drive_file_id: uploadedFile.id,
        drive_web_link: uploadedFile.webViewLink,
        uploaded_by: user.id,
      });

    if (materialError) {
      throw new Error(materialError.message);
    }

    setSuccess("PDF uploaded successfully.");

    await loadDay();
  } catch (uploadError) {
    if (uploadError instanceof Error) {
      setError(uploadError.message);
    } else {
      setError("PDF upload failed.");
    }
  } finally {
    setUploadingSessionId(null);
  }
}

  async function saveSummary(sessionId: string) {
    const trimmedSummary = summaryText.trim();

    if (!trimmedSummary) {
      setError("Please write what happened in the class.");
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
      setError("Could not identify the logged-in user.");
      setSaving(false);
      return;
    }

    const existingRecord = getRecord(sessionId);

    if (existingRecord) {
      const { error: updateError } = await supabase
        .from("class_records")
        .update({
          summary: trimmedSummary,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRecord.id);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("class_records")
        .insert({
          timetable_entry_id: sessionId,
          class_date: date,
          summary: trimmedSummary,
          created_by: user.id,
        });

      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }
    }

    setEditingSessionId(null);
    setSummaryText("");
    setSaving(false);
    setSuccess("Class summary saved.");

    await loadDay();
  }

  return (
    <AppShell
      title="Daily activity"
      back={{ to: "/calendar", label: "Calendar" }}
    >
      <Panel>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Selected date
        </p>

        <h2 className="mt-1 font-display text-[20px] font-semibold leading-tight">
          {formatLong(date)}
        </h2>

        <p className="mt-1 text-[12px] text-muted-foreground">
          {loading
            ? "Loading schedule..."
            : `${sessions.length} ${
                sessions.length === 1 ? "class" : "classes"
              } scheduled`}
        </p>
      </Panel>

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

      <section>
        <SectionHeader title="Classes" />

        {loading ? (
          <Panel className="text-center">
            <p className="text-[12px] text-muted-foreground">
              Loading classes...
            </p>
          </Panel>
        ) : sessions.length === 0 ? (
          <SoftCard>
            <p className="text-[13px] text-muted-foreground">
              No classes scheduled for this date.
            </p>
          </SoftCard>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const record = getRecord(session.id);
              const isEditing = editingSessionId === session.id;

              return (
                <SoftCard key={session.id}>
                  <div className="flex gap-3">
                    <div className="w-[82px] shrink-0">
                      <p className="text-[11px] font-medium text-primary">
                        {formatTime(session.start_time)}
                      </p>

                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {formatTime(session.end_time)}
                      </p>
                    </div>

                    <div className="min-w-0 flex-1 border-l border-foreground/10 pl-3">
                      <h4 className="font-display text-[15px] font-semibold leading-snug">
                        {subjectName(session.subject_id)}
                      </h4>

                      <p className="mt-1 text-[11px] font-medium text-primary">
                        {session.room || "Room not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-foreground/10 pt-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      What happened in class
                    </p>

                    {isEditing ? (
                      <div className="mt-2">
                        <textarea
                          value={summaryText}
                          onChange={(event) =>
                            setSummaryText(event.target.value)
                          }
                          placeholder="Example: Completed matrices and solved Exercise 2.1..."
                          rows={4}
                          className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-[13px] outline-none focus:ring-2 focus:ring-primary/30"
                        />

                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            disabled={saving}
                            onClick={() => void saveSummary(session.id)}
                            className="rounded-xl bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground disabled:opacity-60"
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>

                          <button
                            type="button"
                            disabled={saving}
                            onClick={cancelEditing}
                            className="rounded-xl bg-card px-3 py-2 text-[12px] font-medium ring-hairline"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-muted-foreground">
                          {record?.summary ||
                            "No class summary has been added yet."}
                        </p>

                        {role === "cr" ? (
                          <button
                            type="button"
                            onClick={() => startEditing(session.id)}
                            className="mt-3 rounded-xl bg-primary/10 px-3 py-2 text-[12px] font-medium text-primary"
                          >
                            {record
                              ? "Edit class summary"
                              : "Add class summary"}
                          </button>
                        ) : null}
                      </>
                    )}
                  </div>
                  <div className="mt-4 border-t border-foreground/10 pt-3">
  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
    Class materials
  </p>

  {record ? (
    <>
      {materials.filter(
        (material) => material.class_record_id === record.id
      ).length === 0 ? (
        <p className="mt-2 text-[12px] text-muted-foreground">
          No PDFs uploaded yet.
        </p>
      ) : (
        <div className="mt-2 space-y-2">
          {materials
            .filter(
              (material) =>
                material.class_record_id === record.id
            )
            .map((material) => (
              <a
                key={material.id}
                href={material.drive_web_link}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-xl bg-card/70 px-3 py-2.5 ring-hairline"
              >
                <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  PDF
                </span>

                <span className="min-w-0 flex-1 truncate text-[12px] font-medium">
                  {material.file_name}
                </span>

                <span className="text-[11px] text-muted-foreground">
                  Open
                </span>
              </a>
            ))}
        </div>
      )}

      {role === "cr" ? (
        <div className="mt-3">
          <label className="inline-flex cursor-pointer items-center rounded-xl bg-primary/10 px-3 py-2 text-[12px] font-medium text-primary">
            {uploadingSessionId === session.id
              ? "Uploading..."
              : "Upload PDF"}

            <input
              type="file"
              accept="application/pdf,.pdf"
              disabled={uploadingSessionId === session.id}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file) {
                  void uploadPdf(session.id, file);
                }

                event.target.value = "";
              }}
            />
          </label>
        </div>
      ) : null}
    </>
  ) : role === "cr" ? (
    <p className="mt-2 text-[12px] text-muted-foreground">
      Save the class summary first to upload PDFs.
    </p>
  ) : (
    <p className="mt-2 text-[12px] text-muted-foreground">
      No PDFs uploaded yet.
    </p>
  )}
</div>
                </SoftCard>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}