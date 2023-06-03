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
//                                            Login of Hospital

router.get("/login",async(req,res)=>{
  try{
    const a=await Hospital.findOne({email:req.body.email})
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

// Create New Blood Request
router.post("/requests/create/blood/:hospitalid",async(req,res)=>{
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

router.post("/requests/create/organ",async(req,res)=>{
  try{
    const newreq=new OrganRequest({
      name:req.body.name,
      address:req.body.address,
      phone: req.body.phone,
      sex:req.body.sex,
      DOB:req.body.DOB,
      age:req.body.age,
      bloodgroup:req.body.bloodgroup,
      diabetes:req.body.diabetes,
      priororgantransplant:req.body.priororgantransplant,      
      dialysisDate:req.body.dialysisDate,
      dialysisDays:req.body.dialysisDays,
      kidneydisease:req.body.kidneydisease,
      hlatype:req.params.hlatype,
      hlatypingmethod:req.body.hlatypingmethod,
      pralevel:req.body.pralevel,
      hlaantigen:req.body.hlaantigen,
      pramethod:req.body.pramethod,      
      sensitizationreason:req.body.sensitizationreason,
      height:req.body.height,
      weight:req.body.weight,
      surgicalevaluationremarks:req.body.surgicalevaluationremarks,
      otherdetails:req.body.otherdetails
    });
    newreq.save(function(err,org){
      if(err){
        res.status(500).json(err);
      }
      res.status(200).json(org);
    })
  }
  catch(err){
    res.status(500).json(err);
  }
})
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
//                                         Donor Registry

// Donor Registry
router.get("/donorregistry",async(req,res)=>{
  try{
    Donor.find({organRequest:true,dead:false},function(err,don){
      res.status(200).json(don);
    })
  }
  catch(err){
    res.status(500).json(err);
  }
})

// Donor Registry -> Confirm Death -> WillingToDonate? -> No
router.put("/donorregistry/confirm/no/:donorid",async(req,res)=>{
  try{
    Donor.findByIdAndUpdate(req.params.donorid,{dead:true},{new:true},function(err,don){
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

// Donor Registry -> Confirm Death -> WillingToDonate? -> Yes -> Submit
router.put("/donorregistry/confirm/yes/submit/:donorid",async(req,res)=>{
  try{
    const ageall=0.0128*(req.body.age-40)
      let age18=0
      if(req.body.age<18){
        age18+=-0.0194*(req.body.age-18)
      }
      let age50=0
      if(req.body.age>50){
        age50+=0.0107*(req.body.age-50)
      }
      const height=-0.0464*(req.body.height-170)/10
      let weight=0
      if(req.body.weight<80){
        weight+=-0.0199*(req.body.weight-80)/5
      }
      let ethnicity=0
      if(req.body.ethnicity=="Black"){
        ethnicity+=0.1790
      }
      let hypertension=0
      if(req.body.hypertension){
        hypertension+=0.1260
      }
      let diabetes=0
      if(req.body.diabetes){
        diabetes+=0.1300
      }
      let cod=0
      if(req.body.causeOfDeath=="Cerebrovascular Accident"){
        cod+=0.0881
      }
      let creatinine=0.2200*(req.body.creatinine-1)
      if(req.body.creatinine>1.5){
        creatinine+=-0.2090*(req.body.creatinine-1)
      }
      let hcv=0
      if(req.body.hcv){
        hcv+=0.2400
      }
      let dcd=0
      if(req.body.dcd){
        dcd+=0.1330
      }
      const xb=ageall+age18+age50+height+weight+ethnicity+hypertension+diabetes+cod+creatinine+hcv+dcd;
      const kdri=Math.exp(xb);
      const kdrimed=kdri/1.33586831546044;
      let KDPI
      if (kdrimed > 0.00000000000000 && kdrimed <= 0.45068731085587) {
        KDPI = 0;
      } else if (kdrimed > 0.45068731085587 && kdrimed <= 0.53693152638850) {
        KDPI = 1;
      } else if (kdrimed > 0.53693152638850 && kdrimed <= 0.56012914599981) {
        KDPI = 2;
      } else if (kdrimed > 0.56012914599981 && kdrimed <= 0.57594408135238) {
        KDPI = 3;
      } else if (kdrimed > 0.57594408135238 && kdrimed <= 0.59019546284842) {
        KDPI = 4;
      } else if (kdrimed > 0.59019546284842 && kdrimed <= 0.60390915137906) {
        KDPI = 5;
      } else if (kdrimed > 0.60390915137906 && kdrimed <= 0.61387036565312) {
        KDPI = 6;
      } else if (kdrimed > 0.61387036565312 && kdrimed <= 0.62571423608426) {
        KDPI = 7;
      } else if (kdrimed > 0.62571423608426 && kdrimed <= 0.63467545579118) {
        KDPI = 8;
      } else if (kdrimed > 0.63467545579118 && kdrimed <= 0.64427378967024) {
        KDPI = 9;
      } else if (kdrimed > 0.64427378967024 && kdrimed <= 0.65244952181274) {
        KDPI = 10;
      }else if (kdrimed > 0.65244952181274 && kdrimed <= 0.66184657879897) {
        KDPI = 11;
      } else if (kdrimed > 0.66184657879897 && kdrimed <= 0.67125814175790) {
        KDPI = 12;
      } else if (kdrimed > 0.67125814175790 && kdrimed <= 0.68047193193158) {
        KDPI = 13;
      } else if (kdrimed > 0.68047193193158 && kdrimed <= 0.68830555161621) {
        KDPI = 14;
      } else if (kdrimed > 0.68830555161621 && kdrimed <= 0.69666020072924) {
        KDPI = 15;
      } else if (kdrimed > 0.69666020072924 && kdrimed <= 0.70388414439727) {
        KDPI = 16;
      } else if (kdrimed > 0.70388414439727 && kdrimed <= 0.71153298410291) {
        KDPI = 17;
      } else if (kdrimed > 0.71153298410291 && kdrimed <= 0.71899454804265) {
        KDPI = 18;
      } else if (kdrimed > 0.71899454804265 && kdrimed <= 0.72842289189164) {
        KDPI = 19;
      } else if (kdrimed > 0.72842289189164 && kdrimed <= 0.73652249238699) {
        KDPI = 20;
      } else if (kdrimed > 0.73652249238699 && kdrimed <= 0.74543636742703) {
        KDPI = 21;
      } else if (kdrimed > 0.74543636742703 && kdrimed <= 0.75351564051001) {
        KDPI = 22;
      } else if (kdrimed > 0.75351564051001 && kdrimed <= 0.76215264341252) {
        KDPI = 23;
      } else if (kdrimed > 0.76215264341252 && kdrimed <= 0.77078297978634) {
        KDPI = 24;
      } else if (kdrimed > 0.77078297978634 && kdrimed <= 0.77778005227287) {
        KDPI = 25;
      } else if (kdrimed > 0.77778005227287 && kdrimed <= 0.78611868125808) {
        KDPI = 26;
      } else if (kdrimed > 0.78611868125808 && kdrimed <= 0.79452033073732) {
        KDPI = 27;
      } else if (kdrimed > 0.79452033073732 && kdrimed <= 0.80227687182006) {
        KDPI = 28;
      } else if (kdrimed > 0.80227687182006 && kdrimed <= 0.81068840950830) {
        KDPI = 29;
      } else if (kdrimed > 0.81068840950830 && kdrimed <= 0.81940279406454) {
        KDPI = 30;
      } else if (kdrimed > 0.81940279406454 && kdrimed <= 0.82863334797177) {
        KDPI = 31;
    } else if (kdrimed > 0.82863334797177 && kdrimed <= 0.83699138271781) {
        KDPI = 32;
    } else if (kdrimed > 0.83699138271781 && kdrimed <= 0.84490126552511) {
        KDPI = 33;
    } else if (kdrimed > 0.84490126552511 && kdrimed <= 0.85263689336860) {
        KDPI = 34;
    } else if (kdrimed > 0.85263689336860 && kdrimed <= 0.86220561525508) {
        KDPI = 35;
    } else if (kdrimed > 0.86220561525508 && kdrimed <= 0.87170736326378) {
        KDPI = 36;
    } else if (kdrimed > 0.87170736326378 && kdrimed <= 0.88042590645531) {
        KDPI = 37;
    } else if (kdrimed > 0.88042590645531 && kdrimed <= 0.88934192133808) {
        KDPI = 38;
    } else if (kdrimed > 0.88934192133808 && kdrimed <= 0.89803565732055) {
        KDPI = 39;
    } else if (kdrimed > 0.89803565732055 && kdrimed <= 0.90760546566724) {
        KDPI = 40;
    } else if (kdrimed > 0.90760546566724 && kdrimed <= 0.91711399269845) {
        KDPI = 41;
    } else if (kdrimed > 0.91711399269845 && kdrimed <= 0.92665541420424) {
        KDPI = 42;
    } else if (kdrimed > 0.92665541420424 && kdrimed <= 0.93482914035115) {
        KDPI = 43;
    } else if (kdrimed > 0.93482914035115 && kdrimed <= 0.94504238184167) {
        KDPI = 44;
    } else if (kdrimed > 0.94504238184167 && kdrimed <= 0.95320582391708) {
        KDPI = 45;
    } else if (kdrimed > 0.95320582391708 && kdrimed <= 0.96243427199884) {
        KDPI = 46;
    } else if (kdrimed > 0.96243427199884 && kdrimed <= 0.97141500347254) {
        KDPI = 47;
    } else if (kdrimed > 0.97141500347254 && kdrimed <= 0.97960925718515) {
        KDPI = 48;
    } else if (kdrimed > 0.97960925718515 && kdrimed <= 0.99082682863388) {
        KDPI = 49;
    } else if (kdrimed > 0.99082682863388 && kdrimed <= 1.00000000000001) {
        KDPI = 50;
    } else if (kdrimed > 1.00000000000001 && kdrimed <= 1.01065485901958) {
        KDPI = 51;
    } else if (kdrimed > 1.01065485901958 && kdrimed <= 1.02157391917041) {
        KDPI = 52;
    } else if (kdrimed > 1.02157391917041 && kdrimed <= 1.03181408023206) {
        KDPI = 53;
    } else if (kdrimed > 1.03181408023206 && kdrimed <= 1.04290709369499) {
        KDPI = 54;
    } else if (kdrimed > 1.04290709369499 && kdrimed <= 1.05300343580120) {
        KDPI = 55;
    } else if (kdrimed > 1.05300343580120 && kdrimed <= 1.06334382623829) {
        KDPI = 56;
    } else if (kdrimed > 1.06334382623829 && kdrimed <= 1.07439584185308) {
        KDPI = 57;
    } else if (kdrimed > 1.07439584185308 && kdrimed <= 1.08577986242574) {
        KDPI = 58;
    } else if (kdrimed > 1.08577986242574 && kdrimed <= 1.09544918746511) {
        KDPI = 59;
    } else if (kdrimed > 1.09544918746511 && kdrimed <= 1.10705628384487) {
        KDPI = 60;
    } else if (kdrimed > 1.10705628384487 && kdrimed <= 1.11997738822194) {
        KDPI = 61;
    } else if (kdrimed > 1.11997738822194 && kdrimed <= 1.12942030426358) {
        KDPI = 62;
    } else if (kdrimed > 1.12942030426358 && kdrimed <= 1.14185541457440) {
        KDPI = 63;
    } else if (kdrimed > 1.14185541457440 && kdrimed <= 1.15234442314801) {
        KDPI = 64;
    } else if (kdrimed > 1.15234442314801 && kdrimed <= 1.16399551477489) {
        KDPI = 65;
    } else if (kdrimed > 1.16399551477489 && kdrimed <= 1.17656325837651) {
        KDPI = 66;
    } else if (kdrimed > 1.17656325837651 && kdrimed <= 1.19018468911221) {
        KDPI = 67;
    } else if (kdrimed > 1.19018468911221 && kdrimed <= 1.20213422269647) {
        KDPI = 68;
    } else if (kdrimed > 1.20213422269647 && kdrimed <= 1.21567283358572) {
        KDPI = 69;
    } else if (kdrimed > 1.21567283358572 && kdrimed <= 1.22791608907198) {
        KDPI = 70;
    } else if (kdrimed > 1.22791608907198 && kdrimed <= 1.24141082631924) {
        KDPI = 71;
    } else if (kdrimed > 1.24141082631924 && kdrimed <= 1.25377938288031) {
        KDPI = 72;
    } else if (kdrimed > 1.25377938288031 && kdrimed <= 1.26877072165772) {
        KDPI = 73;
    } else if (kdrimed > 1.26877072165772 && kdrimed <= 1.28193361666114) {
        KDPI = 74;
    } else if (kdrimed > 1.28193361666114 && kdrimed <= 1.29853083455681) {
        KDPI = 75;
    } else if (kdrimed > 1.29853083455681 && kdrimed <= 1.31014588815420) {
        KDPI = 76;
    } else if (kdrimed > 1.31014588815420 && kdrimed <= 1.32455174430608) {
        KDPI = 77;
    } else if (kdrimed > 1.32455174430608 && kdrimed <= 1.34049975511985) {
        KDPI = 78;
    } else if (kdrimed > 1.34049975511985 && kdrimed <= 1.35731773146750) {
        KDPI = 79;
    } else if (kdrimed > 1.35731773146750 && kdrimed <= 1.37463535009464) {
        KDPI = 80;
    } else if (kdrimed > 1.37463535009464 && kdrimed <= 1.39224716050131) {
        KDPI = 81;
    } else if (kdrimed > 1.39224716050131 && kdrimed <= 1.40773678250452) {
        KDPI = 82;
    } else if (kdrimed > 1.40773678250452 && kdrimed <= 1.42548384439408) {
        KDPI = 83;
    } else if (kdrimed > 1.42548384439408 && kdrimed <= 1.44443536742566) {
        KDPI = 84;
    } else if (kdrimed > 1.44443536742566 && kdrimed <= 1.46479968014262) {
        KDPI = 85;
    } else if (kdrimed > 1.46479968014262 && kdrimed <= 1.48742806263682) {
        KDPI = 86;
    } else if (kdrimed > 1.48742806263682 && kdrimed <= 1.50968118989544) {
        KDPI = 87;
    } else if (kdrimed > 1.50968118989544 && kdrimed <= 1.53317154635861) {
        KDPI = 88;
    } else if (kdrimed > 1.53317154635861 && kdrimed <= 1.56311479808836) {
        KDPI = 89;
    } else if (kdrimed > 1.56311479808836 && kdrimed <= 1.59606064434504) {
        KDPI = 90;
    }  else if (kdrimed > 1.59606064434504 && kdrimed <= 1.62623982811626) {
      KDPI = 91;
  } else if (kdrimed > 1.62623982811626 && kdrimed <= 1.66260973272395) {
      KDPI = 92;
  } else if (kdrimed > 1.66260973272395 && kdrimed <= 1.69451827350295) {
      KDPI = 93;
  } else if (kdrimed > 1.69451827350295 && kdrimed <= 1.73922305956362) {
      KDPI = 94;
  } else if (kdrimed > 1.73922305956362 && kdrimed <= 1.79071556331901) {
      KDPI = 95;
  } else if (kdrimed > 1.79071556331901 && kdrimed <= 1.85341242865515) {
      KDPI = 96;
  } else if (kdrimed > 1.85341242865515 && kdrimed <= 1.93023256569179) {
      KDPI = 97;
  } else if (kdrimed > 1.93023256569179 && kdrimed <= 2.03513854165712) {
      KDPI = 98;
  } else if (kdrimed > 2.03513854165712 && kdrimed <= 2.20440690637111) {
      KDPI = 99;
  } else if (kdrimed > 2.20440690637111 && kdrimed <= 999999999.00000000000000) {
      KDPI = 100;
  }
  else{
    KDPI=-1;
  }
  
    Donor.findByIdAndUpdate(req.params.donorid,{age:req.body.age,height:req.body.height,weight:req.body.weight,ethnicity:req.body.ethnicity,hypertension:req.body.hypertension,diabetes:req.body.diabetes,causeOfDeath:req.body.causeOfDeath,creatinine:req.body.creatinine,hcv:req.body.hcv,dcd:req.body.dcd,kdrimed:kdrimed,kdpi:KDPI},{new:true},function(err,don){
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

//------------------------------------------------------------------------------------------------------
module.exports = router;