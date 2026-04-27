import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../utils/catchAsyncErrors.js";
import { sendEmail } from "../utils/sendEmail.js";

// Forgot Password
export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new ErrorHandler("Please provide email address", 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(new ErrorHandler("User not found with this email", 404));
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token and set to user
    user.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    // Set token expiry (10 minutes)
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const message = `
        <h1>Password Reset Request</h1>
        <p>You requested a password reset. Please click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password Reset Request - JobPortal',
            message
        });

        return res.status(200).json({
            success: true,
            message: `Password reset link sent to ${email}`
        });
    } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        return next(new ErrorHandler("Email could not be sent. Please try again later.", 500));
    }
});

// Reset Password
export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
        return next(new ErrorHandler("Please provide new password", 400));
    }

    if (password.length < 6) {
        return next(new ErrorHandler("Password must be at least 6 characters long", 400));
    }

    // Hash the token from URL
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
        return next(new ErrorHandler("Invalid or expired reset token", 400));
    }

    // Set new password
    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();

    return res.status(200).json({
        success: true,
        message: "Password reset successful. You can now login with your new password."
    });
});

// Change Password (for logged in users)
export const changePassword = catchAsyncErrors(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.id;

    if (!currentPassword || !newPassword) {
        return next(new ErrorHandler("Please provide current and new password", 400));
    }

    if (newPassword.length < 6) {
        return next(new ErrorHandler("New password must be at least 6 characters long", 400));
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Check current password
    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatch) {
        return next(new ErrorHandler("Current password is incorrect", 401));
    }

    // Set new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
        success: true,
        message: "Password changed successfully"
    });
});
