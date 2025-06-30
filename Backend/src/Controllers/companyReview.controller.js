import { CompanyReview } from "../Models/companyReview.model.js";
import ApiError from "../Utils/ApiError.js";
import ApiResponse from "../Utils/ApiResponse.js";
import asyncHandler from "../Utils/AsyncHandler.js";

const addReview = asyncHandler(async (req, res) => {
    const { companyName, review, rating } = req.body
    if (!companyName || !review || !rating)
        throw new ApiError(400, "Company name, review and rating is required")

    const newReview = await CompanyReview.create({
        companyName,
        review,
        rating,
        reviewedBy: req.admin._id
    })

    const createdReview = await CompanyReview.findById(newReview._id)
    if (!createdReview)
        throw new ApiError(500, "Something went wrong while adding review")

    return res.status(200).json(
        new ApiResponse(
            200,
            createdReview,
            "Review added succesfully"
        )
    )
})

const getReviewByCompany = asyncHandler(async (req, res) => {
    const { companyName } = req.params
    if (!companyName)
        throw new ApiError(400, "Company name is required")

    const reviews = await CompanyReview.find({ companyName })
    if (reviews.length === 0)
        throw new ApiError(500, `Reviews not found for ${companyName}`)

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    return res.status(200).json(
        new ApiResponse(
            200,
            { reviews, avgRating: avgRating.toFixed(1) },
            "Reviews fetched successfully"
        )
    )
})

const getReviewByUser = asyncHandler(async (req, res) => {
    const { userId } = req.body
    if (!userId)
        throw new ApiError(400, "User Id is required")

    const reviews = await CompanyReview.find({ reviewedBy: userId })
    if (reviews.length === 0)
        throw new ApiError(500, `User has not given any review`)

    return res.status(200).json(
        new ApiResponse(
            200,
            reviews,
            "Reviews fetched successfully"
        )
    )
})

const deleteReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    if (!reviewId)
        throw new ApiError(400, "Review ID is required");

    const review = await CompanyReview.findById(reviewId);
    if (!review)
        throw new ApiError(404, "Review does not exist");

    if (!review.reviewedBy.equals(req.user._id))
        throw new ApiError(401, "You are not authorized to delete this review");

    await CompanyReview.findByIdAndDelete(reviewId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Review deleted successfully")
    );
});


export {
    addReview,
    getReviewByCompany,
    getReviewByUser,
    deleteReview
}