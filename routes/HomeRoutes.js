const router = require("express").Router();
const BloodBank = require("../models/BloodBank");
const bcrypt = require("bcrypt");

//-------------------------------------------------------------------------------------------------------
//                                               Home Page Routes

router.post("/create", async (req, res) => {
  try {
    
  } 
  catch (err) {
    res.status(500).json(err);
  }
});

//-------------------------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------------------------
module.exports = router;