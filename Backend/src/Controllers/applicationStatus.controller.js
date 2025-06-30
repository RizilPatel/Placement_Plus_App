import ApiError from '../Utils/ApiError.js'
import ApiResponse from '../Utils/ApiResponse.js'
import asyncHandler from '../Utils/AsyncHandler.js'
import { ApplicationStatus } from '../Models/applicationStatus.model.js'

const getApplicationStatus = asyncHandler(async (req, res) => {
    const { companyId } = req.params
    if (!companyId)
        throw new ApiError(400, "Company Id is required")

    const applicationStatus = await ApplicationStatus.findOne({
        studentId: req.user._id,
        companyId
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            applicationStatus,
            "Application Status find successfully"
        )
    )
})

const getAllApplicationStatus = asyncHandler(async (req, res) => {
    const applicationStatuses = await ApplicationStatus.aggregate([
        [
            {
                $match: {
                    studentId: req.user._id
                }
            },
            {
                $lookup: {
                    from: "upcomingcompanies",
                    localField: "companyId",
                    foreignField: "_id",
                    as: "companyDetails"
                }
            },
            {
                $unwind: "$companyDetails"
            }
        ]

    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            applicationStatuses,
            "Application status is fetched successfully"
        )
    )
})

export { getApplicationStatus, getAllApplicationStatus }