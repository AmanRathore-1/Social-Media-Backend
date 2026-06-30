import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getMyNotifications ,markNotificationAsRead,markAllNotificationsAsRead,deleteNotification,clearAllNotifications} from "../controllers/notification.controller.js";

const notificationRoutes = Router();

notificationRoutes.get("/", protect, getMyNotifications);
notificationRoutes.patch("/read-all", protect, markAllNotificationsAsRead);
notificationRoutes.patch("/:id/read", protect, markNotificationAsRead);
notificationRoutes.delete("/clear", protect, clearAllNotifications);
notificationRoutes.delete("/:id", protect, deleteNotification);

export default notificationRoutes;
