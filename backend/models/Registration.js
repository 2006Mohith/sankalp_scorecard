import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    year: { type: String, required: true },
    branch: { type: String, required: true },
    section: { type: String, required: true },
    hallTicket: { type: String, required: true, uppercase: true, trim: true },
    sportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true },
    sportName: { type: String, required: true }
}, { timestamps: true });

// Function to dynamically get or create a Mongoose model for a specific sport's registration collection
export const getRegistrationModel = (sportName) => {
    // Sanitize sport name for collection (e.g., lowercase, replace spaces with hyphens)
    const sanitizedSportName = sportName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const collectionName = `${sanitizedSportName}-registrations`;
    const modelName = `Registration_${sanitizedSportName}`;

    // Return existing model if already compiled, to prevent Mongoose overwrite errors
    if (mongoose.models[modelName]) {
        return mongoose.models[modelName];
    }

    // Create new dynamic model pointing to the customized collection name
    return mongoose.model(modelName, registrationSchema, collectionName);
};

const adminSportSchema = new mongoose.Schema({
    name: { type: String, required: true },
    hallTicket: { type: String, required: true },
    sportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sport', required: true },
    sportName: { type: String, required: true },
    year: { type: String },
    branch: { type: String },
    section: { type: String },
    isAssignedToTeam: { type: Boolean, default: false } // Helps admins know who has been drafted
}, { timestamps: true });

export const getAdminSportModel = (sportName) => {
    const sanitizedSportName = sportName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const collectionName = `${sanitizedSportName}-admin`;
    const modelName = `AdminSport_${sanitizedSportName}`;

    if (mongoose.models[modelName]) {
        return mongoose.models[modelName];
    }

    return mongoose.model(modelName, adminSportSchema, collectionName);
};
