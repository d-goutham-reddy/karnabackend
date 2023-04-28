const router = require("express").Router();
const BloodBank = require("../models/BloodBank");
const BloodDonation = require("../models/BloodDonation");
const OnSpotDonation=require("../models/OnSpotDonation");
const bcrypt = require("bcrypt");
const BloodRequest = require("../models/BloodRequest");

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
//                                         Updation Of Details

router.put("/updatedetails/:bloodbankid",async(req,res)=>{
  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    BloodBank.findByIdAndUpdate(req.params.bloodbankid,
      {
        $set: req.body,
      },
      { new: true },
      function(err,bloodbank){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(bloodbank);
    });
  }
  catch (err) {
    res.status(500).json(err);
}
})

//-------------------------------------------------------------------------------------------------------
//                                         Appointments Management

//                                        Create An On-Spot Donation
router.post("/onspotdonation/:bloodbankid",async(req,res)=>{
  try {
    const bb=await BloodBank.findById(req.params.bloodbankid);
    const newonspotdonation = new OnSpotDonation({
      bloodgroup:req.body.bloodgroup,
      location:bb.name,
      appdate:req.body.appdate,
      time:req.body.time,
      fname:req.body.fname,
      mname:req.body.mname,
      lname:req.body.lname,
      email: req.body.email,
      address:req.body.address,
      phone:req.body.phone,
      sex:req.body.sex,
      DOB:req.body.DOB,
      age:req.body.age,
      bloodbankDetails:req.params.bloodbankid
    });
    const nosd = await newonspotdonation.save();
    OnSpotDonation.findById(nosd._id,function(err,osd){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(osd);
    }).populate('bloodbankDetails');
  }
  catch(err){
    res.status(500).json(err);
  }
})

//-------------------------------------------------------------------------------------------------------
//                                      Blood Bank Appointments
//                                      Registered Appointments

// Upcoming
router.get("/registered/upcoming/:bloodbankid",async(req,res)=>{
  try{
    BloodDonation.find({bloodbankDetails:req.params.bloodbankid,status:"Upcoming"},function(err,bd){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(bd);
    }).sort({appdate:1})
    // .populate('donorDetails').populate('bloodbankDetails');
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Cancel Registered Upcoming Appointment
router.put("/registered/upcoming/cancel/:blooddonationid",async(req,res)=>{
  try{
    BloodDonation.findByIdAndUpdate(req.params.blooddonationid,{
      cancelReason:req.body.cancelReason,
      status:"Cancelled"
    },
    {new:true},
    function(err,bd){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(bd);
    }).populate('donorDetails').populate('bloodbankDetails')
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Cancelled Appointments
router.get("/registered/cancelled/:bloodbankid",async(req,res)=>{
  try{
    BloodDonation.find({bloodbankDetails:req.params.bloodbankid,status:"Cancelled"},function(err,bd){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(bd);
    }).sort({updatedAt:"descending"})
    // .populate('donorDetails').populate('bloodbankDetails')
  }
  catch(err){
    res.status(500).json(err);
  }
})

//-------------------------------------------------------------------------------------------------------
//                                      Blood Bank Appointments
//                                       On Spot Appointments

// Upcoming
router.get("/onspot/upcoming/:bloodbankid",async(req,res)=>{
  try{
    OnSpotDonation.find({bloodbankDetails:req.params.bloodbankid,status:"Upcoming"},function(err,osd){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(osd);
    }).sort({appdate:"asc"}).populate('bloodbankDetails');
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Cancel Upcoming Appointment
router.put("/onspot/upcoming/cancel/:onspotdonationid",async(req,res)=>{
  try{
    OnSpotDonation.findByIdAndUpdate(req.params.onspotdonationid,{ 
      cancelReason:req.body.cancelReason,
      status:"Cancelled"
    },
    {new:true},
    function(err,osd){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(osd);
    }).populate('bloodbankDetails')
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Cancelled Appointments
router.get("/onspot/cancelled/:bloodbankid",async(req,res)=>{
  try{
    OnSpotDonation.find({bloodbankDetails:req.params.bloodbankid,status:"Cancelled"},function(err,osd){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(osd);
    }).populate('bloodbankDetails').sort({updatedAt:-1})
  }
  catch(err){
    res.status(500).json(err);
  }
})


//-------------------------------------------------------------------------------------------------------
//                                   Hospital Requests Management

// Waiting
router.get("/requests/waiting",async(req,res)=>{
  try{
    BloodRequest.find({status:"Waiting"},function(err,br){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(br);
    }).populate('hospitalDetails').sort({createdAt:"asc"})
  }
  catch(err){
    res.status(500).json(err);
  }
})

//-------------------------------------------------------------------------------------------------------
module.exports = router;