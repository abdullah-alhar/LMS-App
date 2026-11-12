const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        code: {
            type: String,
            required: [true, 'Code is required'],
            unique: true,
            uppercase: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        lecturer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        enrolKey: {
            type: String,
            trim: true,
            select: false, //hidden from course lists, like the password
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Course', courseSchema);