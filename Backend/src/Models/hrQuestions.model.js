import mongoose from "mongoose";

const hrQuestionsSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true
        },
        answer: {
            type: String,
            required: true
        },
        category: {
            type: String,
            enum: ['Policies', 'Performance', 'Benefits'],
            required: true
        }
    },
    { timestamps: true }
);

export const HrQuestion = mongoose.model("HrQuestion", hrQuestionsSchema);
