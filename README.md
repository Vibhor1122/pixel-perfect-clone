# 🎓 Campusly

> **One campus. One platform.**

Campusly is a centralized academic management and communication platform designed to simplify everyday college life for **students, Class Representatives (CRs), and administrators**.

Instead of relying on scattered WhatsApp groups, spreadsheets, PDFs, and separate tools for attendance, timetables, announcements, and study material, Campusly brings essential academic activities together in one platform.

---

## 🚀 The Problem

College information is often fragmented across multiple platforms:

- 📱 Announcements get lost in WhatsApp groups
- 📊 Attendance is maintained separately
- 📅 Timetables and schedule changes are difficult to track
- 📚 Notes and PDFs are scattered across chats and drives
- 📝 Students lack a centralized record of daily class activity
- 👥 Different users require different levels of access

Campusly was built to solve this fragmentation.

---

## 💡 Our Solution

Campusly provides a single role-based platform where academic information can be created, managed, and accessed by the right users.

Students get a simple academic dashboard, while CRs and administrators receive additional tools based on their responsibilities.

---

# 🔑 Demo Login Credentials

Hackathon judges can use the following accounts to explore the different role-based experiences of Campusly.

### 🛡️ Admin

**Email:** `Vibhornarang12@gmail.com`  
**Password:** `Vibhor@2008`

Use this account to explore:
- Admin Dashboard
- User account creation
- Subject management
- Announcement management
- Administrative controls

### 👤 Class Representative (CR)

**Email:** `amanta47395@gmail.com`  
**Password:** `VIbhor@2008`

Use this account to explore:
- CR functionality
- Attendance marking
- Timetable management
- Class activities
- Academic material uploads

### 👨‍🎓 Student

**Email:** `narangvibhor61@gmail.com`  
**Password:** `Vibhor@2008`

Use this account to explore:
- Student Dashboard
- Academic calendar
- Attendance percentages
- Timetable
- Subjects and study material
- Announcements

> **Note:** These accounts are provided for hackathon evaluation and demonstration.

---

# ✨ Features

## 👨‍🎓 Student

Students can:

- View their academic dashboard
- Use an interactive monthly calendar
- View classes scheduled for a selected date
- Access subject information
- Access class summaries and study material
- Open uploaded PDF resources
- View subject-wise attendance percentages
- View overall attendance
- View their timetable
- Read college/class announcements
- Access class communication features

---

## 👤 Class Representative (CR)

CRs receive additional academic management capabilities.

They can:

- Mark student attendance
- Select subjects while recording attendance
- Manage timetable entries for their class
- Add class information
- Upload academic PDFs/materials
- Access student-facing academic features
- Participate in class communication

Attendance submitted through Campusly is recorded in a structured **Google Sheet**.

---

## 🛡️ Admin

The Admin Dashboard provides centralized management capabilities.

Admins can:

- Create authorized user accounts
- Create CR accounts
- Manage subjects
- Create and manage announcements
- Control important application settings
- Enable or disable class communication

---

# 📅 Interactive Academic Calendar

Campusly's calendar connects dates with actual academic activity.

Students can select a date and view:

- Classes scheduled that day
- Subject information
- Class summaries
- Available study material
- Uploaded PDFs

This creates an organized timeline of academic activity instead of information being lost in chat messages.

---

# 📊 Attendance System

Campusly provides separate attendance experiences for students and CRs.

### CR

CRs can mark students as present or absent through the Campusly interface.

### Student

Students can see:

- Subject-wise attendance percentage
- Overall attendance percentage

Students cannot modify attendance records.

### Attendance Storage

Attendance records are backed using **Google Sheets + Google Apps Script**, providing a structured and accessible record outside the primary application database.

---

# 📚 Study Materials

Academic PDFs can be uploaded through Campusly and stored using **Google Drive**.

Campusly stores the relevant metadata and connects uploaded resources with the appropriate academic activity.

Students can then access these resources directly through Campusly.

---

# 📢 Announcements

Campusly includes a centralized announcement system.

Administrators can publish announcements which are displayed to relevant users.

Important announcements can appear directly on the student's home dashboard, with a dedicated page available for viewing additional announcements.

---

# 🔐 Role-Based Access

Campusly currently uses three primary roles:

| Role | Main Purpose |
|------|--------------|
| Student | Access academic information |
| CR | Manage class-level academic activity |
| Admin | Platform administration |

Authentication and application data are handled using **Supabase**.

Database-level **Row Level Security (RLS)** policies are used where applicable to restrict access according to the authenticated user's permissions.

---

# 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- TanStack Start
- Tailwind CSS
- Vite

### Backend & Database

- Supabase
- Supabase Authentication
- PostgreSQL
- Row Level Security (RLS)

### Integrations

- Google Drive API
- Google Sheets
- Google Apps Script

### Deployment

- Vercel

### Development

- Git
- GitHub
- VS Code

---

# 🏗️ Architecture

```text
                    ┌─────────────────┐
                    │    Campusly     │
                    │ React / TanStack│
                    └────────┬────────┘
                             │
             ┌───────────────┼───────────────┐
             │               │               │
             ▼               ▼               ▼
        ┌─────────┐    ┌────────────┐   ┌─────────────┐
        │Supabase │    │Google Drive│   │Google Sheets│
        │         │    │            │   │+ Apps Script│
        └─────────┘    └────────────┘   └─────────────┘
             │               │               │
        Authentication    PDF/Material    Attendance
        Database          Storage         Records
        RLS
```

---

# 🔄 How Campusly Works

```text
Admin
  │
  ├── Creates authorized accounts
  ├── Manages subjects
  └── Publishes announcements

CR
  │
  ├── Marks attendance
  ├── Manages timetable
  └── Adds academic information/materials

                 ↓

             CAMPUSLY

                 ↓

Student
  │
  ├── Views calendar & classes
  ├── Checks attendance
  ├── Views timetable
  ├── Accesses study material
  └── Reads announcements
```

---

# ⚙️ Running Locally

## 1. Clone the repository

```bash
git clone https://github.com/Vibhor1122/pixel-perfect-clone.git
cd pixel-perfect-clone
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_ATTENDANCE_API_URL=your_google_apps_script_url
```

> Never commit your actual `.env` file or private API credentials to GitHub.

## 4. Start the Development Server

```bash
npm run dev
```

Open the local URL displayed in the terminal.

---

# 🏭 Production Build

Create a production build using:

```bash
npm run build
```

---

# 🌐 Deployment

Campusly is deployed using **Vercel**.

The GitHub repository is connected to Vercel, allowing new production deployments to be created from repository updates.

---

# 🔮 Future Scope

Campusly can be expanded with:

- Real-time class chat
- Push notifications
- Assignment submission
- Examination management
- Marks and result tracking
- Academic analytics
- Installable PWA/mobile experience
- Additional college administration tools

---

# 🎯 Vision

Campusly aims to replace fragmented academic communication with one organized platform.

Instead of students, CRs, and administrators depending on multiple disconnected tools, Campusly provides a foundation for managing everyday academic life from a single place.

### **One Campus. One Platform. Campusly.**

---

## 👨‍💻 Built By

**Vibhor Narang**

Built as a student hackathon project with the goal of making campus academic management simpler, centralized, and more accessible.
