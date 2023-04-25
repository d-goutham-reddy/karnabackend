const router = require("express").Router();
const Donor = require("../models/Donor");
const bcrypt = require("bcrypt");

//-------------------------------------------------------------------------------------------------------
//                                             Registration of Donor

router.post("/signup", async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(req.body.password, salt);
        const newDonor = new Donor({
            fname:req.body.fname,
            mname:req.body.mname,
            lname:req.body.lname,
            email: req.body.email,
            password: hashedPass,
            address:req.body.address,
            phone:req.body.phone,
            sex:req.body.sex,
            DOB:req.body.DOB,
            age:req.body.age,
            bloodgroup:req.body.bloodgroup,
            aadharId:req.body.aadharId,
            emergencycontactname:req.body.emergencycontactname,
            emergencycontactphone:req.body.emergencycontactphone,
            role: "Donor"
          });
          const nd = await newDonor.save();
          res.status(200).json(nd);
      } 
      catch (err) {
        res.status(500).json(err);
      }
});

//-------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------
module.exports = router;