import mongoose, { Schema } from "mongoose";

const companyReviewSchema = new Schema(
    {
        companyName: {
            type: String,
            required: true
        },
        review: {
            type: String,
            Required: true
        },
        rating: {
            type: Number,
            min: 0,
            max: 5
        },
        reviewedBy: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: true
        }
    },
    { timestamps: true }
)

export const CompanyReview = mongoose.model("CompanyReview", companyReviewSchema)