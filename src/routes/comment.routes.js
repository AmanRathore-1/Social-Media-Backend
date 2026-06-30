import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { createComment,getComments ,updateComment,deleteComment} from "../controllers/comment.controller.js";

const commentRoutes = Router();

commentRoutes.post("/:postId", protect, createComment);
commentRoutes.get("/:postId", protect, getComments);
commentRoutes.put("/:id", protect, updateComment);
commentRoutes.delete("/:id", protect, deleteComment);

export default commentRoutes;

