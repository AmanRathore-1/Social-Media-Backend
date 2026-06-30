import mongoose from "mongoose";
import User from "../models/user.model.js";
import { createNotification } from "../services/notification.service.js";

export const followUser = async (req, res) => {

    const session = await mongoose.startSession();

    try {

        session.startTransaction();

        const currentUserId = req.user._id;
        const targetUserId = req.params.id;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "Invalid User ID"
            });
        }

        // Can't follow yourself
        if (req.user._id.equals(targetUserId)) {
            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "You cannot follow yourself"
            });
        }

        // Find users
        const currentUser = await User.findById(currentUserId).session(session);
        const targetUser = await User.findById(targetUserId).session(session);

        if (!currentUser || !targetUser) {

            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        // Already following?
        const alreadyFollowing = currentUser.following.some(
            (id) => id.equals(targetUser._id)
        );

        if (alreadyFollowing) {

            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "Already following this user"
            });

        }

        // Update current user's following list
        await User.findByIdAndUpdate(
            currentUserId,
            {
                $addToSet: {
                    following: targetUserId
                }
            },
            { session }
        );

        // Update target user's followers list
        await User.findByIdAndUpdate(
            targetUserId,
            {
                $addToSet: {
                    followers: currentUserId
                }
            },
            { session }
        );

        // Create notification
        await createNotification({
            sender: currentUserId,
            receiver: targetUserId,
            type: "FOLLOW"
        });

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "User followed successfully"
        });

    } catch (error) {

        await session.abortTransaction();

        return res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {

        await session.endSession();

    }

};
export const unfollowUser = async (req, res) => {

    const session = await mongoose.startSession();

    try {

        session.startTransaction();

        const currentUserId = req.user._id;
        const targetUserId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(targetUserId)) {

            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "Invalid User ID"
            });

        }

        if (req.user._id.equals(targetUserId)) {

            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "You cannot unfollow yourself"
            });

        }

        const currentUser = await User.findById(currentUserId).session(session);
        const targetUser = await User.findById(targetUserId).session(session);

        if (!currentUser || !targetUser) {

            await session.abortTransaction();

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        const isFollowing = currentUser.following.some(
            (id) => id.equals(targetUser._id)
        );

        if (!isFollowing) {

            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message: "You are not following this user"
            });

        }

        await User.findByIdAndUpdate(
            currentUserId,
            {
                $pull: {
                    following: targetUserId
                }
            },
            { session }
        );

        await User.findByIdAndUpdate(
            targetUserId,
            {
                $pull: {
                    followers: currentUserId
                }
            },
            { session }
        );

        await session.commitTransaction();

        return res.status(200).json({
            success: true,
            message: "User unfollowed successfully"
        });

    } catch (error) {

        await session.abortTransaction();

        return res.status(500).json({
            success: false,
            message: error.message
        });

    } finally {

        await session.endSession();

    }

};
export const getFollowers = async (req, res) => {
    try {

        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid User ID"
            });
        }

        const user = await User.findById(id)
            .populate({
                path: "followers",
                select: "name email profilePic bio"
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            count: user.followers.length,
            data: user.followers
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const getFollowing = async (req, res) => {
    try {

        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid User ID"
            });
        }

        const user = await User.findById(id)
            .populate({
                path: "following",
                select: "name username profilePic bio isVerified"
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            count: user.following.length,
            data: user.following
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const getSuggestedUsers = async (req, res) => {
    try {

        const currentUser = req.user;

        const excludedUsers = [
            currentUser._id,
            ...currentUser.following
        ];

        const suggestions = await User.find({
            _id: {
                $nin: excludedUsers
            }
        })
        .select("name username profilePic bio isVerified")
        .limit(10)
        .lean();

        return res.status(200).json({
            success: true,
            count: suggestions.length,
            data: suggestions
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};