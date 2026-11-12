const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            lowercase: true,
            unique: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false, 
        },
        role: {
            type: String,
            enum: ['student', 'lecturer', 'admin'],
            default: 'student',
        },
        isApproved: {
            type: Boolean,
            default: true,
        },
    },
    {timestamps: true}
);

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});


module.exports = mongoose.model('User', userSchema);