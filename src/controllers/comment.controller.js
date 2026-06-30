import mongoose from "mongoose";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";
import { createNotification } from "../services/notification.service.js";

export const createComment = async (req, res) => {
    try {

        const { postId } = req.params;
        const { text } = req.body;

        // Validate Post ID
        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Post ID"
            });
        }

        if (!text || text.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Comment text is required"
            });
        }

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Create Comment
        const comment = await Comment.create({
            post: postId,
            user: req.user._id,
            text: text.trim(),
        });

        // Add comment to post
        post.comments.push(comment._id);

        await post.save();

        // Create notification for post owner
        await createNotification({
            sender: req.user._id,
            receiver: post.user,
            type: "COMMENT",
            post: post._id,
            comment: comment._id
        });

        return res.status(201).json({
            success: true,
            message: "Comment added successfully",
            data: comment,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

export const getComments = async (req, res) => {
    try {

        const { postId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Post ID"
            });
        }

        const comments = await Comment.find({
            post: postId
        })
            .populate("user", "name username profilePic isVerified")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: comments.length,
            data: comments
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const updateComment = async (req, res) => {
    try {

        const { id } = req.params;
        const { text } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Comment ID"
            });
        }

        if (!text || text.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Comment text is required"
            });
        }

        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        // Only owner can update
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this comment"
            });
        }

        comment.text = text.trim();
        comment.isEdited = true;

        await comment.save();

        return res.status(200).json({
            success: true,
            message: "Comment updated successfully",
            data: comment
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const deleteComment = async (req, res) => {
    try {

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Comment ID"
            });
        }

        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        // Only owner can delete
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this comment"
            });
        }

        // Remove comment reference from post
        await Post.findByIdAndUpdate(
            comment.post,
            {
                $pull: {
                    comments: comment._id,
                },
            }
        );

        // Delete comment
        await comment.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully",
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};