import { Router } from "express";
import { verifyAdmin, verifyJWT } from "../Middlewares/auth.middleware.js"
import { addPastRecruiter, getAllRecruiter, getRecruiterById } from "../Controllers/pastRecruiters.controller.js";

const router = Router()

router.route("/add-past-recruiter").post(verifyAdmin, addPastRecruiter)
router.route("/get-all-recruiter").get(verifyJWT, getAllRecruiter)
router.route("/get-recruiter/c/:companyId").get(verifyJWT, getRecruiterById)

export default router