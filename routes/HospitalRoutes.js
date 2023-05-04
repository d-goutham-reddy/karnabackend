const router = require("express").Router();
const Hospital = require("../models/Hospital");
const bcrypt = require("bcrypt");
const BloodRequest = require("../models/BloodRequest");
const BloodPacket = require("../models/BloodPacket");
const BloodDonation = require("../models/BloodDonation");
const Donor = require("../models/Donor");
const BloodBank = require("../models/BloodBank");

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
//                                         Blood Requests Management

// Create New Request
router.post("/requests/create/:hospitalid",async(req,res)=>{
  try{
    const hospital=await Hospital.findById(req.params.hospitalid);
    if(hospital){
      const newreq=new BloodRequest({
        bloodgroup:req.body.bloodgroup,
        component:req.body.component,
        purpose:req.body.purpose,
        fname:req.body.fname,
        mname:req.body.mname,
        lname:req.body.lname,
        email:req.body.email,
        address:req.body.address,
        phone: req.body.phone,
        sex:req.body.sex,
        DOB:req.body.DOB,
        age:req.body.age,
        hospitalDetails: req.params.hospitalid
      });
      const nreq=await newreq.save();
      BloodRequest.findById(nreq._id).populate('hospitalDetails').exec((err,r)=>{
        if(err){
          res.status(500).json(err);
        }
        res.status(200).json(r);
      })
    }
  }
  catch(err){
    res.status(500).json(err);
  }
})

//-------------------------------------------------------------------------------------------------------
//                                         Blood Requests Management

