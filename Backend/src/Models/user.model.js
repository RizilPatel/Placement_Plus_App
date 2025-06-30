import mongoose, { Schema } from "mongoose"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.'],
        },
        rollNo: {
            type: Number,
            required: true,
            unique: true,
            trim: true,
            match: [/^\d{7}$/, 'roll number must be exactly 7 digits.'],
            index: true
        },
        mobileNo: {
            type: Number,
            required: true,
            unique: true,
            trim: true,
            match: [/^\d{10}$/, 'roll number must be exactly 10 digits.']
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        branch: {
            type: String,
            required: true,
            enum: ['CSE', 'ECE', 'EE', 'ME', 'CE', 'VLSI', 'CAD/CAM']
        },
        semester: {
            type: Number,
            required: true,
            min: 1,
            max: 8
        },
        batch: {
            type: Number,
            required: true
        },
        CGPA: {
            type: Number,
            required: true,
            min: 0,
            max: 10
        },
        internshipEligible: {
            type: Boolean,
            default: true,
        },
        fullTimeEligible: {
            type: Boolean,
            default: true
        },
        slab: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
            max: 4
        },
        resumeLink: {
            type: String,
            required: true,
            unique: true
        },
        course: {
            type: String,
            enum: ["B.Tech", "M.Tech"],
            required: true
        },
        refreshToken: {
            type: String
        },
        notificationPushToken: {
            type: String
        },
        appliedCompanies: [{
            companyId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "UpcomingCompany"
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
        }],
        otp: String,
        otpExpiry: Date
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next()
    }

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    console.log(await bcrypt.hash(password, 10));
    console.log(this.password);


    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {   //payload
            _id: this._id,
            email: this.email,
            name: this.name,
            rollNo: this.rollNo
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {   //payload
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)