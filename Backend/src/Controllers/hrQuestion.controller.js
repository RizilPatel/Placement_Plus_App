import ApiError from "../Utils/ApiError.js";
import ApiResponse from "../Utils/ApiResponse.js";
import asyncHandler from "../Utils/AsyncHandler.js";
import { HrQuestion } from "../Models/hrQuestions.model.js";

const addQuestion = asyncHandler(async (req, res) => {
    const { question, answer, category } = req.body
    if (!question || !answer || !category)
        throw new ApiError(400, "Question and answer is required")

    const existedQuestion = await HrQuestion.findOne({ question })
    if (existedQuestion)
        throw new ApiError(401, "Question already exist")

    const createdQuestion = await HrQuestion.create({
        question,
        answer,
        category
    })

    const newQuestion = await HrQuestion.findById(createdQuestion._id)
    if (!newQuestion)
        throw new ApiError(500, "Something went wrong while adding question")

    return res.status(200).json(
        new ApiResponse(
            200,
            newQuestion,
            "Question added successfully"
        )
    )
})

const deleteQuestion = asyncHandler(async (req, res) => {
    const { questionId } = req.params
    if (!questionId)
        throw new ApiError(400, "Question Id required")

    const deletedQuestion = await HrQuestion.findByIdAndDelete(questionId)
    if (deletedQuestion)
        throw new ApiError(404, "Question not found")

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Question deleted successfully"
        )
    )
})

const updateQuestion = asyncHandler(async (req, res) => {
    const { questionId } = req.params
    if (!questionId)
        throw new ApiError(400, "Question Id required")

    const { question, answer } = req.body
    if (!question || !answer)
        throw new ApiError(400, "Question and answer is required")

    const newDetails = {}
    if (question)
        newDetails.question = question
    if (answer)
        newDetails.answer = answer

    const updatedQuestion = await HrQuestion.findByIdAndDelete(questionId, newDetails)
    if (updatedQuestion)
        throw new ApiError(404, "Question not found")

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedQuestion,
            "Question updated successfully"
        )
    )
})

const getAllQuestions = asyncHandler(async (req, res) => {
    const questions = await HrQuestion.find()
    if (questions.length === 0)
        throw new ApiError(404, "Questions not found")

    return res.status(200).json(
        new ApiResponse(
            200,
            questions,
            "All questions fetch successfully"
        )
    )

})

export { addQuestion, deleteQuestion, updateQuestion, getAllQuestions }