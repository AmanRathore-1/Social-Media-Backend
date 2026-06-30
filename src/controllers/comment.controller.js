import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";

export const createComment = async (req, res) => {
    try {

        const { postId } = req.params;
        const { text } = req.body;

        if (!text) {
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

        const comment = await Comment.create({
            post: postId,
            user: req.user._id,
            text,
        });

        post.comments.push(comment._id);

        await post.save();

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

        const comments = await Comment.find({
            post: postId
        })
        .populate("user", "name profilePic")
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

        if (!text) {
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

        if (comment.user.toString() !== req.user._id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this comment"
            });
        }

        comment.text = text;
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

        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        // Only owner can delete
        if (comment.user.toString() !== req.user._id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this comment"
            });
        }

        // Remove comment reference from the post
        await Post.findByIdAndUpdate(
            comment.post,
            {
                $pull: {
                    comments: comment._id,
                },
            }
        );

        // Delete the comment
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