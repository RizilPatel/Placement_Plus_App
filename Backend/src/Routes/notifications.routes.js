import { Router } from "express";
import { verifyAdmin, verifyJWT } from "../Middlewares/auth.middleware.js"
import { getNotifications, markAsRead } from "../Controllers/notifications.controller.js";

const router = Router()

router.route("/get-notifications").get(verifyJWT, getNotifications)
router.route("/mark-notification/c/:notificationId").put(verifyJWT, markAsRead)

export default router