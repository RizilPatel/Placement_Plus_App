import { Router } from "express";
import { verifyJWT } from "../Middlewares/auth.middleware.js"
import { addReview, deleteReview, getReviewByCompany, getReviewByUser } from "../Controllers/companyReview.controller.js";

const router = Router()

router.use(verifyJWT)
router.route("/add-review").post(addReview)
router.route("/delete-review/c/:reviewId").delete(deleteReview)
router.route("/get-review-by-company/c/:companyName").get(getReviewByCompany)
router.route("/get-review-by-user").get(getReviewByUser)


export default router