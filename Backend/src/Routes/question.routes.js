import { Router } from "express";
import { verifyAdmin, verifyJWT } from "../Middlewares/auth.middleware.js"
import { addQuestion, getAllQuestions, getCompanyQuestions } from "../Controllers/question.controller.js";

const router = Router()

router.route("/add-question").post(verifyAdmin, addQuestion)
router.route("/get-all-questions").get(verifyJWT, getAllQuestions)
router.route("/get-company-questions/c/:companyName").get(verifyJWT, getCompanyQuestions)



export default router