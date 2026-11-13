# GRIT Track Badge Viva Scheduling & Lifecycle System
## AI Product Architecture RFC & Specification (Round 1 Project)

**Author:** AI Product Engineer Candidate  
**Target Organization:** NIAT (NextWave Institute of Advanced Technologies)  
**System Scope:** Student Viva Self-Booking, AI Codebase Pre-Defense Diagnostic, Interviewer Copilot & Rubric Synthesis, AI Forensic AST Plagiarism Radar, and Cohort Drop-Off Analytics  
**Version:** 2.0.0 (AI-Augmented Architecture)  
**Stack:** React 18, TypeScript, Tailwind CSS, Node.js 22, Embedded ACID SQLite 3, Express REST Engine, AST Parsing & Heuristic AI Engine  

---

### Executive Summary

In the year-long **NIAT GRIT** competition, engineering students clear benchmark skill contests across specialized tracks (e.g., *Full Stack Web Engineering*, *Applied AI Systems*). Once all required skill contests are cleared, students take a live, 45-minute technical viva defense to earn their accredited **Track Badge**. 

Generic scheduling software treats this problem as simple calendar slots. As an **AI Product Engineer**, this platform designs an intelligent, end-to-end ecosystem that addresses four fundamental bottlenecks:
1. **The Preparation Gap (Student):** Students are anxious and unaware of what panelists will interrogate. We introduce the **GRIT AI Viva Coach & Code Auditor**, performing AST analysis on the student's contest code to predict panel defense probes and provide interactive model answers.
2. **The Panel Fatigue Gap (Interviewer):** Staff interviewers lack time to review repos thoroughly before viva sessions. We introduce the **Interviewer AI Copilot**, generating live probe questions from candidate code diffs and auto-synthesizing standardized rubric feedback in 1 click.
3. **The Academic Integrity Gap (Malpractice):** Per the GRIT assignment: *"Their badge gets nullified if the student was caught doing malpractice and got flagged later."* We introduce the **AI Forensic AST Plagiarism Radar**, detecting code similarity ($>85\%$ AST token overlap) against external leaks and driving atomic, auditable credential nullifications.
4. **The Conversion Drop-off Gap (Operations):** AI cohort funnel tracking with automated smart nudges targeting eligible candidates who haven't booked.

---

### 1. Student Interview Journey & Deterministic State Machine

A student's enrollment moves through seven deterministic states. State transitions are strictly guarded by transactional database constraints to eliminate invalid jumps or double bookings.

```
       [ SKILLS_IN_PROGRESS ]
                 │
                 ▼  (Cleared all 5/5 Track Skill Contests)
     [ ELIGIBLE_PENDING_BOOKING ] ◄──────────────┐ (Slot Cancelled >= 6h)
                 │                               │
                 ▼  (Atomic Slot Reservation)   │
           [ SLOT_BOOKED ] ──────────────────────┘
                 │
                 ▼  (Interviewer Launches Viva & Records Rubric)
        ┌────────┴───────────────────────────┐
        ▼ (Pass: Rubric >= 3.5)              ▼ (Retake Later: Rubric < 3.5)
   [ BADGE_AWARDED ]                [ VIVA_FAILED_RETAKE ]
        │                                    │
        ▼ (AI Forensic Post-Award Audit)     ▼ (10-Day Cooldown Elapsed)
 [ BADGE_NULLIFIED_MALPRACTICE ]     [ ELIGIBLE_PENDING_BOOKING ]
```

#### Deterministic State Transition Matrix

