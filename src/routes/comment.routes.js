import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { createComment } from "../controllers/comment.controller.js";

const commentRoutes = Router();

commentRoutes.post("/:postId", protect, createComment);

export default commentRoutes;

