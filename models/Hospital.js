const mongoose = require("mongoose");

const HospitalSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique : true
  },

  password: {
    type: String,
    required: true
  },

  address: {
    type: String,
    required: true,
  },

  phone:{
    type:Number,
    required: true,
  },

  hospitalregnum: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    required: true,
    default:"Hospital",
    enum:["Hospital"]
  }

//   verificationstatus:{
//     type:String,
//     default:"Pending",
//     enum:["Verified","Pending","Rejected"],
//     required:true
//   },

//   cancelReason:{
//     type: String
//   },

//   userid: {
//     type: Number,
//     required: true,
//   }

},
{ timestamps: true });
module.exports=mongoose.model("Hospital",HospitalSchema);
