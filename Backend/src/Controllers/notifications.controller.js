import ApiError from '../Utils/ApiError.js'
import ApiResponse from '../Utils/ApiResponse.js'
import asyncHandler from '../Utils/AsyncHandler.js'
import { Notifications } from '../Models/notifications.model.js'

const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notifications.find()

    return res.status(200).json(
        new ApiResponse(
            200,
            notifications,
            "All notifications found successfully"
        )
    )
})

const markAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params
    if (!notificationId)
        throw new ApiError(400, "Notification ID is required")

    const notification = await Notifications.findById(notificationId)
    if (!notification)
        throw new ApiError(404, "Notification not found")

    notification.readBy.push(req?.user?._id)
    await notification.save({ validateBeforeSave: false })

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Notification marked as read"
        )
    )
})

export {
    getNotifications,
    markAsRead
}