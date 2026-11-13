# Loom Video Recording Script & Presentation Guide
## NIAT GRIT AI Product Engineer: Round 1 Project

**Target Video Length:** 3 to 4 minutes  
**Format:** Screen share with your webcam bubble active (recommended by evaluators).  
**Tone:** Confident, structured, product-minded, and demonstrating AI engineering leadership.

---

### Pre-Recording Setup Checklist
1. Open your browser to the running prototype at: `http://localhost:5000`.
2. Have the prototype open in full screen with the **Student View (Rahul Verma)** loaded first.
3. Keep the **"Before & After State Simulator"** banner visible at the top.
4. Have your microphone and webcam tested.

---

### Step-by-Step Spoken Script

#### Part 1: Introduction & The "AI Product Engineer" Perspective (0:00 – 0:45)
> *"Hello everyone! Today, I’m presenting my solution for the NIAT GRIT Interview Scheduling & Track Badge Lifecycle Platform.*
> 
> *In the year-long GRIT competition, students clear benchmark skill contests, and once all 5 track skills are cleared, they take a live 45-minute technical viva to earn their accredited Track Badge.*
> 
> *As an **AI Product Engineer**, I didn't want to design just another generic calendar app. Traditional scheduling software ignores the real bottlenecks:*
> *• Students have test anxiety because they don't know what code panelists will probe.*  
> *• Interviewers face cognitive fatigue reviewing repositories before back-to-back vivas.*  
> *• And the operations team struggles to detect and enforce contest malpractice.*
> 
> *So I built a fullstack platform backed by a real SQLite ACID database, integrated with AI Copilots across the entire lifecycle."*

---

#### Part 2: Product Architecture & The 7-State Engine (0:45 – 1:30)
*(Click on the "RFC Write-up" button on the top right to show the state machine table briefly)*

> *"From an architecture standpoint, our system enforces a deterministic 7-state lifecycle:*
> 
> *A student moves from `SKILLS_IN_PROGRESS` to `ELIGIBLE_PENDING_BOOKING` the moment their 5th contest benchmark is recorded.*
> 
> *When reserving a slot, our database executes an atomic SQL transaction with a `UNIQUE(slot_id)` constraint—eliminating race-condition double bookings.*
> 
> *Post-viva, a pass immediately mints a verifiable digital credential, while a retake imposes an enforced 10-day cooling-off period to prevent candidates from spamming interviewer slots without revising.*
> 
> *And crucially for GRIT: if post-award audits detect malpractice, an atomic revocation engine voids the credential with an immutable forensic audit log."*

---

#### Part 3: Live Walkthrough of the AI Features (1:30 – 2:50)
*(Close the modal and walk through the 3 perspectives)*

> *"Let’s see the AI in action across all three personas:*
> 
> **[1. Student Experience & The AI Viva Coach]**  
> *(Show Rahul Verma - Eligible)*  
> *Here is Rahul Verma. He has cleared 5/5 skills. Notice the 'Launch AI Pre-Viva Coach' button!*  
> *(Click 'Launch AI Pre-Viva Coach')*  
> *The AI performs an AST scan of Rahul's Contest #4 code. It flags an architectural vulnerability in his `WalletService`—a deadlock hazard under concurrent bidirectional transfers. It gives Rahul an 88% readiness score and lets him simulate a live mock viva question with the recommended model defense! This directly bridges the preparation gap.*
> 
> *(Close modal and click 'Book Interview Slot', select Friday 10 AM, and confirm)*  
> *When he books, Student Message #1 appears with the Google Meet room and defense guidelines.*
> 
> **[2. Interviewer Cockpit & AI Auto-Rubric]**  
> *(Switch to 'Interviewer View' on the navbar)*  
> *Now let's switch to Priya Sharma's interviewer view. When she clicks 'Evaluate Candidate':*  
> *(Click 'Evaluate Candidate')*  
> *Notice our Interviewer AI Copilot! It reads the candidate's code diffs and recommends 3 targeted defense questions with expected technical keywords like `SELECT FOR UPDATE`. Even better, when the interviewer scores the rubric, one click on 'AI Auto-Draft Feedback' synthesizes the panel observations into professional, constructive student feedback!*
> 
> **[3. Operations Funnel & AI AST Plagiarism Radar]**  
> *(Switch to 'Ops Admin View' on the navbar)*  
> *Next, in the Operations View, the team can see which eligible students have booked and which haven't. For drop-offs, ops can trigger a 1-click AI booking reminder.*
> 
> *Now look at malpractice enforcement:*  
> *(Click the 'View AST Match' button on Vikram Malhotra, or click 'AI AST Radar' in the navbar)*  
> *This opens our AI Forensic Plagiarism Radar. It shows side-by-side AST code diffs between the student's submission and the leaked GitHub repo with a 94.2% AI similarity score. This powers the atomic nullification of Vikram's badge!"*

---

#### Part 4: Before & After Screens & Closing (2:50 – 3:45)
*(Switch back to Student View and use the top simulator bar)*

> *"Finally, let’s see how the student home screen transforms before and after the results:*
> 
> *• **Before Interview:** Rahul sees slot booking and the AI diagnostic.*  
> *• **After Pass:** Karthik Nair sees his glowing accredited badge, minted Credential ID, and full rubric scores.*  
> *• **After Retake:** Sneha Rao sees her rubric gaps and an active 10-day cooldown countdown.*  
> *• **After Malpractice:** Vikram Malhotra sees his badge stamped with a red 'VOID' watermark and the urgent disciplinary notice (Student Message #3).*
> 
> *To summarize: this is not a generic template. It is an end-to-end, AI-augmented platform designed specifically for the engineering rigor of NIAT GRIT.*
> 
> *Thank you, and I look forward to the next round!"*
