const jwt = require('jsonwebtoken');
const Mentor = require('../model/mentor');

const authRecruiter = async (req, res, next) => {
  // Attempt to get the token from cookies or fallback to body
  const refreshToken = req.cookies?.recrefreshToken   || req.body.recrefreshToken  ;
  console.log(refreshToken)

  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized: No refresh token provided" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(refreshToken, 'somesupersecretkey'); 

    const user = await Mentor.findById(decoded._id);

    if (!user) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    if (user.refreshTokenrecruiter !== refreshToken) {
      return res.status(403).json({ message: "Forbidden: Invalid refresh token" });
    }

    req.recruiteruserId = user._id;
    req.recruiteruser= user; // Attach the user object if needed
    console.log(req.recruiteruserId)
    next();

  } catch (err) {
    return res.status(500).json({ message: "Error in recruiter authentication", error: err.message });
  }
};

module.exports = authRecruiter;
