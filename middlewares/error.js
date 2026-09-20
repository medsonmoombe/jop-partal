import ErrorHandler from '../utils/errorHandler.js';

const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // Wrong MongoDB Id error
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please use a different ${field}.`;
        err = new ErrorHandler(message, 400);
    }

    // Wrong JWT error
    if (err.name === 'JsonWebTokenError') {
        const message = 'JSON Web Token is invalid. Try again.';
        err = new ErrorHandler(message, 401);
    }

    // JWT expire error
    if (err.name === 'TokenExpiredError') {
        const message = 'JSON Web Token is expired. Try again.';
        err = new ErrorHandler(message, 401);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        err = new ErrorHandler(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export default errorMiddleware;
