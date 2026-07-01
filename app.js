import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";

import errorHandler from "./src/middleware/error.middleware.js";
import { apiLimiter } from "./src/middleware/rateLimit.middleware.js";

import router from "./src/routes/user.routes.js";
import postRoutes from "./src/routes/post.routes.js";
import uploadRoutes from "./src/routes/upload.routes.js";
import commentRoutes from "./src/routes/comment.routes.js";
import followRoutes from "./src/routes/follow.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";

dotenv.config();

const app = express();


app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev"));
app.use(apiLimiter);

app.get("/", (req, res) => {
    res.send("Social Media Backend API is Running");
});

app.use("/api/users", router);
app.use("/api/users", followRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);

// =========================
// Global Error Handler
// =========================
app.use(errorHandler);

export default app;