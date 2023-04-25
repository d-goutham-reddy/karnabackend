const router = require("express").Router();
const Hospital = require("../models/Hospital");
const bcrypt = require("bcrypt");

//-------------------------------------------------------------------------------------------------------
//                                               Creation of Hospital

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