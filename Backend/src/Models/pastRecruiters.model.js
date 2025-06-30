import mongoose, { Schema } from 'mongoose'

const RoleSchema = new Schema({
    roleName: {
        type: String,
        required: true
    },
    opportunityType: {
        type: String,
        enum: ['Internship', 'Full Time', 'Internship + Full Time'],
        required: true
    },
    stipend: {
        type: String,
    },
    CTC: {
        type: String
    },
    year: {
        type: String,
        required: true
    }
});

const PastRecruiterSchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    eligibleBranches: {
        type: [String],
        required: true,
        enum: ['CSE', 'EE', 'ECE', 'ME', 'CE', 'VLSI']
    },
    roles: {
        type: [RoleSchema],
        required: true
    },
    recruitedStudents: {
        type: Number,
        required: true
    }
}, { timestamps: true });

export const PastRecruiters = mongoose.model("PastRecruiters", PastRecruiterSchema)