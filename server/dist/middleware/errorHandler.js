"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../utils/AppError");
const errorHandler = (err, req, res) => {
    let error = { ...err };
    error.message = err.message;
    // Log error
    console.error('Error:', err);
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new AppError_1.AppError(message, 404);
    }
    // Mongoose duplicate key
    if (err.name === 'MongoServerError' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        typeof err.code !== 'undefined' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new AppError_1.AppError(message, 400);
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const message = Object.values(err.errors).map((val) => val.message).join(', ');
        error = new AppError_1.AppError(message, 400);
    }
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal Server Error'
    });
};
exports.errorHandler = errorHandler;
