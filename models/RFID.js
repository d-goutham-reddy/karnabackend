const mongoose =require('mongoose')

const RFIDSchema =mongoose.Schema({
  RFID: {
    type: String,
    required: true,
    unique : true
  }

},
{ timestamps: true });
module.exports=mongoose.model("RFID",RFIDSchema)