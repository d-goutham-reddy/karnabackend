const router = require("express").Router();
const Donor = require("../models/Donor");
const bcrypt = require("bcrypt");
const BloodDonation = require("../models/BloodDonation");
const BloodBank = require("../models/BloodBank");

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
      emergencycontactphone:req.body.emergencycontactphone
    });
    const nd = await newDonor.save();
    res.status(200).json(nd);
  } 
  catch (err) {
    res.status(500).json(err);
  }
});

//-------------------------------------------------------------------------------------------------------
//                                             New Blood Donation

router.post("/newblooddonation/:donorid/:bloodbankid", async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.donorid);
    const bloodbank=await BloodBank.findById(req.params.bloodbankid);
    if(donor){
      if(bloodbank){
        if(donor.permanentbanreason=="false"){
          if(donor.eligibledate<new Date()){
            const newblooddonation = new BloodDonation({
              location:bloodbank.name,
              time:req.body.time,
              bloodgroup:donor.bloodgroup,
              donorDetails: req.params.donorid,
              bloodbankDetails: req.params.bloodbankid
            });
            const nbd=await newblooddonation.save();
            BloodDonation.findById(nbd._id,function(err,bd){
              if(err){
                res.status(500).json(err);
              }
              res.status(200).json(bd)
            }).populate('donorDetails').populate('bloodbankDetails')
          }
          else{
            res.status(402).json("Donor Not Eligible To Donate As It Is Yet To Pass The Eligible Date");
          }
        }
        else{
          res.status(402).json("Donor Not Eligible To Donate As He Is Permanently Banned");
        }
      }
      else{
        res.status(401).json("No Such Blood Bank Found");
      }
    }
    else{
      res.status(401).json("No Such Donor Found");
    }
  } 
  catch (err) {
    res.status(500).json(err);
  }
});

//                                         Your Appointments -> Upcoming
router.get("/upcomingappointments/:donorid",async(req,res)=>{
  try{
    BloodDonation.find({donorDetails:req.params.donorid,status:"Upcoming"},function(err,bd){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(bd);
    })
    // .populate('donorDetails').populate('bloodbankDetails')
  }
  catch(err){
    res.status(500).json(err);
  }
})

//-------------------------------------------------------------------------------------------------------
//                                         Updation Of Details 
//                                                  &
//                                           Feedback Submit

router.put("/updatedetails/:donorid",async(req,res)=>{
  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    Donor.findByIdAndUpdate(req.params.donorid,
      {
        $set: req.body,
      },
      { new: true },
      function(err,donor){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(donor);
    });
  }
  catch (err) {
    res.status(500).json(err);
}
})

//-------------------------------------------------------------------------------------------------------
//                                  Just For Practice (Not Used In Front-End)

// Donor Details
router.get("/getdetails/:donorid",async(req,res)=>{
  try{
    const d=await Donor.findById(req.params.donorid);
    if(d){
      res.status(200).json(d);
    }
    else{
      res.status(401).json("No Such Donor Found");
    }
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Blood Donation Details
router.get("/getblooddonationdetails/:blooddonationid",async(req,res)=>{
  try{
    BloodDonation.findById(req.params.blooddonationid).populate('donorDetails').populate('bloodbankDetails').exec((err,bd)=>{
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(bd);
    })
  }
  catch(err){
    res.status(500).json(err);
  }
})

//-------------------------------------------------------------------------------------------------------

module.exports = router;