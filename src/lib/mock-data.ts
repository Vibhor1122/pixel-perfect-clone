// Static demo content for the UI. No backend yet.

export type Role = "admin" | "teacher" | "cr" | "student";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  teacher: "Teacher",
  cr: "Class Representative",
  student: "Student",
};

export const COLLEGE_NAME = "Campusly";
export const APP_NAME = "Campusly";

export type AnnouncementKind =
  | "holiday"
  | "cancelled"
  | "exam"
  | "assignment"
  | "room";

export type Announcement = {
  id: string;
  kind: AnnouncementKind;
  from: string;
  title: string;
  body: string;
  date: string; // yyyy-mm-dd
  when: string;
};

export const ANNOUNCEMENT_KIND_LABEL: Record<AnnouncementKind, string> = {
  holiday: "College holiday",
  cancelled: "Class cancelled",
  exam: "Exam",
  assignment: "Assignment",
  room: "Room change",
};

export type ClassSession = {
  id: string;
  subject: string;
  subjectId: string;
  start: string;
  end: string;
  topic: string;
  room: string;
  teacher: string;
  notes: { id: string; title: string; size: string }[];
};

export type Subject = {
  id: string;
  name: string;
  code: string;
  teacher: string;
  attendance: number;
  material: { id: string; title: string; date: string }[];
};

export const SUBJECTS: Subject[] = [
  {
    id: "math",
    name: "Engineering Mathematics",
    code: "MA-201",
    teacher: "Dr. Anita Rao",
    attendance: 86,
    material: [
      { id: "m1", title: "Matrices and Eigenvalues.pdf", date: "12 Nov" },
      { id: "m2", title: "Linear Transformations.pdf", date: "08 Nov" },
      { id: "m3", title: "Tutorial Sheet 4.pdf", date: "03 Nov" },
    ],
  },
  {
    id: "physics",
    name: "Physics",
    code: "PH-104",
    teacher: "Prof. Vikram Iyer",
    attendance: 74,
    material: [
      { id: "m4", title: "Wave Optics Notes.pdf", date: "11 Nov" },
      { id: "m5", title: "Lab Manual - Experiment 6.pdf", date: "05 Nov" },
    ],
  },
  {
    id: "python",
    name: "Python Programming",
    code: "CS-210",
    teacher: "Ms. Leena Fernandes",
    attendance: 91,
    material: [
      { id: "m6", title: "Inheritance and Polymorphism.pdf", date: "12 Nov" },
      { id: "m7", title: "Practice Problems Set 3.pdf", date: "09 Nov" },
    ],
  },
  {
    id: "chem",
    name: "Chemistry",
    code: "CH-102",
    teacher: "Dr. Sanjay Menon",
    attendance: 79,
    material: [{ id: "m8", title: "Organic Reactions.pdf", date: "07 Nov" }],
  },
  {
    id: "english",
    name: "English",
    code: "HS-101",
    teacher: "Ms. Priya Nair",
    attendance: 88,
    material: [{ id: "m9", title: "Technical Writing Guide.pdf", date: "06 Nov" }],
  },
];

export const OVERALL_ATTENDANCE = 82;

export type TimetableEntry = {
  id: string;
  day: string;
  subject: string;
  start: string;
  end: string;
  room: string;
  teacher: string;
};

