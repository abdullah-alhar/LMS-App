const mongoose = require('mongoose');

//one document = one link: "this student joined this course"
const enrolmentSchema = new mongoose.Schema(
    {
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    },
    { timestamps: true }
);

//one student can join one course only once (compound unique index)
enrolmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrolment', enrolmentSchema);
