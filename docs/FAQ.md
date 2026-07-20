# ❓ Frequently Asked Questions (FAQ)

This FAQ documents common operational issues, development hurdles, and structural inquiries regarding the **Sankalp Sports Fest Live Scoreboard**.

---

## 1. Setup & Environment

### Q: Why is my local backend failing to connect to MongoDB?
**A**: Ensure that your local MongoDB Community Server is active and running. 
*   On Windows, check that the "MongoDB Server" service is running in Services manager.
*   On Linux/macOS, run: `sudo systemctl status mongod` or `brew services list`.
*   Verify your connection string in `backend/.env`. The default is `mongodb://127.0.0.1:27017/sankalp_scoreboard`.

### Q: Why are my frontend API requests failing with Network Errors?
**A**: This is usually a CORS configuration or endpoint misalignment.
1.  Check that your backend server is running (default port is `5000`).
2.  Verify that your frontend's `VITE_API_URL` variable in `frontend/.env` exactly matches the backend API endpoint (`http://localhost:5000/api`).
3.  Ensure CORS settings in `backend/server.js` allow requests from your frontend origin (default is `http://localhost:5173`).

---

## 2. Administrative Operations

### Q: How do I change the default administrator credentials?
**A**: Default seeder credentials (`admin` / `password123`) are populated when running `npm run seed`. 
*   **Production Deployment**: Never use default credentials in production.
*   **Updating Password**: You can update the password directly in the database. Since passwords are encrypted using Bcrypt, write a script or update the document using mongoose models:
    ```javascript
    const Admin = require('./models/Admin');
    const bcrypt = require('bcrypt');

    const updateAdminPassword = async (username, newPassword) => {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await Admin.findOneAndUpdate({ username }, { password: hashedPassword });
    };
    ```

### Q: Can I regenerate a tournament bracket after it has been created?
**A**: Yes. Sport Admins can regenerate brackets from the admin dashboard. However, **this is a destructive operation**. Clicking "Generate Bracket" deletes any existing matches and scoreboards associated with that sport and compiles a clean, randomized tournament tree.

### Q: How do I reset a completed match if the winner was locked incorrectly?
**A**: If you lock a match incorrectly, you can reset its status to `Upcoming` or `Live` through the matches page or database. When a match status changes from `Completed` back to `Live`/`Upcoming`, the backend middleware automatically removes the winner's team reference from the next round slot to prevent bracket anomalies.

---

## 3. Architecture & Mechanics

### Q: Why does the system use dynamic collections for sports registrations?
**A**: Student clubs receive thousands of sport registrations. To keep database queries efficient, registrations are stored in dedicated collections named `${sanitizedSportName}-registrations` rather than a single database collection. This keeps index scopes small and prevents registration data from overlapping across sports.

### Q: How does the scorer console's Undo button calculate score rollbacks?
**A**: Rollbacks use a transaction log pattern:
1.  Deliveries are stored as separate documents in `CricketBall` collection.
2.  When an administrator clicks "Undo Last Ball", the backend flags the latest valid ball document as `isUndo: true`.
3.  The backend subtracts the runs and wickets associated with that delivery from the corresponding innings statistics in the `CricketState` document.
4.  Calculations for overs are re-run, and the updated state is broadcasted to all connected client scoreboards.
