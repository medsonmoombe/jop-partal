import { Job } from "../models/job.model.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../utils/catchAsyncErrors.js";

// Post a job (Recruiter)
export const postJob = catchAsyncErrors(async (req, res, next) => {
    const { title, description, requirements, salary, location, jobType, experience, position, companyId, isRemote, benefits, skills, expiryDate } = req.body;
    const userId = req.id;

    if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
        return next(new ErrorHandler("All required fields must be provided", 400));
    }

    const job = await Job.create({
        title,
        description,
        requirements: requirements.split(",").map(req => req.trim()),
        salary: Number(salary),
        location,
        jobType,
        experienceLevel: experience,
        position,
        company: companyId,
        created_by: userId,
        isRemote: isRemote || false,
        benefits: benefits ? benefits.split(",").map(b => b.trim()) : [],
        skills: skills ? skills.split(",").map(s => s.trim()) : [],
        expiryDate: expiryDate || undefined
    });

    return res.status(201).json({
        message: "New job created successfully.",
        job,
        success: true
    });
});

// Get all jobs with advanced filtering and pagination
export const getAllJobs = catchAsyncErrors(async (req, res, next) => {
    const { 
        keyword = "", 
        location = "",
        jobType = "",
        minSalary = 0,
        maxSalary = Number.MAX_SAFE_INTEGER,
        experienceLevel = "",
        isRemote = "",
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        order = "desc"
    } = req.query;

    // Build query
    const query = {
        status: 'active',
        expiryDate: { $gt: new Date() }
    };

    // Keyword search
    if (keyword) {
        query.$or = [
            { title: { $regex: keyword, $options: "i" } },
            { description: { $regex: keyword, $options: "i" } },
            { skills: { $in: [new RegExp(keyword, 'i')] } }
        ];
    }

    // Location filter
    if (location) {
        query.location = { $regex: location, $options: "i" };
    }

    // Job type filter
    if (jobType) {
        query.jobType = jobType;
    }

    // Salary range filter
    query.salary = { $gte: Number(minSalary), $lte: Number(maxSalary) };

    // Experience level filter
    if (experienceLevel) {
        query.experienceLevel = { $lte: Number(experienceLevel) };
    }

    // Remote filter
    if (isRemote !== "") {
        query.isRemote = isRemote === 'true';
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    // Execute query
    const jobs = await Job.find(query)
        .populate({ path: "company", select: "name logo location" })
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(Number(limit));

    const totalJobs = await Job.countDocuments(query);

    return res.status(200).json({
        jobs,
        pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(totalJobs / Number(limit)),
            totalJobs,
            limit: Number(limit)
        },
        success: true
    });
});

// Get job by ID and increment view count
export const getJobById = catchAsyncErrors(async (req, res, next) => {
    const jobId = req.params.id;
    
    const job = await Job.findById(jobId)
        .populate({ path: "company", select: "name logo location website description" })
        .populate({ path: "applications" });
    
    if (!job) {
        return next(new ErrorHandler("Job not found", 404));
    }

    // Increment view count
    await job.incrementViews();

    return res.status(200).json({ job, success: true });
});

// Get admin jobs (Recruiter)
export const getAdminJobs = catchAsyncErrors(async (req, res, next) => {
    const adminId = req.id;
    
    const jobs = await Job.find({ created_by: adminId })
        .populate({ path: 'company' })
        .sort({ createdAt: -1 });
    
    if (!jobs) {
        return next(new ErrorHandler("Jobs not found", 404));
    }

    return res.status(200).json({
        jobs,
        success: true
    });
});

// Update job
export const updateJob = catchAsyncErrors(async (req, res, next) => {
    const jobId = req.params.id;
    const userId = req.id;
    const updates = req.body;

    const job = await Job.findById(jobId);
    
    if (!job) {
        return next(new ErrorHandler("Job not found", 404));
    }

    // Check if user is the creator
    if (job.created_by.toString() !== userId) {
        return next(new ErrorHandler("You are not authorized to update this job", 403));
    }

    // Handle array fields
    if (updates.requirements && typeof updates.requirements === 'string') {
        updates.requirements = updates.requirements.split(",").map(req => req.trim());
    }
    if (updates.benefits && typeof updates.benefits === 'string') {
        updates.benefits = updates.benefits.split(",").map(b => b.trim());
    }
    if (updates.skills && typeof updates.skills === 'string') {
        updates.skills = updates.skills.split(",").map(s => s.trim());
    }

    Object.assign(job, updates);
    await job.save();

    return res.status(200).json({
        message: "Job updated successfully",
        job,
        success: true
    });
});

