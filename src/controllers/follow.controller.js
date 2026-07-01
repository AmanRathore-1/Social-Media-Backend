import mongoose from "mongoose";
import User from "../models/user.model.js";
import { createNotification } from "../services/notification.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// =========================
// Follow User
// =========================
export const followUser = asyncHandler(async (req, res) => {

    const session = await mongoose.startSession();

    try {

        session.startTransaction();

        const currentUserId = req.user._id;
        const targetUserId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
            throw new ApiError(400, "Invalid User ID");
        }

        if (currentUserId.toString() === targetUserId.toString()) {
            throw new ApiError(400, "You cannot follow yourself");
        }

        const currentUser = await User.findById(currentUserId).session(session);
        const targetUser = await User.findById(targetUserId).session(session);

        if (!currentUser || !targetUser) {
            throw new ApiError(404, "User not found");
        }

        const alreadyFollowing = currentUser.following.some(
            (id) => id.equals(targetUser._id)
        );

        if (alreadyFollowing) {
            throw new ApiError(400, "Already following this user");
        }

        await User.findByIdAndUpdate(
            currentUserId,
            {
                $addToSet: {
                    following: targetUserId
                }
            },
            { session }
        );

        await User.findByIdAndUpdate(
            targetUserId,
            {
                $addToSet: {
                    followers: currentUserId
                }
            },
            { session }
        );

        await createNotification({
            sender: currentUserId,
            receiver: targetUserId,
            type: "FOLLOW"
        });

        await session.commitTransaction();

        return res.status(200).json(
            new ApiResponse(
                200,
                null,
                "User followed successfully"
            )
        );

    } catch (error) {

        await session.abortTransaction();
        throw error;

    } finally {

        await session.endSession();

    }

});

// =========================
// Unfollow User
// =========================
export const unfollowUser = asyncHandler(async (req, res) => {

    const session = await mongoose.startSession();

    try {

        session.startTransaction();

        const currentUserId = req.user._id;
        const targetUserId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
            throw new ApiError(400, "Invalid User ID");
        }

        if (currentUserId.toString() === targetUserId.toString()) {
            throw new ApiError(400, "You cannot unfollow yourself");
        }

        const currentUser = await User.findById(currentUserId).session(session);
        const targetUser = await User.findById(targetUserId).session(session);

        if (!currentUser || !targetUser) {
            throw new ApiError(404, "User not found");
        }

        const isFollowing = currentUser.following.some(
            (id) => id.equals(targetUser._id)
        );

        if (!isFollowing) {
            throw new ApiError(400, "You are not following this user");
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

        return res.status(200).json(
            new ApiResponse(
                200,
                null,
                "User unfollowed successfully"
            )
        );

    } catch (error) {

        await session.abortTransaction();
        throw error;

    } finally {

        await session.endSession();

    }

});
// =========================
// Get Followers
// =========================
export const getFollowers = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid User ID");
    }

    const user = await User.findById(id).populate({
        path: "followers",
        select: "name email profilePic bio"
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                count: user.followers.length,
                followers: user.followers
            },
            "Followers fetched successfully"
        )
    );

});

// =========================
// Get Following
// =========================
export const getFollowing = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid User ID");
    }

    const user = await User.findById(id).populate({
        path: "following",
        select: "name username profilePic bio isVerified"
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                count: user.following.length,
                following: user.following
            },
            "Following fetched successfully"
        )
    );

});

// =========================
// Suggested Users
// =========================
export const getSuggestedUsers = asyncHandler(async (req, res) => {

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

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                count: suggestions.length,
                users: suggestions
            },
            "Suggested users fetched successfully"
        )
    );

});