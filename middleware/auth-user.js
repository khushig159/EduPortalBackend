const jwt = require('jsonwebtoken');
const Student = require('../model/user')
require('dotenv').config()

const authSeeker = async (req, res, next) => {
    console.log("Cookies received:", req.cookies);
    console.log("Authorization header:", req.headers.authorization);
    const refreshToken = req.cookies?.userrefreshToken || req.body.userrefreshToken;
    console.log(refreshToken)
    if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_USER);
        const student = await Student.findById(decoded.userId);
        if (!student) {
            return res.status(404).json({ message: "User not found" });
        }
        if (student.refreshToken !== refreshToken) {
            return res.status(403).json({ message: "Forbidden" });
        }
        req.userId = student._id;
        next();
    } catch (error) {
        return res.status(500).json({ message: "Error in authentication" });
    }
}
module.exports = authSeeker;