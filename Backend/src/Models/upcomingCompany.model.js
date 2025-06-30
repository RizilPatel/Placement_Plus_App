import mongoose from "mongoose";

const upcomingCompanySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: true,
        maxlength: 255
    },
    eligibleBranches: {
        type: [String],
        required: true
    },
    eligibleBatch: {
        type: [Number],
        required: true,
    },
    ctc: {
        type: String,
    },
    stipend: {
        type: String
    },
    role: {
        type: String,
        required: true,
        maxlength: 255
    },
    hiringProcess: {
        type: String,
        required: true
    },
    cgpaCriteria: {
        type: Number,
        required: true,
        validate: {
            validator: function (value) {
                return value >= 0 && value <= 10;
            },
            message: "CGPA must be between 0 and 10"
        }
    },
    jobLocation: {
        type: String,
        required: true,
        maxlength: 255
    },
    schedule: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        enum: ["On-Site", "Of-Site", "Hybrid"],
        required: true
    },
    opportunityType: {
        type: String,
        enum: ["Internship", "Full Time", "Internship + Full Time"],
        required: true
    },
    extraDetails: {
        type: String
    },
    pocDetails: {
        name: {
            type: String,
            required: true
        },
        contactNo: {
            type: Number,
            required: true,
            maxLength: 10,
            minLength: 10
        }
    },
    appliedStudents: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        applicationStatus: {
            type: String,
            enum: ["Applied", "Shortlisted", "Rejected", "Selected"],
            default: "Applied"
        },
        applicationDate: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

export const UpcomingCompany = mongoose.model("UpcomingCompany", upcomingCompanySchema);
