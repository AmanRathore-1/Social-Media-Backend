import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// =========================
// Get Profile
// =========================
export const getProfile = asyncHandler(async (req, res) => {

    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Profile fetched successfully"
        )
    );

});

// =========================
// Update Profile
// =========================
export const updateProfile = asyncHandler(async (req, res) => {

    const { name, bio } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (name) {
        user.name = name;
    }

    if (bio) {
        user.bio = bio;
    }

    await user.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Profile updated successfully"
        )
    );

});

// =========================
// Change Password
// =========================
export const changePassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(
            400,
            "Old password and new password are required"
        );
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
        throw new ApiError(401, "Old password is incorrect");
    }

    // Let the pre-save hook hash the password
    user.password = newPassword;

    await user.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            null,
            "Password changed successfully"
        )
    );

});