export const TIMETABLE: TimetableEntry[] = [
  { id: "t1", day: "Monday", subject: "Engineering Mathematics", start: "10:00 AM", end: "11:00 AM", room: "Room B-204", teacher: "Dr. Anita Rao" },
  { id: "t2", day: "Monday", subject: "Python Programming", start: "11:00 AM", end: "12:00 PM", room: "Lab 3", teacher: "Ms. Leena Fernandes" },
  { id: "t3", day: "Monday", subject: "Chemistry", start: "02:00 PM", end: "03:00 PM", room: "Room C-110", teacher: "Dr. Sanjay Menon" },
  { id: "t4", day: "Tuesday", subject: "Physics", start: "09:00 AM", end: "10:00 AM", room: "Room A-101", teacher: "Prof. Vikram Iyer" },
  { id: "t5", day: "Tuesday", subject: "English", start: "10:00 AM", end: "11:00 AM", room: "Room A-105", teacher: "Ms. Priya Nair" },
  { id: "t6", day: "Wednesday", subject: "Engineering Mathematics", start: "10:00 AM", end: "11:00 AM", room: "Room B-204", teacher: "Dr. Anita Rao" },
  { id: "t7", day: "Wednesday", subject: "Physics Lab", start: "02:00 PM", end: "04:00 PM", room: "Physics Lab", teacher: "Prof. Vikram Iyer" },
  { id: "t8", day: "Thursday", subject: "Python Programming", start: "11:00 AM", end: "12:00 PM", room: "Lab 3", teacher: "Ms. Leena Fernandes" },
  { id: "t9", day: "Thursday", subject: "Chemistry", start: "12:00 PM", end: "01:00 PM", room: "Room C-110", teacher: "Dr. Sanjay Menon" },
  { id: "t10", day: "Friday", subject: "English", start: "09:00 AM", end: "10:00 AM", room: "Room A-105", teacher: "Ms. Priya Nair" },
  { id: "t11", day: "Friday", subject: "Engineering Mathematics", start: "11:00 AM", end: "12:00 PM", room: "Room B-204", teacher: "Dr. Anita Rao" },
];

export const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export type ChatMessage = {
  id: string;
  name: string;
  initials: string;
  message: string;
  time: string;
  own?: boolean;
};

export const CHAT_MESSAGES: ChatMessage[] = [
  { id: "c1", name: "Sana Qureshi", initials: "SQ", message: "Has anyone got the Physics lab manual for experiment 6?", time: "09:12 AM" },
  { id: "c2", name: "Rohit Shetty", initials: "RS", message: "Yes, it was shared in Subjects → Physics yesterday.", time: "09:15 AM" },
  { id: "c3", name: "Aarav Mehta", initials: "AM", message: "Thanks! Also Maths class today is in B-204, not B-210.", time: "09:21 AM", own: true },
  { id: "c4", name: "Nikita Bose", initials: "NB", message: "Noted. CR already posted the room change announcement.", time: "09:24 AM" },
  { id: "c5", name: "Sana Qureshi", initials: "SQ", message: "Python assignment is due Friday 5 PM, don't forget.", time: "09:30 AM" },
];

export type Student = { id: string; name: string; roll: string };

export const CLASS_STUDENTS: Student[] = [
  { id: "s1", name: "Aarav Mehta", roll: "CS21B001" },
  { id: "s2", name: "Nikita Bose", roll: "CS21B002" },
  { id: "s3", name: "Rohit Shetty", roll: "CS21B003" },
  { id: "s4", name: "Sana Qureshi", roll: "CS21B004" },
  { id: "s5", name: "Imran Khalid", roll: "CS21B005" },
  { id: "s6", name: "Divya Pillai", roll: "CS21B006" },
  { id: "s7", name: "Karan Joshi", roll: "CS21B007" },
  { id: "s8", name: "Meera Suresh", roll: "CS21B008" },
];

export const COURSES = [
  "B.Tech Computer Science",
  "B.Tech Electronics",
  "B.Tech Mechanical",
  "B.Sc Physics",
  "BBA",
];
export const SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"];
export const SECTIONS = ["A", "B", "C", "D"];

export const CURRENT_USER = {
  name: "Aarav Mehta",
  initials: "AM",
  roll: "CS21B001",
  course: "Computer Science",
  semester: "5",
  section: "B",
  email: "aarav.mehta@kestrel.edu",
};

