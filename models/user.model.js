import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:['student','recruiter'],
        required:true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLogin: Date,
    isActive: {
        type: Boolean,
        default: true
    },
    profile:{
        bio:{type:String, maxlength: 500},
        skills:[{type:String}],
        resume:{type:String}, // URL to resume file
        resumeOriginalName:{type:String},
        company:{type:mongoose.Schema.Types.ObjectId, ref:'Company'}, 
        profilePhoto:{
            type:String,
            default:""
        },
        // Job Seeker specific fields
        experience: [{
            title: String,
            company: String,
            location: String,
            startDate: Date,
            endDate: Date,
            current: Boolean,
            description: String
        }],
        education: [{
            institution: String,
            degree: String,
            fieldOfStudy: String,
            startDate: Date,
            endDate: Date,
            grade: String,
            description: String
        }],
        certifications: [{
            name: String,
            issuingOrganization: String,
            issueDate: Date,
            expiryDate: Date,
            credentialId: String,
            credentialUrl: String
        }],
        languages: [{
            language: String,
            proficiency: {
                type: String,
                enum: ['Basic', 'Conversational', 'Fluent', 'Native']
            }
        }],
        portfolio: {
            website: String,
            github: String,
            linkedin: String,
            twitter: String,
            other: String
        },
        preferences: {
            jobTypes: [String], // Full-time, Part-time, Contract, Internship
            locations: [String],
            remoteWork: Boolean,
            salaryExpectation: {
                min: Number,
                max: Number,
                currency: String
            },
            availability: {
                type: String,
                enum: ['Immediate', '2 weeks', '1 month', '2 months', '3+ months']
            }
        },
        // Recruiter specific fields
        companyName: String,
        companyWebsite: String,
        companySize: {
            type: String,
            enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
        },
        industry: String,
        position: String, 
        department: String,
        yearsOfExperience: Number
    },
    savedJobs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    }],
    profileCompleteness: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    }
},{timestamps:true});

// Method to calculate profile completeness
userSchema.methods.calculateProfileCompleteness = function() {
    let score = 0;
    const weights = {
        basic: 20, // fullname, email, phone, password
        photo: 10,
        bio: 10,
        skills: 10,
        resume: 15,
        experience: 15,
        education: 10,
        portfolio: 10
    };

    // Basic info is always complete if user exists
    score += weights.basic;

    if (this.profile.profilePhoto) score += weights.photo;
    if (this.profile.bio) score += weights.bio;
    if (this.profile.skills && this.profile.skills.length > 0) score += weights.skills;

    if (this.role === 'student') {
        if (this.profile.resume) score += weights.resume;
        if (this.profile.experience && this.profile.experience.length > 0) score += weights.experience;
        if (this.profile.education && this.profile.education.length > 0) score += weights.education;
        if (this.profile.portfolio && (this.profile.portfolio.website || this.profile.portfolio.github || this.profile.portfolio.linkedin)) {
            score += weights.portfolio;
        }
    } else if (this.role === 'recruiter') {
        if (this.profile.companyName) score += 15;
        if (this.profile.position) score += 10;
        if (this.profile.industry) score += 10;
        if (this.profile.companySize) score += 10;
    }

    this.profileCompleteness = Math.min(score, 100);
    return this.profileCompleteness;
};

export const User = mongoose.model('User', userSchema);