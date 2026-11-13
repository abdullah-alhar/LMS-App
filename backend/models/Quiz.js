const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: [true, 'Question text is required'], trim: true },
  options: {
    type: [String],
    validate: {
      validator: (arr) => arr.length >= 2 && arr.length <= 6,
      message: 'Each question needs 2 to 6 options',
    },
  },
  correctIndex: {
    type: Number,
    required: [true, 'Correct answer is required'],
    min: [0, 'Correct answer must be one of the options'],
    validate: {
      validator: function (value) {
        return value < this.options.length;
      },
      message: 'Correct answer must be one of the options',
    },
  },
  marks: { type: Number, default: 1, min: [1, 'Marks must be at least 1'] },
});

const quizSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    timeLimit: {
      type: Number,
      required: [true, 'Time limit is required'],
      min: [1, 'Time limit must be at least 1 minute'],
      max: [180, 'Time limit cannot exceed 180 minutes'],
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Quiz needs at least one question',
      },
    },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);