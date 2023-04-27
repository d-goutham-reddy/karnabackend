const router = require("express").Router();
const Hospital = require("../models/Hospital");
const bcrypt = require("bcrypt");

//-------------------------------------------------------------------------------------------------------
//                                           Registration of Hospital

router.post("/signup", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const newHospital = new Hospital({
        name:req.body.name,
        email: req.body.email,
        password: hashedPass,
        address:req.body.address,
        phone:req.body.phone,
        hospitalregnum:req.body.hospitalregnum,
        role: "Hospital"
      });
      const nh = await newHospital.save();
      res.status(200).json(nh);
  } 
  catch (err) {
    res.status(500).json(err);
  }
});

//-------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------
module.exports = router;