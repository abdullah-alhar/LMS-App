const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Not logged in" });
    }
    
    const token = header.split(" ")[1]; //"Bearer abc123" to "abc123"

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if(!user) {
            return res.status(401).json({ message: "User no longer exists" });
        }
        
        req.user = user; 
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'You do not have permission' });
        }
        next();
    }
}
module.exports = {protect, authorize};