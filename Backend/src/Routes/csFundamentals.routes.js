import { Router } from "express";
import { upload } from "../Middlewares/multer.middleware.js"
import { verifyJWT, verifyAdmin } from "../Middlewares/auth.middleware.js";
import { addPdf, getAllPdf, getPdf } from "../Controllers/csFundamentals.controller.js";

const router = Router()

router.route("/add-pdf").post(verifyAdmin,
    upload.fields([{ name: "pdf", maxCount: 1 }]),
    addPdf
);
router.route("/get-pdf/c/:fileId").get(verifyJWT, getPdf)
router.route("/get-all-pdf").get(verifyJWT, getAllPdf)

export default router