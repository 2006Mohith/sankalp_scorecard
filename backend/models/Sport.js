import mongoose from 'mongoose';

const sportSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, enum: ['Men', 'Women', 'Mixed'], required: true },
    duration: { type: String, default: 'N/A' },
    teamSize: { type: Number, default: 1 } // To distinguish individual vs team if needed
}, { timestamps: true });

export default mongoose.model('Sport', sportSchema);
