import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Admin from '../models/Admin.js';
import Sport from '../models/Sport.js';
import Team from '../models/Team.js';
import Match from '../models/Match.js';
import Player from '../models/Player.js';
import { getRegistrationModel, getAdminSportModel } from '../models/Registration.js';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sankalp_super_secret_key_2026';

// Middleware for authentication
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const admin = await Admin.findById(decoded.id);
        if (!admin) return res.status(401).json({ error: 'Invalid token' });
        req.admin = admin;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

const authorizeMaster = (req, res, next) => {
    if (req.admin.role !== 'Master') {
        return res.status(403).json({ error: 'Forbidden: Master admin access required.' });
    }
    next();
};

const authorizeSportAdmin = async (req, res, next) => {
    if (req.admin.role === 'Master') return next();
    if (req.admin.role === 'MatchScorer') {
        return res.status(403).json({ error: 'Forbidden: Scorer access limited to cricket console.' });
    }

    let targetSportId = req.body.sport_id || req.params.sportId;

    if (req.params.id) {
        // Find existing match sport id
        const match = await Match.findById(req.params.id);
        if (match) targetSportId = match.sport_id;
    }

    if (!targetSportId || req.admin.sport_id?.toString() !== targetSportId.toString()) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission for this sport.' });
    }
    next();
};

/* ====== AUTH ====== */
const loginLimiter = rateLimit({
    max: 7, // Limit each IP to 7 login requests per windowMs
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: { error: 'Too many login attempts from this IP, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/admin/login', loginLimiter, async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ username });
        if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
        const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, admin: { username: admin.username, role: admin.role, sport_id: admin.sport_id, assigned_matches: admin.assigned_matches } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/admin/verify', authenticate, (req, res) => {
    res.json({ valid: true, admin: { username: req.admin.username, role: req.admin.role, sport_id: req.admin.sport_id, assigned_matches: req.admin.assigned_matches } });
});

