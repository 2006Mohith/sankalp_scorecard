import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    sport_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true, index: true },
    type: { type: String, enum: ['Team', 'Individual'], default: 'Team' },
}, { timestamps: true });

// Prevent duplicate team names within the same sport
teamSchema.index({ name: 1, sport_id: 1 }, { unique: true });

// Validation to ensure sport_id actually exists
teamSchema.pre('save', async function (next) {
    const Sport = mongoose.model('Sport');
    const sportExists = await Sport.exists({ _id: this.sport_id });
    if (!sportExists) {
        return next(new Error('Validation Error: The specified sport_id does not exist.'));
    }
    next();
});

export default mongoose.model('Team', teamSchema);
