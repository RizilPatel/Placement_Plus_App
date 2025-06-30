import { Question } from "../Models/question.model.js";
import ApiError from "../Utils/ApiError.js";
import ApiResponse from "../Utils/ApiResponse.js";
import asyncHandler from "../Utils/AsyncHandler.js";

const addQuestion = asyncHandler(async (req, res) => {
    const { name, description, difficulty, link, companyName } = req.body;

    if (!name || !description || !difficulty || !companyName) {
        throw new ApiError(400, "All details are required");
    }

    let question = await Question.findOne({ name });

    if (question) {
        if (!question.askedBy.includes(companyName)) {
            question.askedBy.push(companyName);
            await question.save();
        }
    } else {
        question = await Question.create({
            name,
            description,
            difficulty,
            link,
            askedBy: [companyName],
        });
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            question,
            "Question added/updated successfully"
        )
    );
});

const getAllQuestions = asyncHandler(async (req, res) => {
    const questions = await Question.find()
    if (questions.length === 0) {
        throw new ApiError(404, "No questions found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            questions,
            "Questions fetched successfully"
        )
    )
})

const getCompanyQuestions = asyncHandler(async (req, res) => {
    const { companyName } = req.params
    if (!companyName)
        throw new ApiError(400, "Company name is required")

    const questions = await Question.find({ askedBy: { $in: [companyName] } })

    return res.status(200).json(
        new ApiResponse(
            200,
            questions,
            "Questions fetched successfully"
        )
    )
})

export {
    addQuestion,
    getAllQuestions,
    getCompanyQuestions
}