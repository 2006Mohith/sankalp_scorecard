# 🌐 REST API Reference Guide

All backend APIs are hosted under the `/api` root path. Admin endpoints require an `Authorization` header populated with a signed JSON Web Token (JWT):
```http
Authorization: Bearer <JWT_TOKEN>
```

---

## 1. Authentication Endpoints

### POST `/admin/login`
Logs in administrative users. Enforces a rate limit of 7 requests per 15 minutes.
*   **Request Body**:
    ```json
    {
      "username": "admin",
      "password": "password123"
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "token": "eyJhbGciOi...",
      "admin": {
        "username": "admin",
        "role": "Master",
        "sport_id": null,
        "assigned_matches": []
      }
    }
    ```
*   **Error Codes**: `401 Unauthorized` (Invalid credentials), `429 Too Many Requests`.

### GET `/admin/verify`
Verifies JWT session validity. Requires authorization header.
*   **Response (200 OK)**:
    ```json
    {
      "valid": true,
      "admin": {
        "username": "admin",
        "role": "Master"
      }
    }
    ```

---

## 2. Public Data Endpoints

### GET `/leaderboard`
Fetches a list of champions across completed tournaments.
*   **Response (200 OK)**:
    ```json
    [
      {
        "sportId": "65e8a...",
        "sportName": "Football",
        "category": "Men",
        "champion": "CSE Strikers",
        "date": "2026-07-20T18:00:00.000Z"
      }
    ]
    ```

### GET `/sports`
Fetches the catalog of available sports.
*   **Response (200 OK)**:
    ```json
    [
      {
        "_id": "65e8a...",
        "name": "Cricket",
        "category": "Men"
      }
    ]
    ```

### POST `/registrations`
Submits a public sport registration form. Dynamically routes to the sport's custom collection.
*   **Request Body**:
    ```json
    {
      "name": "Mohith K",
      "year": "III",
      "branch": "CSE",
      "section": "A",
      "hallTicket": "160723733001",
      "sportId": "65e8a...",
      "sportName": "Cricket"
    }
    ```
*   **Response (201 Created)**:
    ```json
    {
      "message": "Registration confirmed. Copied to Core System.",
      "data": { ... }
    }
    ```
*   **Error Codes**: `400 Bad Request` (Validation errors or duplicate hall ticket registration).

### GET `/sports/stats`
Fetches available sports combined with active live match counters.
*   **Response (200 OK)**:
    ```json
    [
      {
        "_id": "65e8a...",
        "name": "Football",
        "category": "Men",
        "liveCount": 1
      }
    ]
    ```

### GET `/sports/:id/hierarchy`
Aggregates a database view of a sport's structure (teams and player rosters).
*   **Response (200 OK)**:
    ```json
    {
      "_id": "65e8a...",
      "sportName": "Football",
      "description": "KMCE Football Cup",
      "category": "Men",
      "totalTeams": 2,
      "teams": [
        {
          "teamName": "CSE Strikers",
          "totalPlayers": 11,
          "players": [
            { "playerName": "Aditya K", "position": "Forward" }
          ]
        }
      ]
    }
    ```

### GET `/matches/:sportId`
Fetches a list of matches scheduled for a specific sport.
*   **Response (200 OK)**: Returns an array of `Match` objects, populated with participant names. If the sport is Cricket, includes the corresponding `CricketState` payload.

### GET `/match/:id`
Fetches details for a single match.
*   **Response (200 OK)**: `Match` object. If the sport is Cricket, includes the corresponding `CricketState` payload.

---

## 3. Administrative Endpoints

*Requires standard user authentication and matching authorization privileges (Master or SportAdmin).*

### GET `/admin/registrations/:sportId/:sportName`
Retrieves free-agent registrations for drafting.
*   **Response (200 OK)**: Array of draft cards.

### POST `/sports`
Creates a new sport category. Restricted to **Master Admin**.
*   **Request Body**:
    ```json
    {
      "name": "Volleyball",
      "category": "Women"
    }
    ```

### POST `/teams`
Registers a team roster.
*   **Request Body**:
    ```json
    {
      "name": "ECE Spikers",
      "sport_id": "65e8a...",
      "type": "Team"
    }
    ```

### POST `/players`
Adds a player to a team roster.
*   **Request Body**:
    ```json
    {
      "name": "Rohan M",
      "team_id": "65e8b...",
      "position": "Defender"
    }
    ```

### POST `/matches`
Schedules a match. Emits the `matchCreated` websocket broadcast event.
*   **Request Body**:
    ```json
    {
      "sport_id": "65e8a...",
      "participant1_id": "65e8b...",
      "participant2_id": "65e8c...",
      "status": "Upcoming",
      "stage": "Semi Final"
    }
    ```

### PUT `/matches/:id`
Updates match details or scores. Handles automatic winner propagation to the next round if status changes to `Completed`. Emits `matchUpdated`.
*   **Request Body**:
    ```json
    {
      "score1": 4,
      "score2": 2,
      "status": "Completed",
      "winner": "65e8b..."
    }
    ```

### POST `/matches/generate-bracket/:sportId`
Wipes existing matches for a sport and builds a new randomized tournament bracket.
*   **Response (200 OK)**:
    ```json
    {
      "message": "Bracket generated successfully!",
      "matches": [ ... ]
    }
    ```

---

## 4. Cricket Scoring Endpoints

*Requires authentication and scorer verification (Master, SportAdmin, or MatchScorer assigned to the match).*

### GET `/cricket/:matchId/state`
Fetches the current live state of a cricket match alongside the 10 most recent deliveries.
*   **Response (200 OK)**:
    ```json
    {
      "state": { ... },
      "recentBalls": [ ... ]
    }
    ```

### POST `/cricket/:matchId/init`
Initializes toss parameters and starts the scoring workflow. Emits `cricketUpdate-${matchId}`.
*   **Request Body**:
    ```json
    {
      "tossWinner": "CSE Strikers",
      "tossDecision": "Bat"
    }
    ```

### POST `/cricket/:matchId/ball`
Logs a delivery. Calculations are added to the team batting params in the match state. Emits `cricketBall-${matchId}` and `cricketUpdate-${matchId}`.
*   **Request Body**:
    ```json
    {
      "innings": 1,
      "overNumber": 0,
      "ballNumberInOver": 1,
      "strikerName": "Karthik R",
      "nonStrikerName": "Siddharth V",
      "bowlerName": "Varun P",
      "runsOffBat": 4,
      "extrasType": "None",
      "extrasRuns": 0,
      "isWicket": false
    }
    ```

### POST `/cricket/:matchId/undo`
Reverses the last recorded delivery. Emits `cricketUndo-${matchId}`.
*   **Response (200 OK)**: Returns the updated `CricketState`.

### POST `/cricket/:matchId/lock`
Concludes the cricket match, calculates the winner, updates the parent Match document to `Completed`, and locks scoring. Emits `matchUpdated`.
