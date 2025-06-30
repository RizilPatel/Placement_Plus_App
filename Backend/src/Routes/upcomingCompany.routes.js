import { Router } from "express";
import { verifyAdmin, verifyJWT } from "../Middlewares/auth.middleware.js";
import { addCompany, getCompanyById } from "../Controllers/upcomingCompany.controller.js";
import { applyToCompany, getAllAppliedCompany, listAllCompany, withdrawApplication } from "../Controllers/upcomingCompany.controller.js"


const router = Router()

router.route("/add-company").post(verifyAdmin, addCompany)
router.route("/apply-to-company/c/:companyId").patch(verifyJWT, applyToCompany)
router.route("/get-company-details").get(verifyJWT, getAllAppliedCompany)
router.route("/list-all-company").get(verifyJWT, listAllCompany)
router.route("/list-all-company-for-admin").get(verifyAdmin, listAllCompany)
router.route("/get-details/c/:companyId").get(verifyJWT, getCompanyById)
router.route("/withdraw-application/c/:companyId").patch(verifyJWT, withdrawApplication)



export default router