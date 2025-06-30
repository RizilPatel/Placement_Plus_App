import ApiError from "../Utils/ApiError.js";
import ApiResponse from "../Utils/ApiResponse.js";
import asyncHandler from "../Utils/AsyncHandler.js";
import { Expo } from "expo-server-sdk"

const expo = new Expo()

const sendWelcomeNotification = asyncHandler(async (req, res) => {
    const { pushToken, message } = req.body
    if (!pushToken || !Expo.isExpoPushToken(pushToken))
        throw new ApiError(400, "Invalid push token")

    const messageFormat = [
        {
            to: pushToken,
            sound: "default",
            title: "Welcome to Placement Plus!",
            body: message || "Thank you for signing up! 🎉",
            data: {}
        }
    ]

    try {
        const ticket = await expo.sendPushNotificationsAsync(messageFormat);
        console.log("Notification Sent:", ticket);
        res.json({ success: true, ticket });
    } catch (error) {
        console.error("Error sending notification:", error);
        res.status(500).json({ error: "Failed to send notification" });
    }

})

export { sendWelcomeNotification }