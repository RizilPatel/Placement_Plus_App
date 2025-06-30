import mongoose, { Schema } from "mongoose";

const PlacementStatisticsSchema = new Schema(
    {
        branch: {
            type: String,
            enum: ['CSE', 'ECE', 'EE', 'ME', 'CE', 'VLSI', 'CAD/CAM'],
            required: true
        },
        avgPackage: {
            type: Number,
            required: true
        },
        medianPackage: {
            type: Number,
            required: true
        },
        maxPackage: {
            type: Number,
            required: true
        },
        totalStudents: {
            type: Number,
            required: true
        },
        placedStudents: {
            type: Number,
            required: true
        },
        ctcValues: [{
            ctc: {
                type: Number,
                required: true
            },
            month: {
                type: String,
                required: true,
                enum: [
                    "January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ]
            }
        }]
    },
    { timestamps: true }
)

export const PlacementStatistics = mongoose.model("PlacementStatistics", PlacementStatisticsSchema)