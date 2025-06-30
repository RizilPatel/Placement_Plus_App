import mongoose from "mongoose"

const notificationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: [
            'new_company',
            'past_recruiter',
            'round_result',
            'event_update',
            'announcement',
            'resume_feedback',
            'placement_stats',
            'company_review',
            'eligibility_change',
            'interview_question',
            'admin_message'
        ],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    readBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
},
    { timestamps: true });

export const Notifications = mongoose.model('Notifications', notificationSchema);
