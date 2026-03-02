import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import Admin from '../models/Admin.js';
import Sport from '../models/Sport.js';
import Team from '../models/Team.js';
import Match from '../models/Match.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sankalp_scoreboard';

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    await Admin.deleteMany({});
    await Sport.deleteMany({});
    await Team.deleteMany({});
    await Match.deleteMany({});

    // 1. Create Sports
    const sportsList = [
        { name: 'Badminton', category: 'Men' },
        { name: 'Badminton', category: 'Women' },
        { name: 'Kabaddi', category: 'Men' },
        { name: 'Kabaddi', category: 'Women' },
        { name: 'Kho-Kho', category: 'Men' },
        { name: 'Kho-Kho', category: 'Women' },
        { name: 'Volleyball', category: 'Men' },
        { name: 'Football', category: 'Men' },
        { name: 'Cricket', category: 'Men' },
        { name: 'Chess', category: 'Mixed' },
        { name: 'Table Tennis', category: 'Men' },
        { name: 'Carroms', category: 'Men' },
        { name: 'Tennikoit', category: 'Women' },
        { name: 'Throwball', category: 'Women' },
    ];

    const sports = await Sport.insertMany(sportsList);
    console.log('Created Sports');

    // 2. Create Admins
    // Master Admin
    const masterAdmin = new Admin({ username: 'admin', password: 'password123', role: 'Master' });
    await masterAdmin.save();

    // Dynamically create a SportAdmin for every single sport
    // Format: badminton_men_admin, kabaddi_women_admin, etc.
    const createdAdmins = [];
    for (const sport of sports) {
        // e.g. "Table Tennis" -> "table_tennis", "Men" -> "men"
        const formattedName = sport.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const formattedCategory = sport.category.toLowerCase();
        const username = `${formattedName}_${formattedCategory}_admin`;

        const sportAdmin = new Admin({
            username,
            password: 'password123',
            role: 'SportAdmin',
            sport_id: sport._id
        });
        await sportAdmin.save();
        createdAdmins.push(username);
    }

    console.log(`Created Master Admin: admin / password123`);
    console.log(`Created Sport Admins (password is 'password123' for all):`);
    createdAdmins.forEach(u => console.log(` - ${u}`));

    // 3. Create sample teams for Football & Kabaddi
    const football = sports.find(s => s.name === 'Football');
    const teamA = await Team.create({ name: 'CSE Strikers', sport_id: football._id, type: 'Team' });
    const teamB = await Team.create({ name: 'IT Titans', sport_id: football._id, type: 'Team' });

    const kabaddi = sports.find(s => s.name === 'Kabaddi' && s.category === 'Men');
    const teamC = await Team.create({ name: 'ECE Bulls', sport_id: kabaddi._id, type: 'Team' });
    const teamD = await Team.create({ name: 'MECH Warriors', sport_id: kabaddi._id, type: 'Team' });

    const cricket = sports.find(s => s.name === 'Cricket' && s.category === 'Men');
    const teamE = await Team.create({ name: 'CSM Spartans', sport_id: cricket._id, type: 'Team' });
    const teamF = await Team.create({ name: 'AIML Kings', sport_id: cricket._id, type: 'Team' });

    // 4. Create sample matches
    await Match.create({
        sport_id: football._id,
        participant1_id: teamA._id,
        participant2_id: teamB._id,
        score1: 2,
        score2: 1,
        status: 'Live'
    });

    const cricketMatch = await Match.create({
        sport_id: cricket._id,
        participant1_id: teamE._id,
        participant2_id: teamF._id,
        score1: 0,
        score2: 0,
        status: 'Upcoming'
    });

    const matchScorer = new Admin({
        username: 'cricket_scorer_1',
        password: 'password123',
        role: 'MatchScorer',
        assigned_matches: [cricketMatch._id]
    });
    await matchScorer.save();
    console.log('Created MatchScorer for Cricket (cricket_scorer_1 / password123)');

    console.log('Created Teams and Matches!');
    process.exit();
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
