import { Router } from "express";
import { Signup, login } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { authLimiter } from "../middleware/rateLimit.middleware.js";
import {
    getProfile,
    updateProfile,
    changePassword
} from "../controllers/user.controller.js";

const router = Router();

router.post("/signup", authLimiter, Signup);
router.post("/signin", authLimiter, login);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

export default router;