import { Router } from "express";
import { verifyJWT } from "../Middlewares/auth.middleware.js"
import { getFinalResumeScore, getResumeSuggestion, parseResume } from "../Controllers/resume.controller.js";
import { upload } from "../Middlewares/multer.middleware.js"


const router = Router()

router.use(verifyJWT)
router.route("/parse-resume").get(upload.fields([{ name: "resume", maxCount: 1 }]), parseResume)
router.route("/get-resume-score").get(getFinalResumeScore)
router.route("/get-resume-suggestion").get(getResumeSuggestion)


export default router