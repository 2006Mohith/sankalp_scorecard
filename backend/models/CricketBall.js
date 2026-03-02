import mongoose from 'mongoose';

const cricketBallSchema = new mongoose.Schema({
    match_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
    innings: { type: Number, required: true },
    overNumber: { type: Number, required: true }, // 0 for first over, 1 for second, etc.
    ballNumberInOver: { type: Number, required: true }, // Typically 1 to 6 (but can be more if wide/noball)

    strikerName: { type: String, required: true },
    nonStrikerName: { type: String, required: true },
    bowlerName: { type: String, required: true },

    runsOffBat: { type: Number, default: 0 },
    extrasType: { type: String, enum: ['Wide', 'NoBall', 'Bye', 'LegBye', 'None'], default: 'None' },
    extrasRuns: { type: Number, default: 0 },

    totalRunsForBall: { type: Number, default: 0 }, // For faster math

    isLegalDelivery: { type: Boolean, default: true },

    isWicket: { type: Boolean, default: false },
    wicketType: { type: String, enum: ['Bowled', 'Caught', 'LBW', 'RunOut', 'Stumped', 'HitWicket', 'None'], default: 'None' },
    fielderName: { type: String, default: null }, // For catch/runout
    batsmanDismissed: { type: String, default: null },

    isUndo: { type: Boolean, default: false }, // If true, this ball is invalid and was undone
}, { timestamps: true });

export default mongoose.model('CricketBall', cricketBallSchema);
