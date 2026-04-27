import { body, validationResult } from 'express-validator';

export const validateRegistration = [
    body('fullname')
        .trim()
        .notEmpty().withMessage('Full name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Full name must be between 2 and 50 characters'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('phoneNumber')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[0-9+\-\s()]+$/).withMessage('Please provide a valid phone number'),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    body('role')
        .notEmpty().withMessage('Role is required')
        .isIn(['student', 'recruiter']).withMessage('Role must be either student or recruiter'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }
        next();
    }
];

export const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required'),
    
    body('role')
        .notEmpty().withMessage('Role is required')
        .isIn(['student', 'recruiter']).withMessage('Role must be either student or recruiter'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }
        next();
    }
];

export const validateProfileUpdate = [
    body('fullname')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Full name must be between 2 and 50 characters'),
    
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('phoneNumber')
        .optional()
        .trim()
        .matches(/^[0-9+\-\s()]+$/).withMessage('Please provide a valid phone number'),
    
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Bio must not exceed 500 characters'),
    
    body('skills')
        .optional()
        .custom((value) => {
            if (typeof value === 'string') {
                const skills = value.split(',').map(s => s.trim()).filter(s => s);
                if (skills.length > 20) {
                    throw new Error('Maximum 20 skills allowed');
                }
            }
            return true;
        }),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }
        next();
    }
];

export const validateJobPost = [
    body('title')
        .trim()
        .notEmpty().withMessage('Job title is required')
        .isLength({ min: 3, max: 100 }).withMessage('Job title must be between 3 and 100 characters'),
    
    body('description')
        .trim()
        .notEmpty().withMessage('Job description is required')
        .isLength({ min: 50, max: 5000 }).withMessage('Job description must be between 50 and 5000 characters'),
    
    body('requirements')
        .notEmpty().withMessage('Job requirements are required'),
    
    body('salary')
        .notEmpty().withMessage('Salary is required')
        .isNumeric().withMessage('Salary must be a number')
        .custom((value) => value > 0).withMessage('Salary must be greater than 0'),
    
    body('location')
        .trim()
        .notEmpty().withMessage('Location is required'),
    
    body('jobType')
        .notEmpty().withMessage('Job type is required')
        .isIn(['Full-time', 'Part-time', 'Contract', 'Internship']).withMessage('Invalid job type'),
    
    body('experience')
        .notEmpty().withMessage('Experience level is required')
        .isNumeric().withMessage('Experience must be a number'),
    
    body('position')
        .notEmpty().withMessage('Number of positions is required')
        .isInt({ min: 1 }).withMessage('Position must be at least 1'),
    
    body('companyId')
        .notEmpty().withMessage('Company ID is required')
        .isMongoId().withMessage('Invalid company ID'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }
        next();
    }
];
