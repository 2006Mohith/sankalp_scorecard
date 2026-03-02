import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Player Name
    team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
    sport_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true, index: true },
    position: { type: String, default: 'Player' }
}, { timestamps: true });

// Prevent duplicate players within the same team
playerSchema.index({ name: 1, team_id: 1 }, { unique: true });

// Backend validation for sportId matching team's sportId
playerSchema.pre('save', async function (next) {
    const Team = mongoose.model('Team');
    const team = await Team.findById(this.team_id);

    if (!team) {
        return next(new Error('Validation Error: The specified team does not exist.'));
    }

    // Ensure the sportId matches exactly
    if (team.sport_id.toString() !== this.sport_id.toString()) {
        return next(new Error('Validation Error: Player’s sportId does not match the Team’s sportId. Cross-sport data mixing blocked.'));
    }

    next();
});

export default mongoose.model('Player', playerSchema);
