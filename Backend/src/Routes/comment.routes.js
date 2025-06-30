import { Router } from "express";
import { verifyAlumni } from "../Middlewares/auth.middleware.js"
import { addComment, deleteComment, updateComment } from "../Controllers/comments.controller.js";

const router = Router()

router.use(verifyAlumni)
router.route("/add-comment").post(addComment)
router.route("/update-comment/c/:commentId").patch(updateComment)
router.route("/delete-comment/c/:commentId").delete(deleteComment)


export default router