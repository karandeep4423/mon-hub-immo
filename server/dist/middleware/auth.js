"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jwt_1 = require("../utils/jwt");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Access token required'
        });
        return;
    }
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        req.userId = decoded.userId;
        next();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }
    catch (error) {
        res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};
exports.authenticateToken = authenticateToken;
