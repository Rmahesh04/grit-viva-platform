# NIAT GRIT — AI Product Engineer: Round 1
## Loom Video Walkthrough & Presentation Guide (.md)

**Target Duration:** 3 to 4 Minutes  
**Format:** Screen Recording + Front-Facing Camera Bubble (Loom Standard)  
**Live URL:** `http://localhost:5000`

---

## 📋 Pre-Recording Setup Checklist (Do This Before Pressing Record)

1. Open your browser in full screen at: **`http://localhost:5000`**
2. Make sure the initial view is on **Student View** with **Rahul Verma** selected.
3. Turn on Loom screen + camera bubble (bottom-left or bottom-right corner).
4. Keep this guide open on a second monitor or side window to glance at.

---

## ⏱️ Video Timeline at a Glance

| Timestamp | Segment | Primary Screen / UI Action | Core Talking Point |
| :--- | :--- | :--- | :--- |
| **0:00 – 0:40** | **Hook & Context** | Student View (Rahul Verma) | Framing as an **AI Product Engineer**, not a generic CRUD app |
| **0:40 – 1:15** | **Architecture & State Machine** | Click `RFC` button in top navbar | 7 deterministic states, ACID transactions, edge cases |
| **1:15 – 2:35** | **Live Core Flow & AI Tools** | Student ➔ Interviewer ➔ Admin | AI Pre-Viva Coach, Slot Booking, AI Rubric, AI AST Plagiarism Radar |
| **2:35 – 3:30** | **Before & After Screens** | State Simulator bar at top | Rahul ➔ Karthik (Pass) ➔ Sneha (Retake) ➔ Vikram (Voided) |
| **3:30 – 3:50** | **Conclusion & Submission Wrap** | Student Dashboard Home | Summary of engineering rigor & closing |

---

## 🎬 Step-by-Step Script & Actions

---

### Segment 1: Hook & Context (0:00 – 0:40)

**UI Action:**
- Keep your mouse hovering over the candidate profile card of **Rahul Verma** on the home screen.

**What to Say:**
> *"Hi everyone, today I'm presenting my solution for the NIAT GRIT Interview Scheduling & Track Badge Lifecycle Platform.*
>
> *In the year-long GRIT competition, engineering students clear 5 prerequisite skill contests. Once all benchmarks are achieved, they take a live 45-minute technical viva to defend their code and earn an accredited Track Badge.*
>
> *As an **AI Product Engineer**, I didn't want to design just another generic calendar booking tool. Traditional schedulers fail to address the core human bottlenecks:*
> - *Students suffer from interview anxiety because they don't know what code architecture panelists will scrutinize.*
> - *Interviewers face cognitive fatigue reviewing dense repositories before back-to-back vivas.*
> - *And operations teams struggle to audit and enforce post-award academic integrity.*
>
> *So I built a fullstack platform backed by a real SQLite ACID database, integrated with specialized AI engines across every touchpoint."*

---

### Segment 2: System Architecture & 7-State Engine (0:40 – 1:15)

**UI Action:**
- Click the **`RFC`** button in the top navbar (opens the 2-Page RFC modal).
- Scroll briefly through **Section 1: State Machine Table** and **Section 3: Relational Schema**.

**What to Say:**
> *"From an architectural standpoint, our system enforces a deterministic 7-state lifecycle:*
> - *A student moves from `SKILLS_IN_PROGRESS` to `ELIGIBLE_PENDING_BOOKING` strictly when their 5th contest benchmark is validated.*
> - *Slot booking executes inside an atomic SQL transaction with unique slot constraints, eliminating race-condition double bookings.*
> - *Post-viva, a pass immediately mints a cryptographically verifiable Track Badge ID.*
> - *A retake recommendation automatically enforces a 10-day cooling-off window, preventing candidates from spamming interviewer slots without revising.*
> - *And crucially: if post-award proctoring uncovers malpractice, an atomic revocation engine voids the badge with an immutable audit log."*

**UI Action:**
- Click **✕** to close the RFC modal.

---

### Segment 3: Live Flow & AI Copilots Across 3 Roles (1:15 – 2:35)

#### A. Student Experience (Rahul Verma — Eligible)
**UI Action:**
- Click the purple **"AI Pre-Viva Coach & Auditor"** button on the profile card.

**What to Say:**
> *"Here is Rahul Verma. He has cleared 5/5 skills and is eligible to book. Notice our **AI Pre-Viva Coach**:*
> *It performs an AST code analysis of his Contest #4 repository, identifies an architectural vulnerability in his `wallet_service.go`—specifically a deadlock hazard under concurrent bidirectional transfers—and generates a simulated panel probe with the recommended model defense. This directly bridges the candidate's preparation gap."*

