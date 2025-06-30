import { Comment } from "../Models/comments.model.js";
import ApiError from "../Utils/ApiError.js";
import ApiResponse from "../Utils/ApiResponse.js";
import asyncHandler from "../Utils/AsyncHandler.js";

const addComment = asyncHandler(async (req, res) => {
    const { companyName, commentText } = req.body
    if (!companyName || !commentText)
        throw new ApiError(400, "All details are required")

    const newComment = await Comment.create({
        alumniId: req.alumni._id,
        companyName,
        comment: commentText
    })

    const commentDetails = await Comment.findById(newComment._id)
    if (!commentDetails)
        throw new ApiError(500, "Something went wrong while adding comment")

    return res.status(200).json(
        new ApiResponse(
            200,
            commentDetails,
            "Comment added successfully"
        )
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!commentId)
        throw new ApiError(400, "Comment id is required")

    const existedComment = await Comment.findById(commentId)
    if (!existedComment)
        throw new ApiError(404, "Comment does not exist")
    if (existedComment.alumniId !== req.alumni._id)
        throw new ApiError(401, "You are not authorized to delete this comment")

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Comment deleted successfully"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!commentId) throw new ApiError(400, "Comment id is required");

    const { companyName, commentText } = req.body;
    if (!companyName && !commentText)
        throw new ApiError(400, "Company name or Comment is required");

    const existedComment = await Comment.findById(commentId);
    if (!existedComment) throw new ApiError(404, "Comment does not exist");

    if (!existedComment.alumniId.equals(req.alumni._id))
        throw new ApiError(403, "You are not authorized to update this comment");

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { $set: { ...(companyName && { companyName }), ...(commentText && { comment: commentText }) } },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
    );
});

export {
    addComment,
    deleteComment,
    updateComment
}