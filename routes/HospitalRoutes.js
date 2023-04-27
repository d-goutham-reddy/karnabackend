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
//                                         Updation Of Details

router.put("/updatedetails/:hospitalid",async(req,res)=>{
  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    Hospital.findByIdAndUpdate(req.params.hospitalid,
      {
        $set: req.body,
      },
      { new: true },
      function(err,hosp){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(hosp);
    });
  }
  catch (err) {
    res.status(500).json(err);
}
})

//-------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------
module.exports = router;