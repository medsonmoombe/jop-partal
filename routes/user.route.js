import express from "express";
import { 
    login, 
    logout, 
    register, 
    updateProfile,
    updateExperience,
    updateEducation,
    updateCertifications,
    updatePortfolio,
    updatePreferences,
    updateRecruiterProfile,
    getProfile,
    updateProfilePhoto
} from "../controllers/user.controller.js";
import { forgotPassword, resetPassword, changePassword } from "../controllers/password.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { singleUpload } from "../middlewares/mutler.js";
import { validateRegistration, validateLogin, validateProfileUpdate } from "../middlewares/validation.js";
 
const router = express.Router();

// Auth routes
router.route("/register").post(singleUpload, validateRegistration, register);
router.route("/login").post(validateLogin, login);
router.route("/logout").get(logout);

// Password routes
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);
router.route("/change-password").post(isAuthenticated, changePassword);

// Profile routes
router.route("/profile").get(isAuthenticated, getProfile);
router.route("/profile/update").post(isAuthenticated, singleUpload, validateProfileUpdate, updateProfile);
router.route("/profile/photo").post(isAuthenticated, singleUpload, updateProfilePhoto);

// Job Seeker specific routes
router.route("/profile/experience").post(isAuthenticated, updateExperience);
router.route("/profile/education").post(isAuthenticated, updateEducation);
router.route("/profile/certifications").post(isAuthenticated, updateCertifications);
router.route("/profile/portfolio").post(isAuthenticated, updatePortfolio);
router.route("/profile/preferences").post(isAuthenticated, updatePreferences);

// Recruiter specific routes
router.route("/profile/recruiter").post(isAuthenticated, updateRecruiterProfile);

export default router;

