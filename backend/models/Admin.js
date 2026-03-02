import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Master', 'SportAdmin', 'MatchScorer'], default: 'Master' },
    sport_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', default: null }, // Only for SportAdmins
    assigned_matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }] // Only for MatchScorers
});

adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

export default mongoose.model('Admin', adminSchema);
