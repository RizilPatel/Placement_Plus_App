import { Router } from "express";
import { verifyAdmin, verifyJWT } from "../Middlewares/auth.middleware.js"
import { addPlacedStudent, deletePlacedStudent, getAllPlacedStudents, getBranchPlacements, getCompanyPlacements, getRolePlacements, getStudentPlacement } from "../Controllers/placement.controller.js";

const router = Router()


router.route("/add-placed-student").post(verifyAdmin, addPlacedStudent)
router.route("/get-student-placement/c/:studentId").get(verifyAdmin, getStudentPlacement)
router.route("/get-all-student-placement").get(verifyJWT, getAllPlacedStudents)
router.route("/get-company-placement/c/:companyName").get(verifyAdmin, getCompanyPlacements)
router.route("/get-role-placement/c/:role").get(verifyAdmin, getRolePlacements)
router.route("/get-branch-placement/c/:branch").get(verifyAdmin, getBranchPlacements)
router.route("/delete-record/c/:studentId").delete(verifyAdmin, deletePlacedStudent)



export default router