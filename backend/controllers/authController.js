const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
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

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        //both filds are required
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        //find the user and password check
        const user = await User.findOne({ email: email?.toLowerCase().trim() }).select('+password');

        //for no user or wrong password
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if(!user.isApproved) {
            return res.status(403).json({ message: 'Account is waiting for admin approval' });
        }
        res.status(200).json({
      token: generateToken(user),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

module.exports = { register, login, getMe };