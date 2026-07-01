import Post from "../models/post.model.js";
import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";
import { createNotification } from "../services/notification.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// =========================
// Create Post
// =========================
export const createPost = asyncHandler(async (req, res) => {

    const { caption } = req.body;

    if (!req.file) {
        throw new ApiError(400, "Please upload an image");
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "social-media-app/posts",
    });

    const post = await Post.create({
        user: req.user._id,
        caption,
        image: result.secure_url,
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            post,
            "Post created successfully"
        )
    );

});

// =========================
// Get All Posts
// =========================
export const getAllPosts = asyncHandler(async (req, res) => {

    const posts = await Post.find()
        .populate("user", "name profilePic")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                count: posts.length,
                posts,
            },
            "Posts fetched successfully"
        )
    );

});

// =========================
// Get Post By Id
// =========================
export const getPostById = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Post ID");
    }

    const post = await Post.findById(id)
        .populate("user", "name profilePic")
        .populate("comments");

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            post,
            "Post fetched successfully"
        )
    );

});

// =========================
// Update Post
// =========================
export const updatePost = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { caption } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Post ID");
    }

    const post = await Post.findById(id);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    if (post.user.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this post"
        );
    }

    if (caption) {
        post.caption = caption;
    }

    if (req.file) {

        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "social-media-app/posts",
        });

        post.image = result.secure_url;
    }

    await post.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            post,
            "Post updated successfully"
        )
    );

});

// =========================
// Delete Post
// =========================
export const deletePost = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Post ID");
    }

    const post = await Post.findById(id);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    if (post.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    // Delete image from Cloudinary
    const imageUrl = post.image;

    const publicId = imageUrl
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];

    await cloudinary.uploader.destroy(publicId);

    await post.deleteOne();

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Post deleted successfully"
        )
    );

});
// =========================
// Get My Posts
// =========================
export const getMyPosts = asyncHandler(async (req, res) => {

    const posts = await Post.find({
        user: req.user._id
    })
        .populate("user", "name profilePic")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                count: posts.length,
                posts
            },
            "My posts fetched successfully"
        )
    );

});

// =========================
// Like Post
// =========================
export const likePost = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Post ID");
    }

    const post = await Post.findById(id);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const alreadyLiked = post.likes.some(
        (userId) => userId.toString() === req.user._id.toString()
    );

    if (alreadyLiked) {
        throw new ApiError(400, "You already liked this post");
    }

    post.likes.push(req.user._id);

    await post.save();

    // Create notification only if user is not liking own post
    if (post.user.toString() !== req.user._id.toString()) {
        await createNotification({
            sender: req.user._id,
            receiver: post.user,
            type: "LIKE",
            post: post._id
        });
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalLikes: post.likes.length,
                post
            },
            "Post liked successfully"
        )
    );

});

// =========================
// Unlike Post
// =========================
export const unlikePost = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Post ID");
    }

    const post = await Post.findById(id);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const alreadyLiked = post.likes.some(
        (userId) => userId.toString() === req.user._id.toString()
    );

    if (!alreadyLiked) {
        throw new ApiError(400, "You have not liked this post");
    }

    post.likes = post.likes.filter(
        (userId) => userId.toString() !== req.user._id.toString()
    );

    await post.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalLikes: post.likes.length,
                post
            },
            "Post unliked successfully"
        )
    );

});

// =========================
// Toggle Like
// =========================
export const toggleLike = asyncHandler(async (req, res) => {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid Post ID");
    }

    const post = await Post.findById(id);

    if (!post) {
        throw new ApiError(404, "Post not found");
    }

    const alreadyLiked = post.likes.some(
        (userId) => userId.toString() === req.user._id.toString()
    );

    if (!alreadyLiked) {

        post.likes.push(req.user._id);

        await post.save();

        if (post.user.toString() !== req.user._id.toString()) {
            await createNotification({
                sender: req.user._id,
                receiver: post.user,
                type: "LIKE",
                post: post._id
            });
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    action: "liked",
                    totalLikes: post.likes.length,
                    post
                },
                "Post liked successfully"
            )
        );

    }

    post.likes = post.likes.filter(
        (userId) => userId.toString() !== req.user._id.toString()
    );

    await post.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                action: "unliked",
                totalLikes: post.likes.length,
                post
            },
            "Post unliked successfully"
        )
    );

});