import mongoose from "mongoose";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import { createNotification } from "../services/notification.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// =========================
// Create Comment
// =========================
export const createComment = asyncHandler(async (req, res) => {

    const { postId } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid Post ID");
    }

    if (!text || text.trim() === "") {
        throw new ApiError(400, "Comment text is required");
    }

    const post = await Post.findById(postId);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const comment = await Comment.create({
        post: postId,
        user: req.user._id,
        text: text.trim(),
    });

    post.comments.push(comment._id);
    await post.save();

    // Don't notify yourself
    if (post.user.toString() !== req.user._id.toString()) {
        await createNotification({
            sender: req.user._id,
            receiver: post.user,
            type: "COMMENT",
            post: post._id,
            comment: comment._id
        });
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            comment,
            "Comment added successfully"
        )
    );

});

// =========================
// Get Comments
// =========================
export const getComments = asyncHandler(async (req, res) => {

    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid Post ID");
    }

    const comments = await Comment.find({
        post: postId
    })
        .populate("user", "name username profilePic isVerified")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                count: comments.length,
                comments
            },
            "Comments fetched successfully"
        )
    );

});
// =========================
// Update Comment
// =========================
export const updateComment = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Comment ID");
    }

    if (!text || text.trim() === "") {
        throw new ApiError(400, "Comment text is required");
    }

    const comment = await Comment.findById(id);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.user.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this comment"
        );
    }

    comment.text = text.trim();
    comment.isEdited = true;

    await comment.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            comment,
            "Comment updated successfully"
        )
    );

});

// =========================
// Delete Comment
// =========================
export const deleteComment = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Comment ID");
    }

    const comment = await Comment.findById(id);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.user.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to delete this comment"
        );
    }

    await Post.findByIdAndUpdate(
        comment.post,
        {
            $pull: {
                comments: comment._id,
            },
        }
    );

    await comment.deleteOne();

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Comment deleted successfully"
        )
    );

});