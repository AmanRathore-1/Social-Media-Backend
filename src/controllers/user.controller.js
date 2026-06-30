import User from "../models/user.model.js";
import bcrypt from "bcrypt";
export const getProfile = async (req, res) => {
    try {
        const token = req.user._id;

        const user = await User.findById(token).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            data: user
        })
    }

    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
export const updateProfile = async (req, res) => {
    try {

        const { name, bio } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (name) {
            user.name = name;
        }

        if (bio) {
            user.bio = bio;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: user
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const changePassword = async (req, res) => {
    try {

        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Old password and new password are required"
            });
        }

        const user = await User.findById(req.user._id).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Old password is incorrect"
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};