import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
    sport_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true },
    participant1_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    participant2_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    score1: { type: Number, default: 0 },
    score2: { type: Number, default: 0 },
    status: { type: String, enum: ['Upcoming', 'Live', 'Completed'], default: 'Upcoming' },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },

    // Bracket Positioning
    stage: { type: String, default: 'Group Stage' }, // e.g., 'Quarter Final', 'Semi Final', 'Final'
    round_index: { type: Number, default: 0 }, // 0 = lowest round, etc.
    match_index: { type: Number, default: 0 }, // Position top-to-bottom within the round column
    next_match_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', default: null },
    previousMatchA_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', default: null },
    previousMatchB_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', default: null },
}, { timestamps: true });

export default mongoose.model('Match', matchSchema);
