const router = require("express").Router();
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const BloodBank = require("../models/BloodBank");
const Hospital = require("../models/Hospital");

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
//                                            Login of Admin

router.post("/login",async(req,res)=>{
  try{
    const a=await Admin.findOne({email:req.body.email})
    if(a){
      const validated=await bcrypt.compare(req.body.password, a.password);
      if(validated){
        res.status(200).json(a);
      }
      else{
        res.status(400).json("Wrong Password!")
      }
    }
    else{
      res.status(400).json("No Such User Found!")
    }
  }
  catch(err){
    res.status(500).json(err);
  }
})

//-------------------------------------------------------------------------------------------------------
//                                         Verify Registrations

// Blood Bank
router.get("/registrations/bloodbank",async(req,res)=>{
  try{
    BloodBank.find({verificationStatus:"Pending"},function(err,bb){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(bb);
    })
  }
  catch(err){
    res.status(500).json(err);
  }
})

//Verify Blood Bank
router.put("/registrations/bloodbank/verify/:bloodbankid",async(req,res)=>{
  try{
    BloodBank.findByIdAndUpdate(req.params.bloodbankid,{verificationStatus:"Verified"},{new:true},function(err,bb){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(bb);
    })
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Cancel Blood Bank Registration
router.delete("/registrations/bloodbank/cancel/:bloodbankid",async(req,res)=>{
  try{
    BloodBank.findByIdAndDelete(req.params.bloodbankid,function(err,bb){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(bb);
    })
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Hospital
router.get("/registrations/hospital",async(req,res)=>{
  try{
    Hospital.find({verificationStatus:"Pending"},function(err,hosp){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(hosp);
    })
  }
  catch(err){
    res.status(500).json(err);
  }
})

//Verify Hospital
router.put("/registrations/hospital/verify/:hospitalid",async(req,res)=>{
  try{
    Hospital.findByIdAndUpdate(req.params.hospitalid,{verificationStatus:"Verified"},{new:true},function(err,hosp){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(hosp);
    })
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Cancel Hospital Registration
router.delete("/registrations/hospital/cancel/:hospitalid",async(req,res)=>{
  try{
    Hospital.findByIdAndDelete(req.params.hospitalid,function(err,hosp){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(hosp);
    })
  }
  catch(err){
    res.status(500).json(err);
  }
})

//-------------------------------------------------------------------------------------------------------
module.exports = router;