// Delete job
export const deleteJob = catchAsyncErrors(async (req, res, next) => {
    const jobId = req.params.id;
    const userId = req.id;

    const job = await Job.findById(jobId);
    
    if (!job) {
        return next(new ErrorHandler("Job not found", 404));
    }

    // Check if user is the creator
    if (job.created_by.toString() !== userId) {
        return next(new ErrorHandler("You are not authorized to delete this job", 403));
    }

    await job.deleteOne();

    return res.status(200).json({
        message: "Job deleted successfully",
        success: true
    });
});

// Close job (change status)
export const closeJob = catchAsyncErrors(async (req, res, next) => {
    const jobId = req.params.id;
    const userId = req.id;

    const job = await Job.findById(jobId);
    
    if (!job) {
        return next(new ErrorHandler("Job not found", 404));
    }

    // Check if user is the creator
    if (job.created_by.toString() !== userId) {
        return next(new ErrorHandler("You are not authorized to close this job", 403));
    }

    job.status = 'closed';
    await job.save();

    return res.status(200).json({
        message: "Job closed successfully",
        success: true
    });
});

// Get job recommendations for user
export const getJobRecommendations = catchAsyncErrors(async (req, res, next) => {
    const userId = req.id;
    const { User } = await import("../models/user.model.js");

    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    if (user.role !== 'student') {
        return next(new ErrorHandler("Only job seekers can get recommendations", 403));
    }

    const userSkills = user.profile.skills || [];
    const preferences = user.profile.preferences || {};

    // Build recommendation query
    const query = {
        status: 'active',
        expiryDate: { $gt: new Date() }
    };

    // Match skills
    if (userSkills.length > 0) {
        query.skills = { $in: userSkills.map(skill => new RegExp(skill, 'i')) };
    }

    // Match preferences
    if (preferences.jobTypes && preferences.jobTypes.length > 0) {
        query.jobType = { $in: preferences.jobTypes };
    }

    if (preferences.locations && preferences.locations.length > 0) {
        query.$or = [
            { location: { $in: preferences.locations.map(loc => new RegExp(loc, 'i')) } },
            { isRemote: true }
        ];
    }

    if (preferences.salaryExpectation) {
        query.salary = { $gte: preferences.salaryExpectation.min || 0 };
    }

    const recommendedJobs = await Job.find(query)
        .populate({ path: "company", select: "name logo location" })
        .sort({ createdAt: -1 })
        .limit(20);

    return res.status(200).json({
        recommendations: recommendedJobs,
        count: recommendedJobs.length,
        success: true
    });
});

// Get job analytics (Recruiter)
export const getJobAnalytics = catchAsyncErrors(async (req, res, next) => {
    const jobId = req.params.id;
    const userId = req.id;

    const job = await Job.findById(jobId).populate('applications');
    
    if (!job) {
        return next(new ErrorHandler("Job not found", 404));
    }

    // Check if user is the creator
    if (job.created_by.toString() !== userId) {
        return next(new ErrorHandler("You are not authorized to view analytics", 403));
    }

    const { Application } = await import("../models/application.model.js");
    
    const applications = await Application.find({ job: jobId });
    
    const analytics = {
        totalViews: job.viewCount || 0,
        totalApplications: applications.length,
        applicationsByStatus: {
            pending: applications.filter(app => app.status === 'pending').length,
            accepted: applications.filter(app => app.status === 'accepted').length,
            rejected: applications.filter(app => app.status === 'rejected').length
        },
        daysActive: Math.floor((new Date() - job.createdAt) / (1000 * 60 * 60 * 24)),
        daysUntilExpiry: job.expiryDate ? Math.floor((job.expiryDate - new Date()) / (1000 * 60 * 60 * 24)) : null,
        status: job.status
    };

    return res.status(200).json({
        analytics,
        success: true
    });
});
