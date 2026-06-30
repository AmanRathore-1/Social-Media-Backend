import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { followUser ,unfollowUser,getFollowers,getFollowing,getSuggestedUsers} from "../controllers/follow.controller.js";

const followRoutes = Router();

followRoutes.get("/suggestions", protect, getSuggestedUsers);

followRoutes.post("/:id/follow", protect, followUser);
followRoutes.delete("/:id/unfollow", protect, unfollowUser);
followRoutes.get("/:id/followers", protect, getFollowers);
followRoutes.get("/:id/following", protect, getFollowing);

export default followRoutes;