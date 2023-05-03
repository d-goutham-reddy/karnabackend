const router = require("express").Router();
const BloodBank = require("../models/BloodBank");
const BloodDonation = require("../models/BloodDonation");
const OnSpotDonation=require("../models/OnSpotDonation");
const bcrypt = require("bcrypt");
const BloodRequest = require("../models/BloodRequest");
const Donor = require("../models/Donor");
const BloodPacket = require("../models/BloodPacket");

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
//                                            My Impact

// Feedbacks About Your Service
router.get("/feedbacks/:bloodbankid",async(req,res)=>{
  try{
    BloodDonation.find({status:"Completed",feedback:{"$exists":true}},'feedback',function(err,bd){
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

// Upcoming Appointments
router.get("/appointments/upcoming/:bloodbankid",async(req,res)=>{
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

// Complete Upcoming Appointment - Permanent Ban
router.put("/appointments/upcoming/complete/permanentban/:blooddonationid",async(req,res)=>{
  try{
    BloodDonation.findByIdAndUpdate(req.params.blooddonationid,{status:"Cancelled",cancelReason:"Donor has reportedly confessed about his disease or condition which makes him ineligible to donate blood for life."},{new:true},function(err,bd){
      if(err){
        res.status(500).json(err);
      }
      Donor.findByIdAndUpdate(bd.donorDetails,{permanentbanreason:req.body.permanentbanreason},{new:true},function(err,don){
        if(err){
          res.status(501).json(err);
        }
        BloodDonation.findById(req.params.blooddonationid,function(err,newbd){
          if(err){
            res.status(502).json(err);
          }
          res.status(200).json(newbd);
        }).populate('donorDetails').populate('bloodbankDetails')
      })
    })
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Complete Upcoming Appointment - Temporary Ban
router.put("/appointments/upcoming/complete/temporaryban/:blooddonationid",async(req,res)=>{
  try{
    BloodDonation.findByIdAndUpdate(req.params.blooddonationid,{status:"Cancelled",cancelReason:"Donor has reportedly confessed about condition or lifestyle habbit or travel history, etc which makes him ineligible to donate for a certain period of time."},{new:true},function(err,bd){
      if(err){
        res.status(500).json(err);
      }
      Donor.findByIdAndUpdate(bd.donorDetails,{eligibledate:req.body.eligibledate},{new:true},function(err,don){
        if(err){
          res.status(501).json(err);
        }
        BloodDonation.findById(req.params.blooddonationid,function(err,newbd){
          if(err){
            res.status(502).json(err);
          }
          res.status(200).json(newbd);
        }).populate('donorDetails').populate('bloodbankDetails')
      })
    })
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Complete Upcoming Appointment - Complete
router.put("/appointments/upcoming/complete/:blooddonationid",async(req,res)=>{
  try{
    BloodDonation.findByIdAndUpdate(req.params.blooddonationid,{status:"Completed"},{new:true},function(err,bd){
      if(err){
        res.status(500).json(err);
      }
      const neweligdate = new Date();
      if(bd.donorDetails.sex=="Male"){
        neweligdate.setDate(neweligdate.getDate() + 12 * 7);
      }
      else{
        neweligdate.setDate(neweligdate.getDate() + 16 * 7);
      }
      const newpoints=bd.donorDetails.points+100;
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
      Donor.findByIdAndUpdate(bd.donorDetails._id,{lastdonationdate:new Date(),eligibledate:neweligdate,points:newpoints,badge:newbadge},{new:true},function(err,newdon){
        if(err){
          res.status(501).json(err)
        }
        const newbbpoints=bd.bloodbankDetails.points+100;
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
        BloodBank.findByIdAndUpdate(bd.bloodbankDetails._id,{points:newbbpoints,badge:newbbbadge},{new:true},function(err,nbb){
          if(err){
            res.status(502).json(err)
          }
          BloodDonation.findById(req.params.blooddonationid,function(err,newbd){
            if(err){
              res.status(503).json(err);
            }
            res.status(200).json(newbd);
          }).populate('donorDetails').populate('bloodbankDetails')
        })
      })
    }).populate('donorDetails').populate('bloodbankDetails')
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Cancel Upcoming Appointment
router.put("/appointments/upcoming/cancel/:blooddonationid",async(req,res)=>{
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

// Completed Appointments
router.get("/appointments/completed/:bloodbankid",async(req,res)=>{
  try{
    BloodDonation.find({bloodbankDetails:req.params.bloodbankid,status:"Completed"},function(err,bd){
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

// Cancelled Appointments
router.get("/appointments/cancelled/:bloodbankid",async(req,res)=>{
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
//                                        Stock Management

// Arrival Of New Packet -> RFID Tag Near Reader -> Details Of Packet
router.get("/stock/new/details/:bloodonationid",async(req,res)=>{
  try{
    BloodDonation.findById(req.params.bloodonationid,function(err,bd){
      if(err){
        res.status(501).json(err);
      }
      res.status(200).json(bd);
    }).populate('donorDetails').populate('bloodbankDetails')
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Arrival Of New Packet -> Details(RFID) -> Proceed -> No, He's Permanently Banned
router.put("/stock/new/permanentban/:blooddonationid",async(req,res)=>{
  try{
    BloodDonation.findByIdAndUpdate(req.params.blooddonationid,{status:"Cancelled",cancelReason:"Donor has reportedly confessed about his disease or condition which makes him ineligible to donate blood for life."},{new:true},function(err,bd){
      if(err){
        res.status(500).json(err);
      }
      Donor.findByIdAndUpdate(bd.donorDetails,{permanentbanreason:req.body.permanentbanreason},{new:true},function(err,don){
        if(err){
          res.status(501).json(err);
        }
        BloodDonation.findById(req.params.blooddonationid,function(err,newbd){
          if(err){
            res.status(502).json(err);
          }
          res.status(200).json(newbd);
        }).populate('donorDetails').populate('bloodbankDetails')
      })
    })
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Arrival Of New Packet -> Details(RFID) -> Proceed -> No, He's Temporarily Banned
router.put("/stock/new/temporaryban/:blooddonationid",async(req,res)=>{
  try{
    BloodDonation.findByIdAndUpdate(req.params.blooddonationid,{status:"Cancelled",cancelReason:"Donor has reportedly confessed about condition or lifestyle habbit or travel history, etc which makes him ineligible to donate for a certain period of time."},{new:true},function(err,bd){
      if(err){
        res.status(500).json(err);
      }
      Donor.findByIdAndUpdate(bd.donorDetails,{eligibledate:req.body.eligibledate},{new:true},function(err,don){
        if(err){
          res.status(501).json(err);
        }
        BloodDonation.findById(req.params.blooddonationid,function(err,newbd){
          if(err){
            res.status(502).json(err);
          }
          res.status(200).json(newbd);
        }).populate('donorDetails').populate('bloodbankDetails')
      })
    })
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Arrival Of New Packet -> Details(RFID) -> Proceed -> Eligible -> Values -> Create
router.put("/stock/new/create/:blooddonationid",async(req,res)=>{
  try{
    BloodDonation.findByIdAndUpdate(req.params.blooddonationid,{bloodgroup:req.body.bloodgroup,plateletCount:req.body.plateletCount,haemoglobinLevel:req.body.haemoglobinLevel,rbcCount:req.body.rbcCount,report:req.body.report,arriveStatus:true},{new:true},function(err,bd){
      if(err){
        res.status(501).json(err);
      }
      const newpoints=bd.donorDetails.points+50;
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
      Donor.findByIdAndUpdate(bd.donorDetails._id,{points:newpoints,badge:newbadge},{new:true},function(err,don){
        if(err){
          res.status(502).json(err);
        }
        const newbbpoints=bd.bloodbankDetails.points+100;
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
        BloodBank.findByIdAndUpdate(bd.bloodbankDetails._id,{points:newbbpoints,badge:newbbbadge},{new:true},function(err,nbb){
          if(err){
            res.status(503).json(err);
          }
          var listBloodPackets=[]
          if(req.body.separationType=="whole"){
            const expdate=new Date();
            expdate.setDate(expdate.getDate()+35);
            const bP=new BloodPacket({
              separationType:"whole",
              expiryDate:expdate,
              bloodDonationDetails:req.params.blooddonationid
            })
            bP.save(function(err,newBP){
              if(err){
                res.status(504).json(err);
              }
              BloodPacket.findById(newBP._id,function(err,bpacket){
                if(err){
                  res.status(505).json(err);
                }
                listBloodPackets[0]=bpacket;
                res.status(200).json(listBloodPackets)
              }).populate({
                path : 'bloodDonationDetails',
                populate: [{
                  path: 'donorDetails'
                },{
                  path: 'bloodbankDetails'
                }]
              })
            });
          }
          else{
            const expdate1=new Date();
            expdate1.setDate(expdate1.getDate()+35);
            const bP1=new BloodPacket({
              separationType:"rbc",
              expiryDate:expdate1,
              bloodDonationDetails:req.params.blooddonationid
            })
            bP1.save(function(err,newBP1){
              if(err){
                res.status(506).json(err);
              }
              const expdate2=new Date();
              expdate2.setDate(expdate2.getDate()+5);
              const bP2=new BloodPacket({
                separationType:"platelet",
                expiryDate:expdate2,
                bloodDonationDetails:req.params.blooddonationid
              })
              bP2.save(function(err,newBP2){
                if(err){
                  res.status(507).json(err);
                }
                const expdate3=new Date();
                expdate3.setDate(expdate3.getDate()+365);
                const bP3=new BloodPacket({
                  separationType:"plasma",
                  expiryDate:expdate3,
                  bloodDonationDetails:req.params.blooddonationid
                })
                bP3.save(function(err,newBP3){
                  if(err){
                    res.status(508).json(err);
                  }
                  BloodPacket.findById(newBP1._id,function(err,bpacket1){
                    if(err){
                      res.status(509).json(err);
                    }
                    BloodPacket.findById(newBP2._id,function(err,bpacket2){
                      if(err){
                        res.status(510).json(err);
                      }
                      BloodPacket.findById(newBP3._id,function(err,bpacket3){
                        if(err){
                          res.status(511).json(err);
                        }
                        listBloodPackets[0]=bpacket1;
                        listBloodPackets[1]=bpacket2;
                        listBloodPackets[2]=bpacket3;
                        res.status(200).json(listBloodPackets);
                      }).populate({
                        path : 'bloodDonationDetails',
                        populate: [{
                          path: 'donorDetails'
                        },{
                          path: 'bloodbankDetails'
                        }]
                      })
                    }).populate({
                      path : 'bloodDonationDetails',
                      populate: [{
                        path: 'donorDetails'
                      },{
                        path: 'bloodbankDetails'
                      }]
                    })
                  }).populate({
                    path : 'bloodDonationDetails',
                    populate: [{
                      path: 'donorDetails'
                    },{
                      path: 'bloodbankDetails'
                    }]
                  })
                });
              });
            });
          }
        })
      })
    }).populate('donorDetails').populate('bloodbankDetails')
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Packets -> Whole or RBC or Platelet or Plasma
router.get("/stock/:bloodbankid",async(req,res)=>{
  try{
    BloodPacket.find({separationType:req.body.packettype}).populate('bloodDonationDetails').exec((err,bp)=>{
      if(err){
        res.status(501).json(err);
      }
      var listBloodPackets=[]
      for(let b of bp){
        if(b.bloodDonationDetails.bloodbankDetails==req.params.bloodbankid){
          listBloodPackets.push(b);
        }
      }
      res.status(200).json(listBloodPackets);
    })
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
//                                      Blood Bank Appointments
//                                       On Spot Appointments

// Upcoming
// router.get("/onspot/upcoming/:bloodbankid",async(req,res)=>{
//   try{
//     OnSpotDonation.find({bloodbankDetails:req.params.bloodbankid,status:"Upcoming"},function(err,osd){
//       if(err){
//         res.status(500).json(err);
//       }
//       res.status(200).json(osd);
//     }).sort({appdate:"asc"}).populate('bloodbankDetails');
//   }
//   catch(err){
//     res.status(500).json(err);
//   }
// })

// // Cancel Upcoming Appointment
// router.put("/onspot/upcoming/cancel/:onspotdonationid",async(req,res)=>{
//   try{
//     OnSpotDonation.findByIdAndUpdate(req.params.onspotdonationid,{ 
//       cancelReason:req.body.cancelReason,
//       status:"Cancelled"
//     },
//     {new:true},
//     function(err,osd){
//       if(err){
//         res.status(500).json(err);
//       }
//       res.status(200).json(osd);
//     }).populate('bloodbankDetails')
//   }
//   catch(err){
//     res.status(500).json(err);
//   }
// })

// // Cancelled Appointments
// router.get("/onspot/cancelled/:bloodbankid",async(req,res)=>{
//   try{
//     OnSpotDonation.find({bloodbankDetails:req.params.bloodbankid,status:"Cancelled"},function(err,osd){
//       if(err){
//         res.status(500).json(err);
//       }
//       res.status(200).json(osd);
//     }).populate('bloodbankDetails').sort({updatedAt:-1})
//   }
//   catch(err){
//     res.status(500).json(err);
//   }
// })

//-------------------------------------------------------------------------------------------------------
module.exports = router;