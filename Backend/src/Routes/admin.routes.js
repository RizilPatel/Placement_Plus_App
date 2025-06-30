import { Router } from "express";
import { changePassword, exportStudentDatatoExcel, exportToExcel, exportToPDF, loginAdmin, logoutAdmin, registerAdmin } from "../Controllers/admin.controller.js";
import { verifyAdmin } from "../Middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(registerAdmin)
router.route("/login").post(loginAdmin)
router.route("/logout").post(verifyAdmin, logoutAdmin)
router.route("/change-password").patch(verifyAdmin, changePassword)
router.route("/export-to-pdf").get(verifyAdmin, exportToPDF)
router.route("/export-to-excel").get(verifyAdmin, exportToExcel)
router.route("/export-student-data-to-excel/c/:companyId").get(verifyAdmin, exportStudentDatatoExcel)


export default router