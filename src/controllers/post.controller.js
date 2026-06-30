import Post from "../models/post.model.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";

export const createPost = async (req, res) => {
    try {

        const { caption } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload an image"
            });
        }

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "social-media-app/posts",
        });

        // Create Post
        const post = await Post.create({
            user: req.user.id,
            caption,
            image: result.secure_url,
        });

        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            data: post,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

export const getAllPosts = async (req, res) => {
    try {

        const posts = await Post.find()
            .populate("user", "name profilePic")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const getPostById = async (req, res) => {
    try {

        const { id } = req.params;

        const post = await Post.findById(id)
            .populate("user", "name profilePic")
            .populate("comments");

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: post
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
export const updatePost = async (req, res) => {
    try {

        const { id } = req.params;
        const { caption } = req.body;

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Only owner can update
        if (post.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this post"
            });
        }

        // Update caption
        if (caption) {
            post.caption = caption;
        }

        // Update image (optional)
        if (req.file) {

            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "social-media-app/posts",
            });

            post.image = result.secure_url;
        }

        await post.save();

        return res.status(200).json({
            success: true,
            message: "Post updated successfully",
            data: post,
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

export const deletePost = async (req, res) => {
    try {

        const { id } = req.params;

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Only owner can delete
        if (post.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // Delete image from Cloudinary
        const imageUrl = post.image;

        const publicId = imageUrl
            .split("/")
            .slice(-2)
            .join("/")
            .split(".")[0];

        await cloudinary.uploader.destroy(publicId);

        // Delete post
        await post.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Post deleted successfully"
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const getMyPosts = async (req, res) => {
    try {

        const posts = await Post.find({
            user: req.user.id
        })
        .populate("user", "name profilePic")
        .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: posts.length,
            data: posts
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const likePost = async (req, res) => {
    try {

        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Post ID"
            });
        }

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Prevent duplicate likes
        if (post.likes.includes(req.user.id)) {
            return res.status(400).json({
                success: false,
                message: "You already liked this post"
            });
        }

        post.likes.push(req.user.id);

        await post.save();

        return res.status(200).json({
            success: true,
            message: "Post liked successfully",
            totalLikes: post.likes.length,
            data: post
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const unlikePost = async (req, res) => {
    try {

        const { id } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Post ID"
            });
        }

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        // Check if user has liked the post
        const alreadyLiked = post.likes.some(
            (userId) => userId.toString() === req.user.id
        );

        if (!alreadyLiked) {
            return res.status(400).json({
                success: false,
                message: "You have not liked this post"
            });
        }

        // Remove like
        post.likes = post.likes.filter(
            (userId) => userId.toString() !== req.user.id
        );

        await post.save();

        return res.status(200).json({
            success: true,
            message: "Post unliked successfully",
            totalLikes: post.likes.length,
            data: post
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
export const toggleLike = async (req, res) => {
    try {

        const { id } = req.params;

        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            });
        }

        const index = post.likes.findIndex(
            (userId) => userId.toString() === req.user.id
        );

        if (index === -1) {
            post.likes.push(req.user.id);

            await post.save();

            return res.status(200).json({
                success: true,
                action: "liked",
                totalLikes: post.likes.length,
                data: post
            });
        }

        post.likes.splice(index, 1);

        await post.save();

        return res.status(200).json({
            success: true,
            action: "unliked",
            totalLikes: post.likes.length,
            data: post
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};