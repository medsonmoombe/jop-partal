import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../utils/catchAsyncErrors.js";

// Save a job
export const saveJob = catchAsyncErrors(async (req, res, next) => {
    const userId = req.id;
    const jobId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    const job = await Job.findById(jobId);
    if (!job) {
        return next(new ErrorHandler("Job not found", 404));
    }

    // Check if job is already saved
    if (user.savedJobs.includes(jobId)) {
        return next(new ErrorHandler("Job already saved", 400));
    }

    user.savedJobs.push(jobId);
    await user.save();

    return res.status(200).json({
        message: "Job saved successfully",
        success: true
    });
});

// Remove saved job
export const removeSavedJob = catchAsyncErrors(async (req, res, next) => {
    const userId = req.id;
    const jobId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    user.savedJobs = user.savedJobs.filter(id => id.toString() !== jobId);
    await user.save();

    return res.status(200).json({
        message: "Job removed from saved list",
        success: true
    });
});

// Get all saved jobs
export const getSavedJobs = catchAsyncErrors(async (req, res, next) => {
    const userId = req.id;

    const user = await User.findById(userId).populate({
        path: 'savedJobs',
        populate: {
            path: 'company',
            select: 'name logo location'
        },
        options: { sort: { createdAt: -1 } }
    });

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    return res.status(200).json({
        savedJobs: user.savedJobs,
        success: true
    });
});

// Check if job is saved
export const isJobSaved = catchAsyncErrors(async (req, res, next) => {
    const userId = req.id;
    const jobId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    const isSaved = user.savedJobs.includes(jobId);

    return res.status(200).json({
        isSaved,
        success: true
    });
});
