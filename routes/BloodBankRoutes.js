const router = require("express").Router();
const BloodBank = require("../models/BloodBank");
const bcrypt = require("bcrypt");

//-------------------------------------------------------------------------------------------------------
//                                        Registration of Blood Bank

router.post("/signup", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const newBloodBank = new BloodBank({
        name:req.body.name,
        email: req.body.email,
        password: hashedPass,
        address:req.body.address,
        phone:req.body.phone,
        bloodbankregnum:req.body.bloodbankregnum,
        role: "Blood Bank"
      });
      const bb = await newBloodBank.save();
      res.status(200).json(bb);
  } 
  catch (err) {
    res.status(500).json(err);
  }
});

//-------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------
module.exports = router;