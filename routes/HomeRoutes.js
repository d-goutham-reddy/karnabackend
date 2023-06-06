const router = require("express").Router();
const Donor = require("../models/Donor");
const OrganRequest = require("../models/OrganRequest");
const BloodPacket = require("../models/BloodPacket");

//-------------------------------------------------------------------------------------------------------
//                                               Home Page Routes

// Lives Saved Meter
router.get("/livessavedmeter", async (req, res) => {
  try {
    Donor.find({},function(err,don){
      if(err){
        res.status(501).json(err);
      }
      let lives=0
      for(i of don){
        lives+=i.livessavedmeter;
      }
      OrganRequest.find({status:{ $in: ['Booked', 'Arrived'] }},function(err,org){
        if(err){
          res.status(501).json(err);
        }
        lives+=org.length
        res.status(200).json(lives)
      })
    })
  } 
  catch (err) {
    res.status(500).json(err);
  }
});

// Organs Donated
router.get("/organsdonated",async(req,res)=>{
  try{
    OrganRequest.find({status:{ $in: ['Booked', 'Arrived'] }},function(err,org){
      if(err){
        res.status(501).json(err);
      }
      res.status(200).json(org.length)
    })
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Blood Packets Donated
router.get("/bloodpacketsdonated",async(req,res)=>{
  try{
    BloodPacket.find({},function(err,bp){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(bp.length)
    })
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Experiences In The Website
router.get("/experiences",async(req,res)=>{
  try{
    Donor.find({feedback:{"$exists":true}},'feedback',function(err,don){
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
module.exports = router;