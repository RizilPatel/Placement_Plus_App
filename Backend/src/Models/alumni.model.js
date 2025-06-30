import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'

// code for schema is written 
const alumniSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    linkedInId: {
        type: String,
        required: true,
        unique: true
    },
    profilePicId: {
        type: String,
        required: true
    },
    batch: {
        type: Number,
        required: true
    },
    previousCompany: [{
        name: {
            type: String,
            trim: true
        },
        Position: {
            type: String
        },
        Duration: {
            type: Number
        },
        Experience: {
            type: String
        }
    }],
    currentCompany: {
        name: {
            type: String,
            required: true
        },
        position: {
            type: String,
            required: true
        }
    },
    refreshToken: {
        type: String
    }
}
)

alumniSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        next()

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

alumniSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

alumniSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {   //payload
            _id: this._id,
            email: this.email,
            name: this.name,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

alumniSchema.methods.generateRefreshToken = function () {
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

export const Alumni = mongoose.model("Alumni", alumniSchema)