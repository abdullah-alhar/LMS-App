const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    type: {
      type: String,
      enum: { values: ['file', 'video', 'link'], message: 'Type must be file, video or link' },
      required: [true, 'Type is required'],
    },
    url: { type: String, required: true },
    publicId: { type: String },   // Cloudinary's id, needed to delete the file later
    fileName: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Material', materialSchema);