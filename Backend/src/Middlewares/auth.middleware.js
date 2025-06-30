import { User } from "../Models/user.model.js";
import ApiError from "../Utils/ApiError.js";
import asyncHandler from "../Utils/AsyncHandler.js";
import jwt from "jsonwebtoken";
import { Admin } from "../Models/admin.model.js";
import { Alumni } from "../Models/alumni.model.js"

// const verifyJWT = asyncHandler(async (req, _, next) => {
//     try {
//         const token = req.headers.authorization.split(" ")[1]
//         if (!token)
//             throw new ApiError(401, "Unauthorized request")

//         const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

//         const user = await User.findById(decodedToken._id).select(" -password -refreshToken")
//         if (!user)
//             throw new ApiError(401, "invalid access token")

//         req.user = user
//         next()
//     } catch (error) {
//         throw new ApiError(401, error?.message || "Unauthorized request")
//     }
// })

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) throw new ApiError(401, "Unauthorized request");

        const token = authHeader.split(" ")[1];
        if (!token) throw new ApiError(401, "Unauthorized request");

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                const refreshToken = req.headers["x-refresh-token"];
                if (!refreshToken) throw new ApiError(401, "Refresh token required");

                let decodedRefreshToken;
                try {
                    decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                } catch (refreshError) {
                    throw new ApiError(403, "Invalid or expired refresh token");
                }

                const user = await User.findById(decodedRefreshToken._id).select("-password -refreshToken");
                if (!user) throw new ApiError(401, "Invalid refresh token");

                const newAccessToken = await user.generateAccessToken()
                const newRefreshToken = await user.generateRefreshToken()

                user.refreshToken = newRefreshToken
                await user.save({ validateBeforeSave: false })

                res.setHeader("x-access-token", newAccessToken);

                req.user = user;
                return next();
            } else {
                throw new ApiError(401, "Invalid access token");
            }
        }

        const user = await User.findById(decodedToken._id).select("-password -refreshToken");
        if (!user) throw new ApiError(401, "Invalid access token");

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized request");
    }
});

const verifyAdmin = asyncHandler(async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) throw new ApiError(401, "Unauthorized request");

        const token = authHeader.split(" ")[1];
        if (!token) throw new ApiError(401, "Unauthorized request");

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                const refreshToken = req.headers["x-refresh-token"];
                if (!refreshToken) throw new ApiError(401, "Refresh token required");

                let decodedRefreshToken;
                try {
                    decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                } catch (refreshError) {
                    throw new ApiError(403, "Invalid or expired refresh token");
                }

                const admin = await Admin.findById(decodedRefreshToken._id).select("-password -refreshToken");
                if (!admin) throw new ApiError(401, "Invalid refresh token");

                const newAccessToken = await admin.generateAccessToken()
                const newRefreshToken = await admin.generateRefreshToken()

                admin.refreshToken = newRefreshToken
                await admin.save({ validateBeforeSave: false })

                res.setHeader("x-access-token", newAccessToken);

                req.admin = admin;
                return next();
            } else {
                throw new ApiError(401, "Invalid access token");
            }
        }

        const admin = await Admin.findById(decodedToken._id).select("-password -refreshToken");
        if (!admin) throw new ApiError(401, "Invalid access token");

        req.admin = admin;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized request");
    }
});

const verifyAlumni = asyncHandler(async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) throw new ApiError(401, "Unauthorized request");

        const token = authHeader.split(" ")[1];
        if (!token) throw new ApiError(401, "Unauthorized request");

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                const refreshToken = req.headers["x-refresh-token"];
                if (!refreshToken) throw new ApiError(401, "Refresh token required");

                let decodedRefreshToken;
                try {
                    decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                } catch (refreshError) {
                    throw new ApiError(403, "Invalid or expired refresh token");
                }

                const alumni = await Alumni.findById(decodedRefreshToken._id).select("-password -refreshToken");
                if (!alumni) throw new ApiError(401, "Invalid refresh token");

                const newAccessToken = await alumni.generateAccessToken()
                const newRefreshToken = await alumni.generateRefreshToken()

                alumni.refreshToken = newRefreshToken
                await alumni.save({ validateBeforeSave: false })

                res.setHeader("x-access-token", newAccessToken);

                req.alumni = alumni;
                return next();
            } else {
                throw new ApiError(401, "Invalid access token");
            }
        }

        const alumni = await Alumni.findById(decodedToken._id).select("-password -refreshToken");
        if (!alumni) throw new ApiError(401, "Invalid access token");

        req.alumni = alumni;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized request");
    }
});

export { verifyJWT, verifyAdmin, verifyAlumni }