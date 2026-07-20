# 🛡️ Admin & Scorer Operations Guide

This guide details the roles, dashboard screens, and operational workflows for administrators of the **Sankalp Sports Fest Live Scoreboard**.

---

## 1. Administrative Role Model

The system enforces three tiers of access rights to distribute scoring duties securely during the sports fest.

```
                  ┌──────────────────────┐
                  │     Master Admin     │  <-- Total System Scope
                  └──────────┬───────────┘
                             │
                  ┌──────────▼───────────┐
                  │    Sport Admin       │  <-- Single Sport Scope (e.g. Football)
                  └──────────┬───────────┘
                             │
                  ┌──────────▼───────────┐
                  │    Match Scorer      │  <-- Single Match Scope (e.g. Cricket Match A)
                  └──────────────────────┘
```

---

## 2. Administrator Workflows

### A. System Setup (Master Admin Tasks)
1.  **Access the Dashboard**: Log in at `/admin/login` using the master credentials.
2.  **Add a New Sport**:
    *   Navigate to **Add Sport** in the sidebar.
    *   Enter the sport name (e.g. `Kabaddi`) and select the category (`Men`, `Women`, or `Mixed`).
    *   Click **Save**.
3.  **Create Sport Admins**:
    The system automatically creates a dedicated Sport Admin account whenever a new sport is added via the seed script (Username pattern: `${sportName}_${category}_admin`, password: `password123`). Alternatively, create accounts directly inside the database with the `role: 'SportAdmin'` and matching `sport_id`.

---

### B. Tournament Management (Sport Admin Tasks)
1.  **Draft Players**:
    *   Navigate to the **Player Draft** page on your dashboard.
    *   Select your assigned sport.
    *   You will see a list of **Registered Free Agents** (students who signed up via the public portal) alongside existing teams.
    *   To draft a student: create a team, register them into the database, or compile rosters by clicking the draft manager options.
2.  **Create Teams**:
    *   Navigate to **Add Team**.
    *   Enter the team name (e.g., `CSE Giants`) and click **Save**.
3.  **Generate Tournament Brackets**:
    *   Navigate to the **Matches & Brackets** tab.
    *   Select your sport.
    *   If you have at least 2 teams or players registered, click **Generate Bracket**.
    *   > [!WARNING]
        > **Bracket Generation is Destructive**: Running this process deletes any existing matches for the target sport. Shuffled teams are dynamically grouped and compiled bottom-up into a tournament tree.

---

### C. Live Scoring Operations (Match Scorer Tasks)

Match Scorers are assigned to specific matches (e.g. Cricket) by the Master Admin or Sport Admin.

```
┌─────────────────────────────────────────────────────────────────┐
│                    CRICKET SCORER INTERFACE                     │
├─────────────────────────────────────────────────────────────────┤
│ [Striker Name]  [runs input: 0, 1, 2, 3, 4, 6]  [Extras Type]   │
│ [Non-Striker]                                   [Wicket Type]   │
│ [Bowler Name]                                   [Undo Button]   │
├─────────────────────────────────────────────────────────────────┤
│                     [LOCK MATCH / FINALIZE]                     │
└─────────────────────────────────────────────────────────────────┘
```

#### Step-by-Step Scoring Guide
1.  **Initialize the Match**:
    *   Before scoring can begin, you must initialize the match state.
    *   Select the **Toss Winner** and choose their **Toss Decision** (`Bat` or `Bowl`).
    *   Click **Start Match**.
2.  **Log a Delivery**:
    *   Configure the current active players: **Striker**, **Non-Striker**, and **Bowler**.
    *   Select the number of **Runs Off Bat** (0-6).
    *   **Log Extras** (if applicable): Select the type (`Wide`, `NoBall`, `Bye`, `LegBye`) and enter the extra runs.
    *   **Log Wickets** (if applicable): Toggle the wicket switch, choose the wicket type (e.g. `Caught`), and enter the batsman dismissed.
    *   Click **Submit Ball**. The system calculates calculations and pushes updates to the live websocket feed instantly.
3.  **Undo Actions**:
    *   If a scoring mistake is made, click the **Undo Last Ball** button.
    *   The backend retrieves the last delivery with `isUndo: false`, subtracts the run/wicket values, marks the ball document as `isUndo: true`, and updates the live scoreboard.
4.  **Finalize & Lock Match**:
    *   Once the match concludes, click **Lock Match**.
    *   The system evaluates scores, determines the winner, writes the winner ID to the `Match` document, flags the `CricketState` as `isLocked`, and automatically propagates the winner to the next round of the tournament bracket.
