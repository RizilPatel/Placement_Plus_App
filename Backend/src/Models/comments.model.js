import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema(
    {
        alumniId: {
            type: Schema.Types.ObjectId,
            ref: "Alumni",
            required: true
        },
        companyName: {
            type: String,
            required: true
        },
        comment: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
)

export const Comment = mongoose.model("Comment", commentSchema)