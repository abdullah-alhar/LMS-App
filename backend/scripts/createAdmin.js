require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const createAdmin = async () => {
    try {
        await connectDB();

        const exists = await User.findOne({ email: process.env.ADMIN_EMAIL});
        if (exists) {
            console.log('Admin user already exists');
        }
        else {
            await User.create({
                name: process.env.ADMIN_NAME,
                email: process.env.ADMIN_EMAIL,
                password: process.env.ADMIN_PASSWORD,
                role: 'admin'
            });
            console.log('Admin user created');
        }
    } catch (err) {
        console.log('Failed:', err.message);
    } finally {
        await mongoose.disconnect();
    }
};

createAdmin();