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
//                                            Login of Donor

router.post("/login",async(req,res)=>{
  try{
    const a=await Donor.findOne({email:req.body.email})
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
        fname:req.body.fname,
        mname:req.body.mname,
        lname:req.body.lname,
        password: req.body.password,
        address:req.body.address,
        phone:req.body.phone,
        sex:req.body.sex,
        DOB:req.body.DOB,
        age:req.body.age,
        bloodgroup:req.body.bloodgroup,
        aadharId:req.body.aadharId,
        emergencycontactname:req.body.emergencycontactname,
        emergencycontactphone:req.body.emergencycontactphone,
        volunteer:req.body.volunteer,
        organRequest:req.body.organRequest
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

// Feedback About Experience In Website
router.put("/feedback/:donorid",async(req,res)=>{
  try{
    Donor.findByIdAndUpdate(req.params.donorid,{feedback:req.body.feedback},{new:true},function(err,don){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(don);
    })
  }
  catch(err){
    res.status(500).json(err);
  }
})

//-------------------------------------------------------------------------------------------------------
//                                             New Blood Donation

// New Blood Donation -> Choose the location where you wish to donate
router.get("/newblooddonation/location",async(req,res)=>{
  try{
    BloodBank.find({verificationStatus:"Verified"},'name',function(err,bb){
      if(err){
        res.status(501).json(err);
      }
      res.status(200).json(bb)
    })
  }
  catch(err){
    res.status(500).json(err);
  }
})

// New Blood Donation -> Book
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
              appdate:req.body.appdate,
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
            res.status(402).json("Donor Not Eligible To Donate As He Is Yet To Pass The Eligible Date");
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

//-------------------------------------------------------------------------------------------------------
//                                         Your Appointments

// Upcoming Appointments
router.get("/upcomingappointments/:donorid",async(req,res)=>{
  try{
    BloodDonation.find({donorDetails:req.params.donorid,status:"Upcoming"},function(err,bd){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(bd);
    }).sort({appdate:"asc"})
    // .populate('donorDetails').populate('bloodbankDetails')
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Cancel Upcoming Appointment
router.put("/upcomingappointments/cancel/:blooddonationid",async(req,res)=>{
  try{
    BloodDonation.findByIdAndUpdate(req.params.blooddonationid,{
      cancelReason:req.body.cancelReason,
      status:"Cancelled"
    },
    { new:true },
    function(err,bd){
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

// Completed Appointments
router.get("/completedappointments/:donorid",async(req,res)=>{
  try{
    BloodDonation.find({status:"Completed",donorDetails:req.params.donorid},function(err,bd){
      if(err){
        res.status(501).json(err);
      }
      res.status(200).json(bd);
    }).populate('bloodbankDetails').sort({updatedAt:"descending"})
    // .populate('donorDetails')
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Completed Appointments -> Feedback
router.put("/completedappointments/feedback/:blooddonationid",async(req,res)=>{
  try{
    BloodDonation.findByIdAndUpdate(req.params.blooddonationid,{feedback:req.body.feedback},{new:true},function(err,bd){
      if(err){
        res.status(501).json(err);
      }
      res.status(200).json(bd);
    }).populate('bloodbankDetails')
    // .populate('donorDetails')
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Cancelled Appointments
router.get("/cancelledappointments/:donorid",async(req,res)=>{
  try{
    BloodDonation.find({'donorDetails':req.params.donorid, status:"Cancelled"},function(err,bd){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(bd);
    }).sort({updatedAt:"desc"})
    // .populate('donorDetails').populate('bloodbankDetails');
  }
  catch(err){
    res.status(500).json(err);
  }
})

//-------------------------------------------------------------------------------------------------------
//                                      My Impact Page

// Words From Lives You Saved
router.get("/words/:donorid",async(req,res)=>{
  try{
    BloodDonation.find({status:"Completed",heartwarmingmsg:{"$exists":true},donorDetails:req.params.donorid},'heartwarmingmsg',function(err,bd){
      if(err){
        res.status(501).json(err);
      }
      res.status(200).json(bd);
    })
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Leadership Board
router.get("/leadership/:donorid",async(req,res)=>{
  try{
    Donor.find({}).sort({points:-1}).exec().then(
      donors=>{
        const targetdonor=donors.find(donor=>donor._id==req.params.donorid);
        if(targetdonor){
          const position=donors.findIndex(donor=>donor._id==req.params.donorid)+1;
          const msg=position+'/'+donors.length
          res.status(200).json(msg)
        }
        else{
          res.status(404).json("Requested Donor Not found")
        }
      }
    )
  }
  catch(err){
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