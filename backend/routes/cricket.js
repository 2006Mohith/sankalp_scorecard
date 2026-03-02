import express from 'express';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Match from '../models/Match.js';
import CricketState from '../models/CricketState.js';
import CricketBall from '../models/CricketBall.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'sankalp_super_secret_key_2026';

// Reusable Authentication & Authorization
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

const authorizeMatchWrite = async (req, res, next) => {
    if (req.admin.role === 'Master') return next();

    const matchId = req.params.matchId;
    const match = await Match.findById(matchId).populate('sport_id');
    if (!match) return res.status(404).json({ error: 'Match not found' });

    if (req.admin.role === 'SportAdmin') {
        if (req.admin.sport_id.toString() !== match.sport_id._id.toString()) {
            return res.status(403).json({ error: 'Forbidden: You control a different sport.' });
        }
        return next();
    }

    if (req.admin.role === 'MatchScorer') {
        const hasMatch = req.admin.assigned_matches.some(mId => mId.toString() === matchId);
        if (!hasMatch) {
            return res.status(403).json({ error: 'Forbidden: You are not assigned to this match.' });
        }
        return next();
    }

    return res.status(403).json({ error: 'Forbidden' });
};

// GET match state
router.get('/:matchId/state', async (req, res) => {
    try {
        let state = await CricketState.findOne({ match_id: req.params.matchId });
        if (!state) {
            state = await CricketState.create({ match_id: req.params.matchId });
        }
        const balls = await CricketBall.find({ match_id: req.params.matchId, isUndo: false }).sort({ createdAt: -1 }).limit(10);
        res.json({ state, recentBalls: balls });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all balls
router.get('/:matchId/balls', async (req, res) => {
    try {
        const balls = await CricketBall.find({ match_id: req.params.matchId, isUndo: false }).sort({ createdAt: 1 });
        res.json(balls);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// INIT details
router.post('/:matchId/init', authenticate, authorizeMatchWrite, async (req, res) => {
    try {
        const state = await CricketState.findOneAndUpdate(
            { match_id: req.params.matchId },
            { $set: req.body },
            { new: true, upsert: true }
        );
        const io = req.app.get('io');
        io.emit(`cricketUpdate-${req.params.matchId}`, state);
        io.emit('cricketStateUpdated', state);
        res.json(state);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST a delivery event
router.post('/:matchId/ball', authenticate, authorizeMatchWrite, async (req, res) => {
    try {
        let state = await CricketState.findOne({ match_id: req.params.matchId });
        if (!state) return res.status(400).json({ error: 'Initialize state first' });
        if (state.isLocked) return res.status(400).json({ error: 'Match is locked/completed.' });

        // Calculate runs
        let ballRuns = req.body.runsOffBat || 0;
        let extraRuns = req.body.extrasRuns || 0;
        let isLegal = true;

        if (req.body.extrasType === 'Wide' || req.body.extrasType === 'NoBall') {
            isLegal = false;
        }

        const newBall = new CricketBall({
            ...req.body,
            match_id: req.params.matchId,
            totalRunsForBall: ballRuns + extraRuns,
            isLegalDelivery: isLegal
        });
        await newBall.save();

        // Update active innings params
        const paramKey = state.currentInnings === 1 ? 'team1BattingParams' : 'team2BattingParams';

        state[paramKey].runs += newBall.totalRunsForBall;
        if (req.body.isWicket) state[paramKey].wickets += 1;

        if (isLegal) {
            state[paramKey].ballsFaced += 1;
            const fullOvers = Math.floor(state[paramKey].ballsFaced / 6);
            const remainingBalls = state[paramKey].ballsFaced % 6;
            state[paramKey].overs = parseFloat(`${fullOvers}.${remainingBalls}`);
        }

        await state.save();

        const io = req.app.get('io');
        io.emit(`cricketBall-${req.params.matchId}`, newBall);
        io.emit(`cricketUpdate-${req.params.matchId}`, state);
        io.emit('cricketStateUpdated', state);

        res.json({ state, newBall });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UNDO last delivery
router.post('/:matchId/undo', authenticate, authorizeMatchWrite, async (req, res) => {
    try {
        let state = await CricketState.findOne({ match_id: req.params.matchId });
        if (!state || state.isLocked) return res.status(400).json({ error: 'Cannot undo.' });

        // Find last valid ball
        const lastBall = await CricketBall.findOne({ match_id: req.params.matchId, isUndo: false }).sort({ createdAt: -1 });
        if (!lastBall) return res.status(400).json({ error: 'No balls to undo.' });

        const paramKey = state.currentInnings === 1 ? 'team1BattingParams' : 'team2BattingParams';

        state[paramKey].runs -= lastBall.totalRunsForBall;
        if (lastBall.isWicket) state[paramKey].wickets -= 1;

        if (lastBall.isLegalDelivery) {
            state[paramKey].ballsFaced -= 1;
            const fullOvers = Math.floor(state[paramKey].ballsFaced / 6);
            const remainingBalls = state[paramKey].ballsFaced % 6;
            state[paramKey].overs = parseFloat(`${fullOvers}.${remainingBalls}`);
        }

        lastBall.isUndo = true;
        await lastBall.save();
        await state.save();

        const io = req.app.get('io');
        io.emit(`cricketUndo-${req.params.matchId}`, lastBall._id);
        io.emit(`cricketUpdate-${req.params.matchId}`, state);
        io.emit('cricketStateUpdated', state);

        res.json({ success: true, state });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// LOCK match
router.post('/:matchId/lock', authenticate, authorizeMatchWrite, async (req, res) => {
    try {
        let state = await CricketState.findOne({ match_id: req.params.matchId }).populate('match_id');
        if (!state) return res.status(400).json({ error: 'Cannot lock.' });

        const match = await Match.findById(req.params.matchId).populate('participant1_id participant2_id sport_id');

        // Logic for determining winner
        let winnerId = null;
        if (state.team1BattingParams.runs > state.team2BattingParams.runs) {
            winnerId = state.tossDecision === 'Bat' ?
                (state.tossWinner === match.participant1_id.name ? match.participant1_id._id : match.participant2_id._id) :
                (state.tossWinner === match.participant1_id.name ? match.participant2_id._id : match.participant1_id._id);
        } else if (state.team2BattingParams.runs > state.team1BattingParams.runs) {
            winnerId = state.tossDecision === 'Bowl' ?
                (state.tossWinner === match.participant1_id.name ? match.participant1_id._id : match.participant2_id._id) :
                (state.tossWinner === match.participant1_id.name ? match.participant2_id._id : match.participant1_id._id);
        }

        state.isLocked = true;
        await state.save();

        match.status = 'Completed';
        match.winner = winnerId;
        await match.save();

        await match.populate('winner');

        const io = req.app.get('io');
        io.emit(`cricketUpdate-${req.params.matchId}`, state);
        io.emit('cricketStateUpdated', state);
        io.emit('matchUpdated', match);

        res.json({ success: true, state });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
