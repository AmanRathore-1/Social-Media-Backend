import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";
import { uploadImage } from "../controllers/upload.controller.js";

const uploadRoutes  = Router();

uploadRoutes .post(
    "/",
    protect,
    upload.single("image"),
    uploadImage
);

export default uploadRoutes ;