# Campus 2.0 · Product Verse 2026 Prototype

> **Core Product Thesis:**  
> *"People say yes. Plans still fall apart."*  
> *"Campus 2.0 owns the plan until it happens."*

Built for the **Product Verse 2026** competition by **PRODCON (Product & Consulting Society, MANIT Bhopal)**.

---

## 🎯 What is Campus 2.0?

A college campus has thousands of students, yet finding one specific person for a hackathon team, a 5-a-side football game, or a badminton rally is surprisingly difficult. Today, plans die in scattered WhatsApp groups, unanswered Instagram stories, and last-minute ghosting.

Existing tools stop at **finding** people.  
**Campus 2.0 owns the plan until it happens in the real world.**

### The Core Loop
```
INTENT → MATCH → COMMIT → RECONFIRM → SELF-HEAL → MEET → REPEAT
```

1. **Intent:** A student states what they need (e.g. *"I need 1 UI designer for Saturday's hackathon"*).
2. **Match:** Rule-based matching pairs students by Role (hard filter), Availability (hard filter), Campus Zone proximity, and follow-through history.
3. **Commit:** Teammates lock in roster spots.
4. **Reconfirm:** Ahead of the event, members confirm: *"You're still in?"*
5. **Self-Heal (Signature Feature):** If a member releases their spot early, the **Bench** immediately steps in with zero penalty, finds the best backup candidate, and restores the group.
6. **Meet (North Star Event):** Students check in physically at the venue via a 4-digit code → **✅ IT HAPPENED**.
7. **Repeat:** Proven groups form recurring crews (*"Play again with this crew?"*).

---

## 🏗️ Architecture & Technology Stack

- **Frontend:**
  - React 19 + TypeScript + Vite
  - Tailwind CSS v4 (CSS-first token system)
  - Motion (`motion/react`) for smooth physics and the signature self-healing scanner
  - Canvas Confetti for celebratory North Star check-in
  - Plus Jakarta Sans + JetBrains Mono typography
  - Lucide icons
- **Backend:**
  - Node.js + Express + TypeScript (`tsx`)
  - MongoDB + Mongoose
  - **Zero-Setup Execution:** Uses `MONGODB_URI` if provided; otherwise automatically starts an embedded in-memory MongoDB (`mongodb-memory-server`) and pre-seeds realistic MANIT student personas. Zero manual database installation required!
- **Data Models:**
  - `User`: Student profiles, branches, campus zones, verified identity, and private participation history.
  - `Plan`: Activity, role needed, spots, members, the Bench, health state, and check-in codes.
  - `ParticipationEvent`: Deterministic reliability audit logging (early releases are never penalized).
  - `Notification`: In-app event alerts for matches, spot releases, and bench offers.
  - `Message`: Plan-scoped group coordination chat (archived after activity completes).

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Quick Run (One Command)
```bash
npm run dev
```

This starts both services simultaneously:
- **Client:** `http://localhost:5173`
- **Server:** `http://localhost:5000` (auto-seeds in-memory MongoDB on first boot)

---

## 🎬 Judge Demo Guide (How to Test the Core Story)

The application includes a persistent **Judge Demo Bar** pinned to the top of the interface:

### The Signature User Journey (Aarav → Riya → Kabir):

1. **Open the App:** Navigate to `http://localhost:5173`.
   - Observe the **Thesis Hero**: *"People say yes. Plans still fall apart."*
   - Observe the active persona: **Aarav Mehta** (Team Lead, 2nd Year CSE, Deadline Builder).
2. **Explore the Smart India Hackathon Plan:**
   - Click on the **Smart India Hackathon · Finals Sprint** card.
   - Note the **Likely to Happen / Watching** health badge.
   - See the committed roster: **Aarav**, **Tanvi**, **Siddharth**, and **Riya Sharma** (awaiting reconfirmation).
   - See **The Bench**: **Kabir Verma** (Priority #1 backup) and **Rohan Saxena** standing by.
3. **Simulate Riya Dropping Her Spot:**
   - In the top Judge Demo Bar, click **"Simulate Spot Drop"** (or click *"Release my spot"* as Riya).
   - A guilt-free early release notice is recorded with **zero penalty**.
   - Notice the instant change in plan health: **⚠ PLAN AT RISK** banner triggers.
4. **Experience the Self-Healing System (Signature Interaction):**
   - Click **"Launch Self-Healing Workflow"**.
   - Click **"Inspect Bench Backups"** to watch the animated radar scan the Bench.
   - Observe the explainable fit reasons for **Kabir Verma**:
     - ✓ Role fit: UI / UX & Figma prototyping
     - ✓ Saturday 10:00 AM availability
     - ✓ Campus zone: Main Block / Hostel 7
     - ✓ 4 completed bench step-ins with zero no-shows
   - Click **"Offer Slot to Kabir"**.
   - Click **"Kabir Accepts Slot"**.
   - **Restrained Celebration:** The spring animation confirms **PLAN RESTORED** (4 / 4 committed).
5. **Real-World Check-In (North Star Event):**
   - Click **"Check-in (In-Person)"** on the plan detail page.
   - Enter code `4921` and click **"Check In Now"**.
   - The system triggers confetti and marks: **✅ IT HAPPENED!**
   - Click **"Repeat Session with This Crew"** to instantly form a recurring crew for next week.
6. **Discover & Filter:**
   - Visit `/discover` to filter by **Competitions** (Acquisition Wedge), **Sports & Turf** (Retention Engine), or **Creative Walks**.
7. **Private Profile & Trust:**
   - Visit `/profile` to view verified student identity and private participation history. Notice there are **no public scores** (e.g. no "87/100" character judgments), preserving psychological safety.

---

## 🧪 Testing & Verification

Run strict TypeScript typechecking across workspaces:
```bash
npm run typecheck
```

Build production client bundle:
```bash
npm run build
```

Reset demo seed data anytime:
```bash
npm run seed
```
*(Or click "Reset Demo" directly in the top Judge Demo Bar in the browser)*

---

## 🛡️ Design QA & Anti-Slop Principles

- **Primary Colors:** Royal Blue (`#1746B8`), Amber Accent (`#F5A623`), Off-White (`#FAFAF8`), Dark (`#111111`).
- **No generic AI Slop:** No purple glows, no floating blobs, no stock photo collages, no fake AI confidence metrics.
- **Explainable Matching:** Clear criteria (`Role ✓`, `Time ✓`, `Skill ✓`, `Proximity ✓`).
- **Mobile First:** Optimized for 390px mobile screens with high-contrast bottom navigation and tactile feedback.