| # | Current State | Trigger / Event | Guard Condition | Next State | Automated System Actions |
|---|---|---|---|---|---|
| **S1** | `SKILLS_IN_PROGRESS` | `CONTEST_CLEARED` | `cleared_count == total_required` (5/5) | `ELIGIBLE_PENDING_BOOKING` | Sets `is_eligible = 1`; unlocks slot picker; triggers AI Pre-Viva Diagnostic pipeline; pushes candidate into operations funnel. |
| **S2** | `ELIGIBLE_PENDING_BOOKING` | `SLOT_RESERVED` | Slot `status == 'AVAILABLE'` & Cooldown expired | `SLOT_BOOKED` | Executes atomic `BEGIN TRANSACTION`; locks slot; mints `interview_bookings` record; emits **Student Message #1**. |
| **S3** | `SLOT_BOOKED` | `STUDENT_CANCELLED` | `now < (slot_time - 6 hours)` | `ELIGIBLE_PENDING_BOOKING` | Releases slot back to `'AVAILABLE'`; frees interviewer calendar. |
| **S4** | `SLOT_BOOKED` | `VIVA_EVALUATED` (Outcome: `PASS`) | Evaluator score $\ge 3.5 / 5.0$ | `BADGE_AWARDED` | Mints unique public credential ID (`GRIT-2026-FS-XXXXX`); mints verifiable certificate; emits **Student Message #2 (Pass)**. |
| **S5** | `SLOT_BOOKED` | `VIVA_EVALUATED` (Outcome: `RETAKE_LATER`) | Evaluator score $< 3.5 / 5.0$ | `VIVA_FAILED_RETAKE` | Enforces 10-day cooling-off timestamp (`retake_cooling_until`); publishes AI-assisted rubric feedback; emits **Student Message #2 (Retake)**. |
| **S6** | `VIVA_FAILED_RETAKE` | `COOLDOWN_EXPIRED` | `now >= retake_cooling_until` | `ELIGIBLE_PENDING_BOOKING` | Automatically unlocks booking calendar; re-enables slot selection. |
| **S7** | `BADGE_AWARDED` | `MALPRACTICE_FLAGGED` | AI AST similarity $> 85\%$ or proctoring breach | `BADGE_NULLIFIED_MALPRACTICE` | **Atomically revokes credential ID**; logs immutable entry in `malpractice_audit_logs`; displays red disciplinary alert (**Student Message #3**); blocks future track bookings. |

---

### 2. AI Product Engineering Innovations

#### A. GRIT AI Pre-Viva Coach & Code Auditor (Candidate Preparation)
* **Problem:** Students clearing contests often struggle in live architectural defense because contest testing is automated, whereas viva evaluates trade-offs, concurrency, and failure recovery.
* **AI Solution:** An automated AST code parser analyzes the candidate's actual repo (e.g., `WalletService.TransferFunds` in Contest #4). It flags architectural vulnerabilities (e.g., non-deterministic lock ordering leading to deadlocks) and generates predicted panel defense probes with AI model defense strategies.

#### B. Interviewer AI Copilot & Speech-to-Rubric Synthesis (Panel Efficiency)
* **Problem:** Panels interview 6–8 candidates daily. Reviewing each candidate's code beforehand leads to panel cognitive overload and inconsistent written feedback.
* **AI Solution:** 
  1. Generates 3 bespoke defense questions from the candidate's repository diffs with expected technical keywords (`SELECT FOR UPDATE`, `Deterministic Sorting`, `Idempotency Token`).
  2. One-click **"AI Auto-Draft Feedback"** that synthesizes raw panel observations into constructive, rubric-aligned feedback.

#### C. AI Forensic AST Plagiarism & Code Similarity Radar (Malpractice Protection)
* **Problem:** Sophisticated plagiarism involves variable renaming and function reordering, bypassing basic string diffs.
* **AI Solution:** Computes Abstract Syntax Tree (AST) tree distance, token stream entropy, and commit timestamp clustering against external leaks. When a $>85\%$ match is detected, the system generates an automated forensic evidence memo and allows NIAT Ops to atomically void the credential.

---

### 3. Edge Cases, Failure Modes & Engineering Assumptions

| Edge Case Scenario | Failure Risk | Architectural Mitigation & Resolution |
|---|---|---|
| **1. Concurrent Slot Collision (Race Condition)** | Two eligible students attempt to book the exact same 10:00 AM slot at the identical millisecond. | **Mitigation:** The database enforces a `UNIQUE(slot_id)` constraint on `interview_bookings`. The booking handler runs inside an atomic `BEGIN TRANSACTION` block. The second concurrent query fails immediately with a clean 400 error. |
| **2. Post-Award Malpractice Detection** | A student passes viva and receives their badge, but days later NIAT's background AST code plagiarism pipeline flags Contest #4 submission as copied. | **Mitigation:** A dedicated `malpractice_audit_logs` subsystem allows NIAT Ops to execute an atomic revocation. This wipes credential validity, logs forensic evidence notes, and changes the student's dashboard to a prominent disciplinary banner (**Student Message #3**). |
| **3. Compulsive Retake Re-booking** | A candidate failing viva immediately reserves another slot the following morning without addressing skill gaps, wasting scarce panel bandwidth. | **Mitigation:** Enforced 10-day preparation cooldown (`retake_cooling_until`). The booking calendar is hard-locked until the cooldown timestamp elapses, with the UI displaying the interviewer's rubric recommendations. |
| **4. Late Cancellations & No-Shows** | Candidate drops out minutes prior to viva, leaving the interviewer idle. | **Mitigation:** Self-service cancellation is permitted only up to 6 hours before the appointment. Cancellations within 6 hours or unexcused no-shows flag the candidate for manual ops review. |
| **5. Interviewer Unavailability / Drop-out** | An interviewer experiences an emergency and cancels their block of slots. | **Mitigation:** Affected bookings revert to `ELIGIBLE_PENDING_BOOKING` with a high-priority tag, and automated notification emails invite the candidates to select from emergency overflow slots. |
| **6. Stale Eligibility Drop-Off** | Students clear 5/5 skills but abandon the platform without booking a viva. | **Mitigation:** NIAT Ops Dashboard features an **"Eligible Unbooked"** view with a 1-click **"AI Booking Nudge"** action, tracking reminder timestamps in `last_nudged_at`. |

---

### 4. Relational Data Model & Key Schema DDL

The database is built on an ACID relational architecture (`SQLite 3` / `PostgreSQL`) ensuring foreign-key integrity, transactional locking, and auditability.

```sql
-- 1. Track Enrollments (The Lifecycle State Machine)
CREATE TABLE student_track_enrollments (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    cleared_skills_count INTEGER NOT NULL DEFAULT 0,
    is_eligible INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'SKILLS_IN_PROGRESS' CHECK(
        status IN (
            'SKILLS_IN_PROGRESS', 'ELIGIBLE_PENDING_BOOKING', 'SLOT_BOOKED',
            'VIVA_PENDING_EVALUATION', 'BADGE_AWARDED',
            'VIVA_FAILED_RETAKE', 'BADGE_NULLIFIED_MALPRACTICE'
        )
    ),
    badge_credential_id TEXT UNIQUE,
    badge_awarded_at DATETIME,
    badge_nullified_at DATETIME,
    nullification_reason TEXT,
    retake_cooling_until DATETIME,
    last_nudged_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, track_id)
);

-- 2. Interviewer Availability Slots
CREATE TABLE interviewer_slots (
    id TEXT PRIMARY KEY,
    interviewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    slot_date TEXT NOT NULL,          -- Format: YYYY-MM-DD
    start_time TEXT NOT NULL,         -- Format: HH:MM AM/PM
    end_time TEXT NOT NULL,
    meeting_link TEXT NOT NULL DEFAULT 'https://meet.niatindia.com/grit-viva-room',
    status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK(status IN ('AVAILABLE', 'BOOKED', 'CANCELLED', 'COMPLETED')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Confirmed Interview Bookings (Strict 1:1 slot lock)
CREATE TABLE interview_bookings (
    id TEXT PRIMARY KEY,
    slot_id TEXT UNIQUE NOT NULL REFERENCES interviewer_slots(id) ON DELETE RESTRICT,
    enrollment_id TEXT NOT NULL REFERENCES student_track_enrollments(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interviewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK(status IN ('CONFIRMED', 'COMPLETED', 'STUDENT_NO_SHOW', 'CANCELLED')),
    cancellation_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Standardized Evaluation Rubric Records
CREATE TABLE interview_evaluations (
    id TEXT PRIMARY KEY,
    booking_id TEXT UNIQUE NOT NULL REFERENCES interview_bookings(id) ON DELETE CASCADE,
    interviewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    outcome TEXT NOT NULL CHECK(outcome IN ('PASS', 'RETAKE_LATER', 'FAIL_UNFIT')),
    score_system_design INTEGER NOT NULL CHECK(score_system_design BETWEEN 1 AND 5),
    score_problem_solving INTEGER NOT NULL CHECK(score_problem_solving BETWEEN 1 AND 5),
    score_code_quality INTEGER NOT NULL CHECK(score_code_quality BETWEEN 1 AND 5),
    rubric_feedback TEXT NOT NULL,
    internal_ops_notes TEXT,
    evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Forensic Malpractice Audit Trail
CREATE TABLE malpractice_audit_logs (
    id TEXT PRIMARY KEY,
    enrollment_id TEXT NOT NULL REFERENCES student_track_enrollments(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    flagged_by_admin_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    violation_type TEXT NOT NULL,
    evidence_summary TEXT NOT NULL,
    revoked_credential_id TEXT NOT NULL,
    flagged_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### 5. The 3 Most Important Student Messages (Written Verbatim)

#### Message 1: Viva Booking Confirmation & Preparation Guidelines
* **Trigger:** Instantly upon selecting and confirming an open slot.
* **Channels:** Modal receipt + Transactional Email + Dashboard Banner.
```text
🎯 Your GRIT Track Badge Viva is Confirmed!

Hi Rahul,

Congratulations on clearing all 5 prerequisite skill contests for the Full Stack Web Engineering Track! Your final viva interview has been scheduled with Priya Sharma (Staff Engineer @ NIAT).

📅 Date: Friday, November 13, 2026
⏰ Time: 10:00 AM – 10:45 AM IST (45 mins)
📍 Interview Link: https://meet.niatindia.com/viva-priya-101
📋 Evaluator Focus: System Design, Frontend Architecture, RDBMS Concurrency & Live Code Defense.

Important Guidelines:
1. Join via a laptop with webcam and microphone enabled in a quiet room.
2. Have your Contest #4 submission repository open for architectural defense.
3. Rescheduling is permitted up to 6 hours before the slot.

Best of luck! Let's earn that Track Badge.
```

---

#### Message 2: Evaluation Outcome & Performance Rubric
* **Trigger:** Instantly when the interviewer submits the rubric.
* **Channels:** Student Dashboard Dossier & Result Notification.

```text
--- [VARIANT A: PASS OUTCOME] ---
🎉 Congratulations Karthik! You have officially cleared the Track Badge Viva!

Your interviewer Priya Sharma has accredited your technical defense with an overall rubric rating of 4.7 / 5.0.
• System Design: 5/5
• Problem Solving: 5/5
• Code Quality: 4/5

Interviewer Feedback:
"Exemplary viva performance. Karthik demonstrated deep intuition on distributed cache invalidation strategies and concurrency isolation in PostgreSQL. Code organization in React was modular and clean."

Your digital credential has been minted:
Credential ID: GRIT-2026-FS-84920
View & verify your badge on your NIAT Profile or export to LinkedIn.

--- [VARIANT B: RETAKE LATER OUTCOME] ---
📘 Viva Evaluation: Retake Recommended

Hi Sneha,
Thank you for appearing for the Full Stack Track Viva. The evaluation panel recommended additional preparation before issuing your badge.

Interviewer Feedback:
"Good baseline problem-solving, but struggled to explain database connection pooling and resolving state race conditions. Review database isolation levels and asynchronous locks."

Next Steps:
A 10-day preparation cooldown is active until Nov 20, 2026. Review the recommended NIAT System Design modules. Your booking portal will automatically unlock on Nov 21, 2026.
```

---

#### Message 3: Academic Integrity Violation & Badge Nullification Alert
* **Trigger:** When NIAT Operations flags a candidate for malpractice post-award.
* **Channels:** Urgent Red Alert Banner on Dashboard + Official Registrar Email.
```text
⚠️ URGENT: Academic Integrity Violation & Track Badge Revocation

Dear Vikram Malhotra (Roll No: NIAT23CS0330),

This is an official communication from the NIAT GRIT Academic Integrity Committee.

Following a routine post-evaluation audit of your Contest #4 (Database Concurrency) submission, the automated AST similarity pipeline flagged an unauthorized similarity index of 94.2% against an uncredited external codebase. A manual forensic review by our engineering audit board confirmed the violation.

As per the GRIT Code of Honor:
1. Track Badge (Credential ID: GRIT-2026-FS-77104) has been permanently nullified.
2. Your student dashboard status has been updated to BADGE NULLIFIED (MALPRACTICE).
3. All pending interview privileges for this track are indefinitely suspended.

Right to Appeal:
If you believe this determination was made in error, you may file a formal petition with complete git commit logs and proof of authorship within 5 working days by replying to integrity-committee@niatindia.com.

NIAT Academic Integrity Board
```

---

### 6. Before and After Screens: Student Dashboard Evolution

| Lifecycle Stage | Screen Appearance & Visual Hierarchy | Core Action Call-to-Action |
|---|---|---|
| **Before Viva (Eligible)** | • Glowing amber banner announcing 5/5 skills cleared.<br>• Track Badge is displayed in *Unlocked (Pending Defense)* state.<br>• Prominent slot booking widget and **AI Pre-Viva Coach** button. | **"Book Interview Slot"** & **"Launch AI Coach"** |
| **After Booking (Confirmed)** | • Countdown timer to scheduled appointment.<br>• Direct Google Meet video launch link.<br>• Candidate preparation checklist (repository defense, environment guidelines).<br>• 1-click "Reschedule / Cancel" option. | **"Join Live Room"** |
| **After Viva (Passed)** | • **Golden Glowing Accredited Badge** minted with official NIAT seal.<br>• Public Credential ID displayed (`GRIT-2026-FS-XXXXX`).<br>• Full rubric dossier breakdown (System Design, Problem Solving, Code Hygiene).<br>• "Share on LinkedIn" verification button. | **"Share Credential"** & **"View Public Certificate"** |
| **After Viva (Retake)** | • Soft warning notification explaining panel feedback.<br>• Star breakdown of rubric scores highlighting knowledge gaps.<br>• 10-day countdown timer displaying exact unlock date.<br>• Recommended NIAT curriculum sprint modules. | **"Review Recommended Modules"** (Booking locked during cooldown) |
| **After Audit (Nullified)** | • High-priority red disciplinary header (**Student Message #3**).<br>• Track Badge stamped with diagonal **"REVOKED / VOID"** watermark.<br>• Detailed forensic evidence AST overlap summary with **"Inspect AI Radar"** button.<br>• Right-of-appeal procedure instructions. | **"Inspect AI Radar"** & **"Contact Board"** |
