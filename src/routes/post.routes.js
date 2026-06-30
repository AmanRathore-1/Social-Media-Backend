import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { createPost,getAllPosts,getPostById,updatePost,deletePost,getMyPosts} from "../controllers/post.controller.js";
import {likePost,unlikePost,toggleLike} from "../controllers/post.controller.js"

const postRoutes = Router();

postRoutes.post(
    "/create",
    protect,
    upload.single("image"),
    createPost
);
postRoutes.get("/", protect, getAllPosts);
postRoutes.get("/me", protect, getMyPosts);
postRoutes.get("/:id", protect, getPostById);
postRoutes.put(
    "/:id",
    protect,
    upload.single("image"),
    updatePost
);
postRoutes.delete("/:id", protect, deletePost);

postRoutes.post("/:id/toggle-like", protect, toggleLike);
postRoutes.post("/:id/like", protect, likePost);
postRoutes.delete("/:id/unlike", protect, unlikePost);
export default postRoutes;

