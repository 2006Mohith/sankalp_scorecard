import mongoose from 'mongoose';

const cricketStateSchema = new mongoose.Schema({
    match_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true, unique: true },
    currentInnings: { type: Number, default: 1, enum: [1, 2, 3, 4] },
    tossWinner: { type: String, default: null },
    tossDecision: { type: String, enum: ['Bat', 'Bowl', null], default: null },

    // Innings 1 Summary
    team1BattingParams: {
        runs: { type: Number, default: 0 },
        wickets: { type: Number, default: 0 },
        overs: { type: Number, default: 0 }, // Represented as standard balls like 1.4
        ballsFaced: { type: Number, default: 0 } // Easy for calculating actual balls
    },

    // Innings 2 Summary
    team2BattingParams: {
        runs: { type: Number, default: 0 },
        wickets: { type: Number, default: 0 },
        overs: { type: Number, default: 0 },
        ballsFaced: { type: Number, default: 0 }
    },

    // Current State specific
    currentStriker: { type: String, default: null },
    currentNonStriker: { type: String, default: null },
    currentBowler: { type: String, default: null },

    target: { type: Number, default: null },
    isLocked: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('CricketState', cricketStateSchema);
