const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/expiry_db';
    try {
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 2000
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.warn(`Local MongoDB Connection Failed: ${error.message}`);
        console.log(`Spinning up MongoMemoryServer in-memory database fallback...`);
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongoServer = await MongoMemoryServer.create();
            const uri = mongoServer.getUri();
            const conn = await mongoose.connect(uri);
            console.log(`In-Memory MongoDB Connected Successfully: ${conn.connection.host}`);
            
            // Auto-seed default test user for seamless login during dev
            try {
                const User = require('../models/user');
                const bcrypt = require('bcryptjs');
                const existingUser = await User.findOne({ email: 'testuser@example.com' });
                if (!existingUser) {
                    const hashedPassword = await bcrypt.hash('password123', 10);
                    await User.create({
                        name: 'Test User',
                        email: 'testuser@example.com',
                        password: hashedPassword
                    });
                    console.log('⚡ Auto-seeded demo account: testuser@example.com / password123');
                }
            } catch (seedErr) {
                console.warn('Seed account warning:', seedErr.message);
            }
        } catch (fallbackError) {
            console.error(`MongoDB Fallback Failed: ${fallbackError.message}`);
            process.exit(1);
        }
    }
};

module.exports = connectDB;

