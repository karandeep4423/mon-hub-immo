"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
const MONGODB = process.env.MONGODB_URL || '';
if (!MONGODB) {
    console.error('❌ MONGODB_URL is not defined in environment variables');
    process.exit(1);
}
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(MONGODB, {
            serverSelectionTimeoutMS: 10000, // Increased timeout for Atlas
            socketTimeoutMS: 45000,
            bufferCommands: false,
            maxPoolSize: 10,
        });
        console.log(`✅ MongoDB Connected: ${mongoose_1.default.connection.host}`);
    }
    catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
// Handle connection events
mongoose_1.default.connection.on('disconnected', () => {
    console.log('❌ MongoDB disconnected');
});
mongoose_1.default.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
});
mongoose_1.default.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err);
});