// Waiting Requests
router.get("/requests/waiting/:hospitalid",async(req,res)=>{
  try{
    BloodRequest.find({hospitalDetails:req.params.hospitalid,status:"Waiting"},function(err,br){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(br);
    }).populate('hospitalDetails').sort({createdAt:"ascending"})
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Cancel Waiting Request
router.put("/requests/waiting/cancel/:bloodrequestid",async(req,res)=>{
  try{
    BloodRequest.findByIdAndUpdate(req.params.bloodrequestid,{
      cancelReason:req.body.cancelReason,
      status:"Cancelled"
    },{
      new:true
    },function(err,br){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(br);
    }).populate('hospitalDetails')
  }
  catch(err){
    res.status(500).json(err)
  }
})

// Confirmed Requests
router.get("/requests/confirmed/:hospitalid",async(req,res)=>{
  try{
    BloodPacket.find({availablestatus:false},function(err,bp){
      if(err){
        res.status(501).json(err);
      }
      var lbp=[]
      for(let b of bp){
        if(b.bloodRequestDetails.status=="Confirmed" && b.bloodRequestDetails.hospitalDetails._id==req.params.hospitalid){
          lbp.push(b);
        }
      }
      res.status(200).json(lbp);
    }).populate({
      path : 'bloodDonationDetails',
      populate: [{
        path: 'bloodbankDetails'
      }]
    }).populate({
      path : 'bloodRequestDetails',
      populate: {
        path: 'hospitalDetails'
      }
    })
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Confirmed Request -> Arrived
router.put("/requests/confirmed/arrived/:bloodrequestid/:bloodpacketid",async(req,res)=>{
  try{
    BloodPacket.findById(req.params.bloodpacketid,function(err,bp){
      if(err){
        res.status(501).json(err);
      }
      if(bp.bloodRequestDetails==req.params.bloodrequestid){
        BloodRequest.findByIdAndUpdate(req.params.bloodrequestid,{status:"Delivered"},{new:true},function(err,br){
          if(err){
            res.status(502).json(err);
          }
          BloodPacket.findById(req.params.bloodpacketid,function(err,newbp){
            if(err){
              res.status(503).json(err);
            }
            res.status(200).json(newbp);
          }).populate({
            path : 'bloodDonationDetails',
            populate: [{
              path: 'bloodbankDetails'
            }]
          }).populate({
            path : 'bloodRequestDetails',
            populate: {
              path: 'hospitalDetails'
            }
          })
        })
      }
      else{
        res.status(400).json("The Blood Packet You Have Received Does Not Belong To The Specific Request");
      }
    })
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Confirmed Request -> Arrived ->Submit HeartWarming Msg
router.put("/requests/confirmed/arrivedsubmit/:bloodpacketid",async(req,res)=>{
  try{
    BloodPacket.findById(req.params.bloodpacketid,function(err,bp){
      if(err){
        res.status(501).json(err);
      }
      BloodDonation.findByIdAndUpdate(bp.bloodDonationDetails._id,{heartwarmingmsg:req.body.heartwarmingmsg},{new:true},function(err,bd){
        if(err){
          res.status(502).json(err)
        }
        const newlivessavedmeter=bp.bloodDonationDetails.donorDetails.livessavedmeter+1;
        const newpoints=bp.bloodDonationDetails.donorDetails.points+100;
        var newbadge;
        if(newpoints<200){
          newbadge="Enthusiast";
        }
        else if(newpoints<300){
          newbadge="Elite";
        }
        else if(newpoints<400){
          newbadge="Pro";
        }
        else if(newpoints<500){
          newbadge="Guru";
        }
        else if(newpoints<600){
          newbadge="Specialist";
        }
        else if(newpoints>=600){
          newbadge="Champion";
        }
        Donor.findByIdAndUpdate(bp.bloodDonationDetails.donorDetails._id,{livessavedmeter:newlivessavedmeter,points:newpoints,badge:newbadge},{new:true},function(err,don){
          if(err){
            res.status(503).json(err)
          }
          const newlivessavedmeter=bp.bloodDonationDetails.bloodbankDetails.livessavedmeter+1;
          const newbbpoints=bp.bloodDonationDetails.bloodbankDetails.points+100;
          var newbbbadge;
          if(newbbpoints<200){
            newbbbadge="Enthusiast";
          }
          else if(newbbpoints<300){
            newbbbadge="Elite";
          }
          else if(newbbpoints<400){
            newbbbadge="Pro";
          }
          else if(newbbpoints<500){
            newbbbadge="Guru";
          }
          else if(newbbpoints<600){
            newbbbadge="Specialist";
          }
          else if(newbbpoints>=600){
            newbbbadge="Champion";
          }
          BloodBank.findByIdAndUpdate(bp.bloodDonationDetails.bloodbankDetails._id,{livessavedmeter:newlivessavedmeter,points:newbbpoints,badge:newbbbadge},{new:true},function(err,bb){
            if(err){
              res.status(504).json(err);
            }
            BloodPacket.findById(req.params.bloodpacketid,function(err,newbp){
              if(err){
                res.status(505).json(err);
              }
              res.status(200).json(newbp);
            }).populate({
              path : 'bloodDonationDetails',
              populate: [{
                path: 'bloodbankDetails'
              },{
                path: 'donorDetails'
              }]
            }).populate({
              path : 'bloodRequestDetails',
              populate: {
                path: 'hospitalDetails'
              }
            })
          })
        })
      })
    }).populate({
      path : 'bloodDonationDetails',
      populate: [{
        path: 'donorDetails'
      },{
        path: 'bloodbankDetails'
      }]
    })
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Delivered Requests
router.get("/requests/delivered/:hospitalid",async(req,res)=>{
  try{
    BloodPacket.find({availablestatus:false},function(err,bp){
      if(err){
        res.status(501).json(err);
      }
      var lbp=[];
      for(let b of bp){
        if(b.bloodRequestDetails.status=="Delivered" && b.bloodRequestDetails.hospitalDetails._id==req.params.hospitalid){
          lbp.push(b);
        }
      }
      res.status(200).json(lbp);
    }).populate({
      path : 'bloodDonationDetails',
      populate: [{
        path: 'bloodbankDetails'
      }]
    }).populate({
      path : 'bloodRequestDetails',
      populate: {
        path: 'hospitalDetails'
      }
    })
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Cancelled Requests
router.get("/requests/cancelled/:hospitalid",async(req,res)=>{
  try{
    BloodRequest.find({hospitalDetails:req.params.hospitalid,status:"Cancelled"},function(err,br){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(br);
    }).populate('hospitalDetails').sort({updatedAt:"desc"})
  }
  catch(err){
    res.status(500).json(err);
  }
})
//-------------------------------------------------------------------------------------------------------
module.exports = router;