/* ====== PUBLIC ====== */
router.get('/leaderboard', async (req, res) => {
    try {
        const sports = await Sport.find();
        const Match = (await import('../models/Match.js')).default;

        const leaderboard = await Promise.all(sports.map(async (sport) => {
            // Try to find a completed Final match with a winner
            const finalMatch = await Match.findOne({ sport_id: sport._id, stage: 'Final', status: 'Completed', winner: { $ne: null } })
                .populate('winner')
                .lean();

            return {
                sportId: sport._id,
                sportName: sport.name,
                category: sport.category,
                champion: finalMatch && finalMatch.winner ? finalMatch.winner.name : null,
                date: finalMatch ? finalMatch.updatedAt : null
            };
        }));

        res.json(leaderboard);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/sports', async (req, res) => {
    const sports = await Sport.find();
    res.json(sports);
});

router.post('/registrations', async (req, res) => {
    try {
        const { name, year, branch, section, hallTicket, sportId, sportName } = req.body;

        if (!name || !year || !branch || !section || !hallTicket || !sportId || !sportName) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        // Dynamically get the models for this specific sport
        const SportRegistration = getRegistrationModel(sportName);
        const AdminSport = getAdminSportModel(sportName);

        // Optional: Check if the user already submitted the form
        const existing = await SportRegistration.findOne({ hallTicket: hallTicket.toUpperCase() });
        if (existing) {
            return res.status(400).json({ error: 'Hall ticket has already been registered for this sport.' });
        }

        // 1. Save detailed data in the Registration collection
        const registration = new SportRegistration({
            name, year, branch, section, hallTicket, sportId, sportName
        });
        await registration.save();

        // 2. Save identical mapping to the separate Admin collection for match drafts
        const adminListing = new AdminSport({
            name, hallTicket, sportId, sportName, year, branch, section, isAssignedToTeam: false
        });
        await adminListing.save();

        res.status(201).json({ message: 'Registration confirmed. Copied to Core System.', data: registration });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/sports/stats', async (req, res) => {
    try {
        const sports = await Sport.find();
        // get match counts for each sport
        const stats = await Promise.all(sports.map(async (sport) => {
            const liveCount = await Match.countDocuments({ sport_id: sport._id, status: 'Live' });
            return { ...sport.toObject(), liveCount };
        }));
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/sports/:id/hierarchy', async (req, res) => {
    try {
        const sportObjectId = new mongoose.Types.ObjectId(req.params.id);

        const result = await Sport.aggregate([
            { $match: { _id: sportObjectId } },
            {
                $lookup: {
                    from: "teams",
                    let: { sport_id: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$sport_id", "$$sport_id"] } } },
                        {
                            $lookup: {
                                from: "players",
                                let: { team_id: "$_id" },
                                pipeline: [
                                    { $match: { $expr: { $eq: ["$team_id", "$$team_id"] } } },
                                    {
                                        $project: {
                                            _id: 0,
                                            playerId: "$_id",
                                            playerName: "$name",
                                            position: "$position"
                                        }
                                    }
                                ],
                                as: "players"
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                teamId: "$_id",
                                teamName: "$name",
                                totalPlayers: { $size: "$players" },
                                players: 1
                            }
                        }
                    ],
                    as: "teams"
                }
            },
            {
                $project: {
                    _id: 1,
                    sportName: "$name",
                    description: 1,
                    category: 1,
                    totalTeams: { $size: "$teams" },
                    teams: 1
                }
            }
        ]);

        if (!result.length) {
            return res.status(404).json({ error: "Sport not found" });
        }

        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/matches/:sportId', async (req, res) => {
    try {
        const matches = await Match.find({ sport_id: req.params.sportId })
            .populate('participant1_id participant2_id winner sport_id')
            .sort({ createdAt: -1 });

        if (matches.length > 0 && matches[0].sport_id?.name === 'Cricket') {
            const matchIds = matches.map(m => m._id);
            const CricketState = (await import('../models/CricketState.js')).default;
            const states = await CricketState.find({ match_id: { $in: matchIds } });

            const matchesWithState = matches.map(m => {
                const state = states.find(s => s.match_id.toString() === m._id.toString());
                return { ...m.toObject(), cricketState: state };
            });
            return res.json(matchesWithState);
        }
        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/match/:id', async (req, res) => {
    try {
        const match = await Match.findById(req.params.id)
            .populate('participant1_id participant2_id winner sport_id');
        if (!match) return res.status(404).json({ error: 'Match not found' });

        if (match.sport_id?.name === 'Cricket') {
            const CricketState = (await import('../models/CricketState.js')).default;
            const state = await CricketState.findOne({ match_id: match._id });
            return res.json({ ...match.toObject(), cricketState: state });
        }

        res.json(match);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/teams', async (req, res) => {
    const teams = await Team.find().populate('sport_id');
    res.json(teams);
});

/* ====== ADMIN ====== */
router.get('/admin/registrations/:sportId/:sportName', authenticate, authorizeSportAdmin, async (req, res) => {
    try {
        const { sportName } = req.params;
        const AdminSport = getAdminSportModel(sportName);
        const registeredPlayers = await AdminSport.find().sort({ createdAt: -1 });
        res.json(registeredPlayers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/sports', authenticate, authorizeMaster, async (req, res) => {
    try {
        const sport = new Sport(req.body);
        await sport.save();
        res.json(sport);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/teams', authenticate, authorizeSportAdmin, async (req, res) => {
    try {
        const team = new Team(req.body);
        await team.save();
        res.json(team);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Team name already exists within this sport.' });
        }
        res.status(500).json({ error: error.message });
    }
});

router.post('/players', authenticate, authorizeSportAdmin, async (req, res) => {
    try {
        const player = new Player(req.body);
        await player.save();
        res.json(player);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Player already exists in this team.' });
        }
        res.status(400).json({ error: error.message });
    }
});

router.post('/matches', authenticate, authorizeSportAdmin, async (req, res) => {
    try {
        const match = new Match(req.body);
        await match.save();
        const populatedMatch = await Match.findById(match._id).populate('participant1_id participant2_id sport_id');
        const io = req.app.get('io');
        io.emit('matchCreated', populatedMatch);
        res.json(populatedMatch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/matches/:id', authenticate, authorizeSportAdmin, async (req, res) => {
    try {
        const oldMatch = await Match.findById(req.params.id);
        const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true })
            .populate('participant1_id participant2_id winner sport_id');

        // Automatic Winner Propagation to Next Round
        if (match.status === 'Completed' && match.winner && match.next_match_id) {
            // Check if status newly changed to Completed or winner changed
            if (oldMatch.status !== 'Completed' || oldMatch.winner?.toString() !== match.winner._id.toString()) {
                const nextMatch = await Match.findById(match.next_match_id);
                if (nextMatch) {
                    // Update next match slot depending on whether this match was the A or B node
                    if (nextMatch.previousMatchA_id?.toString() === match._id.toString()) {
                        nextMatch.participant1_id = match.winner._id;
                    } else if (nextMatch.previousMatchB_id?.toString() === match._id.toString()) {
                        nextMatch.participant2_id = match.winner._id;
                    }
                    await nextMatch.save();
                    // Emit update for next match
                    const populatedNext = await Match.findById(nextMatch._id).populate('participant1_id participant2_id sport_id');
                    req.app.get('io').emit('matchUpdated', populatedNext);
                }
            }
        } else if (oldMatch.status === 'Completed' && match.status !== 'Completed' && match.next_match_id) {
            // User resetted the match, so we should wipe the slot from the next round
            const nextMatch = await Match.findById(match.next_match_id);
            if (nextMatch) {
                if (nextMatch.previousMatchA_id?.toString() === match._id.toString()) {
                    nextMatch.participant1_id = null;
                } else if (nextMatch.previousMatchB_id?.toString() === match._id.toString()) {
                    nextMatch.participant2_id = null;
                }
                await nextMatch.save();
                const populatedNext = await Match.findById(nextMatch._id).populate('participant1_id participant2_id sport_id');
                req.app.get('io').emit('matchUpdated', populatedNext);
            }
        }

        const io = req.app.get('io');
        io.emit('matchUpdated', match);
        res.json(match);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/matches/generate-bracket/:sportId', authenticate, authorizeSportAdmin, async (req, res) => {
    try {
        const sportId = req.params.sportId;
        const sport = await Sport.findById(sportId);

        // 1. Fetch existing Teams
        let teams = await Team.find({ sport_id: sportId });

        // 2. Fetch individual Registered Free Agents from the Admin collection
        const AdminSport = getAdminSportModel(sport.name);
        const freeAgents = await AdminSport.find({ isAssignedToTeam: false });

        // 3. Convert Free Agents into Solo Teams automatically if they aren't already
        for (const agent of freeAgents) {
            // Check if a solo team already exists for this person
            let soloTeam = await Team.findOne({ name: agent.name, sport_id: sportId });
            if (!soloTeam) {
                soloTeam = new Team({ name: agent.name, sport_id: sportId, type: 'Individual' });
                await soloTeam.save();
                teams.push(soloTeam);
            } else if (!teams.find(t => t._id.toString() === soloTeam._id.toString())) {
                teams.push(soloTeam);
            }
            // Mark agent as assigned
            agent.isAssignedToTeam = true;
            await agent.save();
        }

        if (teams.length < 2) {
            return res.status(400).json({ error: "Need at least 2 teams or players to generate a bracket." });
        }

        // Clean slate - Delete all existing matches for this sport to avoid duplicates/overlap
        await Match.deleteMany({ sport_id: sportId });

        // Shuffle teams randomly
        const shuffled = [...teams].sort(() => 0.5 - Math.random());

        let currentRoundNodes = shuffled.map(t => ({ isTeam: true, id: t._id }));
        let roundIndex = 0;
        let createdMatches = [];

        // Build bracket matches bottom-up
        while (currentRoundNodes.length > 1) {
            const nextRoundNodes = [];
            const isFinal = currentRoundNodes.length === 2;
            const isSemi = currentRoundNodes.length > 2 && currentRoundNodes.length <= 4;
            const isQuarter = currentRoundNodes.length > 4 && currentRoundNodes.length <= 8;

            let stageName = `Round ${roundIndex + 1}`;
            if (isFinal) stageName = 'Final';
            else if (isSemi) stageName = 'Semi Final';
            else if (isQuarter) stageName = 'Quarter Final';

            for (let i = 0; i < currentRoundNodes.length; i += 2) {
                const node1 = currentRoundNodes[i];
                const node2 = currentRoundNodes[i + 1] || null;

                const matchData = {
                    sport_id: sportId,
                    status: 'Upcoming',
                    stage: stageName,
                    round_index: roundIndex,
                    match_index: Math.floor(i / 2)
                };

                // Node1 logic
                if (node1.isTeam) {
                    matchData.participant1_id = node1.id;
                } else {
                    matchData.previousMatchA_id = node1.id;
                }

                // Node2 logic
                if (node2) {
                    if (node2.isTeam) {
                        matchData.participant2_id = node2.id;
                    } else {
                        matchData.previousMatchB_id = node2.id;
                    }
                }

                const newMatch = new Match(matchData);
                await newMatch.save();
                createdMatches.push(newMatch);

                // Wire up reverse links from previous nodes
                if (!node1.isTeam && node1.id) {
                    await Match.findByIdAndUpdate(node1.id, { next_match_id: newMatch._id });
                }
                if (node2 && !node2.isTeam && node2.id) {
                    await Match.findByIdAndUpdate(node2.id, { next_match_id: newMatch._id });
                }

                nextRoundNodes.push({ isTeam: false, id: newMatch._id });
            }

            currentRoundNodes = nextRoundNodes;
            roundIndex++;
        }

        const io = req.app.get('io');
        const allMatches = await Match.find({ sport_id: sportId }).populate('participant1_id participant2_id sport_id');
        allMatches.forEach(m => io.emit('matchCreated', m));

        res.json({ message: 'Bracket generated successfully!', matches: allMatches });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/matches/:id', authenticate, authorizeSportAdmin, async (req, res) => {
    try {
        await Match.findByIdAndDelete(req.params.id);
        const io = req.app.get('io');
        io.emit('matchDeleted', req.params.id);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
