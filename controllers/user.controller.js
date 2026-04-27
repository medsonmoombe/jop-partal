import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../utils/catchAsyncErrors.js";

export const register = catchAsyncErrors(async (req, res, next) => {
    const { fullname, email, phoneNumber, password, role } = req.body;
     
    if (!fullname || !email || !phoneNumber || !password || !role) {
        return next(new ErrorHandler("All fields are required", 400));
    }
    
    let cloudResponse = null;
    const file = req.file;
    if (file) {
        const fileUri = getDataUri(file);
        cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
            folder: 'job-portal/profiles',
            width: 500,
            height: 500,
            crop: 'fill'
        });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ErrorHandler('User already exists with this email', 400));
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        fullname,
        email,
        phoneNumber,
        password: hashedPassword,
        role,
        profile:{
            profilePhoto: cloudResponse?.secure_url || "",
        }
    });

    // Calculate initial profile completeness
    user.calculateProfileCompleteness();
    await user.save();

    return res.status(201).json({
        message: "Account created successfully. Please complete your profile.",
        success: true,
        profileCompleteness: user.profileCompleteness
    });
});

export const login = catchAsyncErrors(async (req, res, next) => {
    const { email, password, role } = req.body;
    
    if (!email || !password || !role) {
        return next(new ErrorHandler("All fields are required", 400));
    }
    
    let user = await User.findOne({ email }).select('+password');
    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }
    
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }
    
    if (role !== user.role) {
        return next(new ErrorHandler("Account doesn't exist with this role", 403));
    }

    if (!user.isActive) {
        return next(new ErrorHandler("Your account has been deactivated. Please contact support.", 403));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const tokenData = {
        userId: user._id
    }
    const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '7d' });

    const userResponse = {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profile: user.profile,
        profileCompleteness: user.profileCompleteness,
        lastLogin: user.lastLogin
    }

    return res.status(200)
        .cookie("token", token, { 
            maxAge: 7 * 24 * 60 * 60 * 1000, 
            httpOnly: true, 
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production'
        })
        .json({
            message: `Welcome back ${user.fullname}`,
            user: userResponse,
            success: true
        });
});

export const logout = catchAsyncErrors(async (req, res, next) => {
    return res.status(200)
        .cookie("token", "", { maxAge: 0 })
        .json({
            message: "Logged out successfully.",
            success: true
        });
});

export const updateProfile = catchAsyncErrors(async (req, res, next) => {
    const { fullname, email, phoneNumber, bio, skills } = req.body;
    
    let cloudResponse = null;
    const file = req.file;
    if (file) {
        const fileUri = getDataUri(file);
        cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
            folder: 'job-portal/resumes'
        });
    }

    let skillsArray;
    if(skills){
        skillsArray = skills.split(",").map(skill => skill.trim()).filter(skill => skill);
    }
    
    const userId = req.id;
    let user = await User.findById(userId);

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    
    // updating data
    if(fullname) user.fullname = fullname;
    if(email) {
        // Check if email is already taken by another user
        const existingUser = await User.findOne({ email, _id: { $ne: userId } });
        if (existingUser) {
            return next(new ErrorHandler("Email already in use", 400));
        }
        user.email = email;
    }
    if(phoneNumber) user.phoneNumber = phoneNumber;
    if(bio) user.profile.bio = bio;
    if(skills) user.profile.skills = skillsArray;
  
    // resume upload
    if(cloudResponse){
        user.profile.resume = cloudResponse.secure_url;
        user.profile.resumeOriginalName = file.originalname;
    }

    // Calculate profile completeness
    user.calculateProfileCompleteness();
    await user.save();

    const userResponse = {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profile: user.profile,
        profileCompleteness: user.profileCompleteness
    }

    return res.status(200).json({
        message:"Profile updated successfully.",
        user: userResponse,
        success:true
    });
});

