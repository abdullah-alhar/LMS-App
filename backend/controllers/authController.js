const User = require('../models/User');

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        //check nobody can sign up as admin
        if (role === 'admin') {
            return res.status(403).json({ message: 'cannot register as admin' });
        }

        //email can't be existing 
        const exists = await User.findOne({ email: email?.toLowerCase().trim() });
        if (exists) {
            return res.status(409).json({ message: 'Email already registered' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role === 'lecturer' ? 'lecturer' : 'student', //default to student if not lecturer
            isApproved: role !== 'lecturer', //lecturers need approval
        });

        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isApproved: user.isApproved,
        });
    } catch (err) {
        if(err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = { register };