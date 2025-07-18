import mongoose from 'mongoose';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();

const MONGODB = process.env.MONGODB_URL || '';

if (!MONGODB) {
    console.error('❌ MONGODB_URL is not defined in environment variables');
    process.exit(1);
}

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(MONGODB, {
            serverSelectionTimeoutMS: 10000, // Increased timeout for Atlas
            socketTimeoutMS: 45000,
            bufferCommands: false,
            maxPoolSize: 10,
        });
        console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
    console.log('❌ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB error:', err);
});