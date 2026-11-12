const mongoose = require('mongoose');
const User = require('../models/User');

//get pending lecturer requests
//errors are sent to errorHandler automatically (Express 5)
const getPendingLecturer = async (req, res) => {
    const lecturers = await User.find({ role: 'lecturer', isApproved: false });
    res.status(200).json(lecturers);
};

//approve lecturer request
const approveLecturer = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid User ID' });
    }

    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'lecturer') {
        return res.status(400).json({ message: 'Only lecturers need approval' });
    }

    user.isApproved = true;
    await user.save();

    res.status(200).json({ message: 'Lecturer approved', user });
};

module.exports = { getPendingLecturer, approveLecturer };