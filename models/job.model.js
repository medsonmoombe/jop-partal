import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    requirements: [{
        type: String
    }],
    salary: {
        type: Number,
        required: true
    },
    experienceLevel:{
        type:Number,
        required:true,
    },
    location: {
        type: String,
        required: true
    },
    jobType: {
        type: String,
        required: true,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship']
    },
    position: {
        type: Number,
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
        }
    ],
    status: {
        type: String,
        enum: ['active', 'closed', 'expired', 'draft'],
        default: 'active'
    },
    expiryDate: {
        type: Date,
        default: function() {
            // Default expiry: 30 days from creation
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
    },
    viewCount: {
        type: Number,
        default: 0
    },
    isRemote: {
        type: Boolean,
        default: false
    },
    benefits: [{
        type: String
    }],
    skills: [{
        type: String
    }]
},{timestamps:true});

// Index for better query performance
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ location: 1, jobType: 1, salary: 1 });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ status: 1, expiryDate: 1 });

// Method to check if job is expired
jobSchema.methods.isExpired = function() {
    return this.expiryDate < new Date();
};

// Method to increment view count
jobSchema.methods.incrementViews = async function() {
    this.viewCount += 1;
    await this.save();
};

export const Job = mongoose.model("Job", jobSchema);