export const updateExperience = catchAsyncErrors(async (req, res, next) => {
    const { experience } = req.body;
    const userId = req.id;

    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (user.role !== 'student') {
        return next(new ErrorHandler("Only job seekers can add experience", 403));
    }

    user.profile.experience = experience;
    user.calculateProfileCompleteness();
    await user.save();

    return res.status(200).json({
        message: "Experience updated successfully",
        experience: user.profile.experience,
        profileCompleteness: user.profileCompleteness,
        success: true
    });
});

export const updateEducation = catchAsyncErrors(async (req, res, next) => {
    const { education } = req.body;
    const userId = req.id;

    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (user.role !== 'student') {
        return next(new ErrorHandler("Only job seekers can add education", 403));
    }

    user.profile.education = education;
    user.calculateProfileCompleteness();
    await user.save();

    return res.status(200).json({
        message: "Education updated successfully",
        education: user.profile.education,
        profileCompleteness: user.profileCompleteness,
        success: true
    });
});

export const updateCertifications = catchAsyncErrors(async (req, res, next) => {
    const { certifications } = req.body;
    const userId = req.id;

    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    user.profile.certifications = certifications;
    await user.save();

    return res.status(200).json({
        message: "Certifications updated successfully",
        certifications: user.profile.certifications,
        success: true
    });
});

export const updatePortfolio = catchAsyncErrors(async (req, res, next) => {
    const { portfolio } = req.body;
    const userId = req.id;

    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    user.profile.portfolio = { ...user.profile.portfolio, ...portfolio };
    user.calculateProfileCompleteness();
    await user.save();

    return res.status(200).json({
        message: "Portfolio updated successfully",
        portfolio: user.profile.portfolio,
        profileCompleteness: user.profileCompleteness,
        success: true
    });
});

export const updatePreferences = catchAsyncErrors(async (req, res, next) => {
    const { preferences } = req.body;
    const userId = req.id;

    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (user.role !== 'student') {
        return next(new ErrorHandler("Only job seekers can set preferences", 403));
    }

    user.profile.preferences = { ...user.profile.preferences, ...preferences };
    await user.save();

    return res.status(200).json({
        message: "Preferences updated successfully",
        preferences: user.profile.preferences,
        success: true
    });
});

export const updateRecruiterProfile = catchAsyncErrors(async (req, res, next) => {
    const { companyName, companyWebsite, companySize, industry, position, department } = req.body;
    const userId = req.id;

    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (user.role !== 'recruiter') {
        return next(new ErrorHandler("Only recruiters can update this information", 403));
    }

    if (companyName) user.profile.companyName = companyName;
    if (companyWebsite) user.profile.companyWebsite = companyWebsite;
    if (companySize) user.profile.companySize = companySize;
    if (industry) user.profile.industry = industry;
    if (position) user.profile.position = position;
    if (department) user.profile.department = department;

    user.calculateProfileCompleteness();
    await user.save();

    return res.status(200).json({
        message: "Recruiter profile updated successfully",
        profile: user.profile,
        profileCompleteness: user.profileCompleteness,
        success: true
    });
});

export const getProfile = catchAsyncErrors(async (req, res, next) => {
    const userId = req.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    return res.status(200).json({
        user,
        success: true
    });
});

export const updateProfilePhoto = catchAsyncErrors(async (req, res, next) => {
    const userId = req.id;
    const file = req.file;

    if (!file) {
        return next(new ErrorHandler("Please upload a photo", 400));
    }

    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    const fileUri = getDataUri(file);
    const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        folder: 'job-portal/profiles',
        width: 500,
        height: 500,
        crop: 'fill'
    });

    user.profile.profilePhoto = cloudResponse.secure_url;
    user.calculateProfileCompleteness();
    await user.save();

    return res.status(200).json({
        message: "Profile photo updated successfully",
        profilePhoto: user.profile.profilePhoto,
        profileCompleteness: user.profileCompleteness,
        success: true
    });
});