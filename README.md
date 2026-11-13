# NIAT GRIT Track Badge Viva Scheduling & Lifecycle Platform
### AI Product Engineer (Round 1 Project Submission)

A production-grade, fullstack interview scheduling and credential lifecycle management platform engineered specifically for the **NIAT GRIT** competition.

---

## 🌟 Key Features Built

1. **Deterministic 7-State Lifecycle Engine:**
   - `SKILLS_IN_PROGRESS` $\to$ `ELIGIBLE_PENDING_BOOKING` $\to$ `SLOT_BOOKED` $\to$ `VIVA_PENDING_EVALUATION` $\to$ `BADGE_AWARDED` / `VIVA_FAILED_RETAKE` $\to$ `BADGE_NULLIFIED_MALPRACTICE`.
2. **Student Self-Booking Experience:**
   - Real-time slot picker with date filters and interviewer profiles.
   - Atomic reservation with concurrency lock to prevent race-condition double bookings.
   - In-app meeting access, defense syllabus checklist, and 1-click rescheduling.
3. **Interviewer Cockpit:**
   - Weekly availability slot publisher.
   - Daily viva roster with candidate dossiers and cleared skill contest benchmarks.
   - Standardized 3-dimensional evaluation rubric (System Design, Problem Solving, Code Hygiene) with Pass, Retake, and Fail outcome processing.
4. **Operations & Interview Team Command Center:**
   - Real-time conversion funnel tracking: **Eligible students who have booked vs. those who haven't**.
   - 1-click **"Send Booking Nudge"** reminder automation.
   - **Post-Award Malpractice Audit & Revocation Engine**: Atomically revokes credentials, displays red disciplinary alerts, and records immutable forensic logs.
5. **Interactive "Before & After" State Simulator:**
   - Built directly into the top of the student dashboard so evaluators can test every lifecycle transformation in 1 click!
6. **The 3 Most Important Student Messages:**
   - Embedded verbatim in modal prompts, notifications, and the top navigation drawer.

---

## 🛠️ Technology Stack

- **Backend & API:** Node.js 22, Express.js REST API
- **Database:** Embedded ACID SQLite 3 (`node:sqlite`) with `schema.sql` foreign-key constraints and transaction isolation
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Documentation:** Engineering RFC memo (`docs/GRIT_INTERVIEW_SYSTEM_RFC.md`) and Loom recording guide (`docs/LOOM_RECORDING_SCRIPT.md`)

---

## 🚀 Quick Start Guide (Run with 1 Command)

### Prerequisites
- Node.js 20+ or 22+ installed.

### Step 1: Start the Server & Database
Run the following command from the project root:

```bash
npm start
```

This starts the unified Express server and SQLite database on **`http://localhost:5000`** (serving both the REST API and the compiled frontend).

### Alternative: Development Mode (Hot Reload)
If you wish to run with Vite hot-reloading:

```bash
# Terminal 1: Backend API (port 5000)
npm run server

# Terminal 2: Frontend Vite (port 5173)
npm run client
```

Open your browser to: **`http://localhost:5000`** (or `http://localhost:5173`).

---

## 📁 Repository Structure

```
├── client/
│   ├── src/
│   │   ├── api/client.ts                     # Typed REST API client
│   │   ├── components/
│   │   │   ├── Navbar.tsx                    # Role switcher & navigation
│   │   │   ├── StudentDashboard.tsx          # Before/After student view & badge seal
│   │   │   ├── SlotBookingModal.tsx          # Interactive booking workflow (Message #1)
│   │   │   ├── InterviewerSchedule.tsx       # Availability manager & daily viva roster
│   │   │   ├── VivaEvaluationModal.tsx       # Rubric evaluation modal (Message #2)
│   │   │   ├── AdminOperationsView.tsx       # Cohort conversion & booked vs unbooked
│   │   │   ├── MalpracticeAuditModal.tsx     # Atomic badge nullification (Message #3)
│   │   │   ├── StudentMessagesShowcase.tsx   # The 3 verbatim student messages
│   │   │   └── ArchitectureDocsDrawer.tsx    # In-app 2-Page RFC viewer
│   │   ├── types/grit.ts                     # TypeScript data contracts
│   │   ├── App.tsx                           # Master application controller
│   │   └── index.css                         # Tailwind CSS & custom animations
│   ├── dist/                                 # Production compiled assets
│   └── package.json
├── server/
│   ├── db.js                                 # SQLite ACID connection & transaction wrapper
│   ├── schema.sql                            # Relational schema DDL & indexes
│   ├── seed.js                               # Realistic NIAT GRIT seed data
│   └── index.js                              # Express REST API routes & static server
├── docs/
│   ├── GRIT_INTERVIEW_SYSTEM_RFC.md          # Official 2-Page Architectural RFC
│   └── LOOM_RECORDING_SCRIPT.md              # 4-Minute Loom video recording script
├── package.json
└── README.md
```

---

## 👥 Personas Included for Demo Testing

You can switch between any of these test personas instantly using the top bar:

| Role | Name | Status | What to Observe |
|---|---|---|---|
| **Student (Eligible)** | Rahul Verma | `ELIGIBLE_PENDING_BOOKING` | Cleared 5/5 skills. Ready to book viva slot. |
| **Student (Booked)** | Ananya Sen | `SLOT_BOOKED` | Viva booked with Priya Sharma. Live Google Meet link & countdown. |
| **Student (Passed)** | Karthik Nair | `BADGE_AWARDED` | Verified Track Badge, Credential `GRIT-2026-FS-84920`, Rubric 4.7/5. |
| **Student (Retake)** | Sneha Rao | `VIVA_FAILED_RETAKE` | Rubric feedback gaps, active 10-day cooling-off countdown until Nov 20. |
| **Student (Nullified)**| Vikram Malhotra | `BADGE_NULLIFIED` | Badge stamped VOID, high-priority malpractice alert banner. |
| **Student (In Progress)**| Rohit Sharma | `SKILLS_IN_PROGRESS` | Cleared 3/5 skills. Viva booking locked. |
| **Interviewer** | Priya Sharma | Staff Software Engineer | Manage availability slots, evaluate candidates via rubric. |
| **Operations Admin** | Rajesh Kumar | Head of GRIT Operations | View booked vs. unbooked funnel, send nudges, flag malpractice. |

---

## 📝 Assignment Deliverables Mapping

| Required Deliverable | Location in this Repository |
|---|---|
| **1. 2-Page Write-up (States, Edge Cases, Data Model)** | [GRIT_INTERVIEW_SYSTEM_RFC.md](file:///c:/Users/mahes/Nxtwave%20Assignment/docs/GRIT_INTERVIEW_SYSTEM_RFC.md) *(also clickable inside the app)* |
| **2. Working Prototype** | Run `npm start` $\to$ browse `http://localhost:5000` |
| **3. The 3 Most Important Student Messages** | In [GRIT_INTERVIEW_SYSTEM_RFC.md](file:///c:/Users/mahes/Nxtwave%20Assignment/docs/GRIT_INTERVIEW_SYSTEM_RFC.md#4-the-3-most-important-student-messages-written-verbatim) & in-app via "3 Student Messages" |
| **4. Before & After Screens** | Built into Student Dashboard with 1-click state switcher |
| **5. Loom Recording Guide & Script** | [LOOM_RECORDING_SCRIPT.md](file:///c:/Users/mahes/Nxtwave%20Assignment/docs/LOOM_RECORDING_SCRIPT.md) |