**UI Action:**
- Close the modal.
- Click **"Book Interview Slot"** button.
- Select **Friday 10:00 AM** with Priya Sharma, and click **"Confirm Viva Reservation"**.

**What to Say:**
> *"When Rahul books his slot, our system instantly displays Student Message #1 with the Google Meet link, panelist details, and viva defense guidelines."*

---

#### B. Interviewer View (Priya Sharma — Staff Engineer)
**UI Action:**
- Click **`Interviewer`** in the top navbar role switcher.
- Click **"Evaluate Candidate"** on a booked session.

**What to Say:**
> *"Switching to Priya Sharma's Interviewer Cockpit: when evaluating a candidate, notice our **Interviewer AI Copilot**.*
> *It reads the candidate's repository diffs and prepares 3 targeted technical probes with expected keywords like `SELECT FOR UPDATE`.*
> *When the panelist inputs rubric scores, clicking **'AI Auto-Draft Feedback'** synthesizes raw interviewer notes into constructive, professional feedback for the student."*

**UI Action:**
- Close the modal.

---

#### C. Operations Admin & AI Plagiarism Radar
**UI Action:**
- Click **`Admin`** in the top navbar role switcher.

**What to Say:**
> *"In the Operations Command Center, the team tracks cohort conversion in real time. We can clearly see which eligible students have booked vs. unbooked drop-offs, and trigger an automated AI booking reminder with one click.*
>
> *Now, let's examine academic integrity enforcement:"*

**UI Action:**
- Click the **`AST Radar`** button in the top navbar.

**What to Say:**
> *"This opens our **AI Forensic Plagiarism Radar**. It compares the student's submission against uncredited external repositories, highlighting identical Abstract Syntax Tree nodes with a 94.2% structural similarity score. This powers the atomic nullification of any badge earned under malpractice."*

**UI Action:**
- Close the modal.

---

### Segment 4: Before & After Screens — State Simulator (2:35 – 3:30)

**UI Action:**
- Switch back to **`Student`** view in the navbar.
- Direct your cursor to the **Before & After Screen State Simulator** bar at the top of the page.
- Click through the candidate chips one by one as you speak:

**What to Click & Say:**

1. **Click `Rohit` (State 1 — In Progress):**
   > *"Before eligibility: Rohit has cleared 3/5 skills. His viva booking is locked with a clear benchmark clearance tracker."*

2. **Click `Rahul` (State 2 — Before Viva):**
   > *"Eligible state: All 5 skills cleared. A golden callout banner unlocks to book his technical defense."*

3. **Click `Ananya` (State 3 — Slot Reserved):**
   > *"Booked state: Confirmed appointment countdown, Google Meet room access, and defense checklist."*

4. **Click `Karthik` (State 4 — After: Pass):**
   > *"After Pass: The accredited Track Badge is minted with an official Credential ID, verified holographic seal, and rubric score breakdown."*

5. **Click `Sneha` (State 5 — After: Retake):**
   > *"After Retake: A 10-day review cooldown banner is displayed alongside rubric gaps and recommended system design study tracks."*

6. **Click `Vikram` (State 6 — After: Malpractice):**
   > *"After Malpractice: The badge is permanently stamped with a red 'VOID' watermark, displaying the urgent disciplinary revocation notice (Student Message #3)."*

---

### Segment 5: Conclusion & Wrap-up (3:30 – 3:50)

**UI Action:**
- Return focus to the clean student dashboard home screen.

**What to Say:**
> *"To conclude: this is a production-grade, AI-augmented operating system designed specifically for the rigorous standards of NIAT GRIT—featuring real SQLite ACID transactions, deterministic state transitions, 3 verbatim communications, before/after screen variations, and domain-tailored AI copilots.*
>
> *Thank you for your time, and I look forward to Round 2!"*

---

## 📝 Google Form Submission Helper

When submitting at the official Google Form:

| Form Field | What to Enter / Link |
| :--- | :--- |
| **Email ID** | Your email address |
| **Assignment Link 1 ((Anyone can View Access))** | Link to your Google Doc containing the 2-page write-up (from `docs/GRIT_INTERVIEW_SYSTEM_RFC.md`) |
| **Prototype Link** | Your GitHub repository URL for this project |
| **Loom Recording Link (Project Explanation)** | Your public Loom video link (e.g. `https://www.loom.com/share/...`) |

