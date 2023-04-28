const router = require("express").Router();
const Hospital = require("../models/Hospital");
const bcrypt = require("bcrypt");
const BloodRequest = require("../models/BloodRequest");

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