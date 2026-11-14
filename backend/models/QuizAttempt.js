const mongoose = require('mongoose');

const attemptSchema = new mongoose.Schema(
    {
        quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        startedAt: { type: Date, default: Date.now },
        submittedAt: { type: Date },
        answers: {type: [Number], default: []}, //null = skiped questions
        score: { type: Number, default: 0 },
        totalMarks: { type: Number, required: true },
        status: {type: String, enum: ['in-progress', 'submitted', 'expired'], default: 'in-progress'},
    },
    { timestamps: true }
);

// One attempt per student per quiz
attemptSchema.index({ quiz: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('QuizAttempt', attemptSchema);