const ANN_BASE: Omit<Announcement, "date">[] = [
  { id: "a1", kind: "exam", from: "Examination Cell", title: "Mid-semester exam timetable published", body: "Semester 5 schedule is on the notice board. Report clashes by Monday.", when: "2h ago" },
  { id: "a2", kind: "assignment", from: "Ms. Leena Fernandes", title: "Python assignment 3 deadline", body: "Submit the inheritance exercise before Friday, 5:00 PM.", when: "5h ago" },
  { id: "a3", kind: "room", from: "Class Representative", title: "Room change for Engineering Mathematics", body: "Today's 10:00 AM class moves from B-210 to B-204.", when: "Yesterday" },
  { id: "a4", kind: "cancelled", from: "Prof. Vikram Iyer", title: "Physics class cancelled", body: "Thursday's 09:00 AM lecture is cancelled. A make-up class will follow.", when: "Yesterday" },
  { id: "a5", kind: "holiday", from: "Dean of Academics", title: "College holiday announced", body: "The campus remains closed for the founders' day celebration.", when: "2 days ago" },
];

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Announcements anchored around today so the calendar always has markers. */
export function getAnnouncements(today = new Date()): Announcement[] {
  const offsets = [0, 0, -1, 2, 5];
  return ANN_BASE.map((a, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsets[i]!);
    return { ...a, date: iso(d) };
  });
}

const SESSION_TEMPLATES: Omit<ClassSession, "id">[] = [
  {
    subject: "Engineering Mathematics",
    subjectId: "math",
    start: "10:00 AM",
    end: "11:00 AM",
    topic: "Matrices and Eigenvalues",
    room: "Room B-204",
    teacher: "Dr. Anita Rao",
    notes: [
      { id: "n1", title: "Matrices and Eigenvalues.pdf", size: "2.1 MB" },
      { id: "n2", title: "Tutorial Sheet 4.pdf", size: "640 KB" },
    ],
  },
  {
    subject: "Python Programming",
    subjectId: "python",
    start: "11:00 AM",
    end: "12:00 PM",
    topic: "Inheritance and Polymorphism",
    room: "Lab 3",
    teacher: "Ms. Leena Fernandes",
    notes: [
      { id: "n3", title: "Inheritance and Polymorphism.pdf", size: "1.4 MB" },
      { id: "n4", title: "Practice Problems Set 3.pdf", size: "820 KB" },
      { id: "n5", title: "Lab Starter Code.pdf", size: "310 KB" },
    ],
  },
  {
    subject: "Chemistry",
    subjectId: "chem",
    start: "02:00 PM",
    end: "03:00 PM",
    topic: "Organic Reaction Mechanisms",
    room: "Room C-110",
    teacher: "Dr. Sanjay Menon",
    notes: [{ id: "n6", title: "Organic Reactions.pdf", size: "3.0 MB" }],
  },
  {
    subject: "Physics",
    subjectId: "physics",
    start: "09:00 AM",
    end: "10:00 AM",
    topic: "Wave Optics and Interference",
    room: "Room A-101",
    teacher: "Prof. Vikram Iyer",
    notes: [{ id: "n7", title: "Wave Optics Notes.pdf", size: "1.8 MB" }],
  },
  {
    subject: "English",
    subjectId: "english",
    start: "10:00 AM",
    end: "11:00 AM",
    topic: "Technical Report Writing",
    room: "Room A-105",
    teacher: "Ms. Priya Nair",
    notes: [{ id: "n8", title: "Technical Writing Guide.pdf", size: "900 KB" }],
  },
];

/** Deterministic class list for a given date string (yyyy-mm-dd). */
export function getSessionsForDate(date: string): ClassSession[] {
  const day = new Date(`${date}T00:00:00`).getDay();
  if (day === 0) return [];
  const picks =
    day % 2 === 0 ? [3, 4, 1] : day === 1 ? [0, 1, 2] : [0, 2, 4];
  return picks.map((p, i) => ({ ...SESSION_TEMPLATES[p]!, id: `${date}-${i}` }));
}

export function hasContent(date: string): boolean {
  return getSessionsForDate(date).length > 0;
}
