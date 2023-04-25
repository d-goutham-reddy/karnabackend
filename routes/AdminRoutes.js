const router = require("express").Router();
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");

//-------------------------------------------------------------------------------------------------------
//                                               Creation of Admin

router.post("/create", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const newAdmin = new Admin({
      email: req.body.email,
      password: hashedPass,
      role: "Admin",
    });
    const admin = await newAdmin.save();
    res.status(200).json(admin);
  } 
  catch (err) {
    res.status(500).json(err);
  }
});

//-------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------
module.exports = router;