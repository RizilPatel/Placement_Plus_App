import { Router } from "express";
import { verifyAdmin, verifyJWT } from "../Middlewares/auth.middleware.js"
import { addQuestion, deleteQuestion, getAllQuestions, updateQuestion } from "../Controllers/hrQuestion.controller.js";


const router = Router()

router.route("/get-all-questions").get(verifyJWT, getAllQuestions)
router.route("/add-question").post(verifyAdmin, addQuestion)
router.route("/update-question/c/:questionId").patch(verifyAdmin, updateQuestion)
router.route("/delete-question/c/:questionId").delete(verifyAdmin, deleteQuestion)


export default router