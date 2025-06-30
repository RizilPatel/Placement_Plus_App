import { PlacementStatistics } from "../Models/placementStatistics.model.js";
import ApiError from "../Utils/ApiError.js";
import ApiResponse from "../Utils/ApiResponse.js";
import asyncHandler from "../Utils/AsyncHandler.js";


const getPlacementStatistics = asyncHandler(async (req, res) => {
    const placementStatistics = await PlacementStatistics.find()
    if (!placementStatistics)
        throw new ApiError(404, "Placement statistics not found")

    return res.status(200).json(
        new ApiResponse(
            200,
            placementStatistics,
            "Placement statistics fetched successfully"
        )
    )
})

const getBranchPlacementStatistics = asyncHandler(async (req, res) => {
    const { branch } = req.params
    if (!branch)
        throw new ApiError(400, "Branch name is required")

    const placementStatistics = await PlacementStatistics.findOne({ branch })
    if (!placementStatistics)
        throw new ApiError(404, "Branch placement statistics not found")

    return res.status(200).json(
        new ApiResponse(
            200,
            placementStatistics,
            "Branch placement statistics fetched successfully"
        )
    )
})

export {
    getPlacementStatistics,
    getBranchPlacementStatistics
}