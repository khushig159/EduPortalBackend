const express = require('express');
const router = express.Router();
const userContoller=require('../controller/user')
const Student=require('../model/user')
const authMentor=require('../middleware/auth-mentor')
const authUser=require('../middleware/auth-user')
const Mentor=require('../model/mentor')

router.get('/mentor',authUser,userContoller.getmentors)

router.post('/requestMentor', userContoller.createRequest);

router.post('/respondMentor', userContoller.respondRequest);

router.get('/getuser', authUser, userContoller.getuser)
router.get('/getmentor', authMentor, userContoller.getmentor)

router.get("/getuser/:id",async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await Student.findById(userId)
      .select("-password -userrefreshtoken -resetToken -resetTokenExpiration");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
});
router.get("/getmentor/:id",async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await Mentor.findById(userId)
      .select("-password -refreshTokenrecruiter -resetToken -resetTokenExpiration");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports=router