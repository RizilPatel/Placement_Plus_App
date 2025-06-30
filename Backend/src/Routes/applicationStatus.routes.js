import { Router } from "express";
import { verifyAdmin, verifyJWT } from "../Middlewares/auth.middleware.js";
import { getAllApplicationStatus, getApplicationStatus } from "../Controllers/applicationStatus.controller.js";


const router = Router()

router.route("/get-application-status/c/:companyId").get(verifyJWT, getApplicationStatus)
router.route("/get-all-application-status").get(verifyJWT, getAllApplicationStatus)


export default router