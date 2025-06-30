import mongoose, { Schema } from "mongoose";

const placedStudentSchema = new Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        companyName: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true
        },
        ctc: {
            type: String
        },
        stipend: {
            type: String,
        },
        jobLocation: {
            type: String,
            required: true
        },
        branch: {
            type: String,
            enum: ['CSE', 'ECE', 'EE', 'ME', 'CE', 'VLSI', 'CAD/CAM'],
            required: true
        },
        placementType: {
            type: String,
            enum: ["Internship", "Full Time", "Internship + Full Time"],
            required: true
        },
    },
    { timestamps: true }
)

export const PlacedStudent = mongoose.model("PlacedStudent", placedStudentSchema)