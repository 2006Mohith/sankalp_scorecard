import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function run() {
    try {
        console.log("Fetching sports...");
        const { data: sports } = await axios.get(`${API_URL}/sports`);
        if (sports.length === 0) {
            console.log("No sports found.");
            return;
        }
        const sport = sports[0];
        console.log("Fetched sport:", sport.name);

        console.log("Creating registration...");
        const res = await axios.post(`${API_URL}/registrations`, {
            name: "Test User",
            year: "1st Year",
            branch: "CSE",
            section: "A",
            hallTicket: "123456" + Math.random().toString().substring(0, 4),
            sportId: sport._id,
            sportName: sport.name
        });
        console.log("Registration created:", res.data);

        // Login as admin
        console.log("Logging in as admin...");
        // I dont have admin creds so I will just login with fake or create an admin token directly if I can't.
        // Wait, I can't login. Let me try without admin or I will just look at the DB directly.
    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }
}
run();
