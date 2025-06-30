import mongoose, { Schema } from "mongoose";

const applicationSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "UpcomingCompany",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "Applied",
        "Under Review",
        "Shortlisted",
        "Rejected",
        "Selected",
        "Interview Scheduled",
        "Interviewed",
        "Offer Received",
        "Offer Accepted",
        "Offer Declined",
        "Withdrawn",
      ],
      default: "Applied",
    },
  },
  { timestamps: true }
);

// applicationSchema.index({ studentId: 1, companyId: 1 }, { unique: true });

export const ApplicationStatus = mongoose.model("ApplicationStatus", applicationSchema);
