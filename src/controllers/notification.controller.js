import Notification from "../models/notification.model.js";
import mongoose from "mongoose";


export const getMyNotifications = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const skip = (page - 1) * limit;

        // Get notifications
        const notifications = await Notification.find({
            receiver: req.user._id
        })
            .populate("sender", "name username profilePic isVerified")
            .populate("post", "image caption")
            .populate("comment", "text")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Total notifications
        const total = await Notification.countDocuments({
            receiver: req.user._id
        });

        // Unread notifications
        const unreadCount = await Notification.countDocuments({
            receiver: req.user._id,
            isRead: false
        });

        return res.status(200).json({
            success: true,
            unreadCount,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            data: notifications
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const markNotificationAsRead = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification id"
            });
        }

        const notification = await Notification.findById(id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        // Only receiver can mark as read
        if (!notification.receiver.equals(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        notification.isRead = true;

        await notification.save();

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            data: notification
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const markAllNotificationsAsRead = async (req, res) => {
    try {

        const result = await Notification.updateMany(
            {
                receiver: req.user._id,
                isRead: false
            },
            {
                $set: {
                    isRead: true
                }
            }
        );

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read",
            modifiedCount: result.modifiedCount
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const deleteNotification = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid notification ID"
            });
        }

        const notification = await Notification.findById(id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: "Notification not found"
            });
        }

        // Only receiver can delete
        if (!notification.receiver.equals(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        await notification.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Notification deleted successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
export const clearAllNotifications = async (req, res) => {
    try {

        const result = await Notification.deleteMany({
            receiver: req.user._id
        });

        return res.status(200).json({
            success: true,
            message: "All notifications cleared successfully",
            deletedCount: result.deletedCount
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};