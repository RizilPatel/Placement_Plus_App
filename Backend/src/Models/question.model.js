import mongoose, { Schema } from "mongoose"

const questionSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Hard"],
        required: true
    },
    link: {
        type: String,
    },
    askedBy: [{
        type: String,
        required: true
    }]
})

export const Question = mongoose.model("Question", questionSchema)