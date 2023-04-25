const mongoose =require('mongoose')
// const Schema=require('mongoose').Schema
// const Hospital = require("./Hospital");

const DonorSchema =mongoose.Schema({
  fname: {
    type: String,
    required: true
  },

  mname: {
    type: String,
    required: true
  },

  lname: {
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
    required: true
  },

  phone: {
    type: Number,
    required: true
  },

  sex:{
    type:String,
    enum:["Male","Female","Others"],
    required: true
  },

  DOB: {
    type: Date,
    required: true
  },

  age: {
    type: Number,
    required: true
  },

  bloodgroup: {
    type: String,
    enum:["A+","A-","B+","B-","O+","O-","AB+","AB-"],
    required: true
  },

  aadharId: {
    type: Number,
    required: true
  },

  emergencycontactname: {
    type: String,
    required: true
  },

  emergencycontactphone: {
    type: Number,
    required: true
  },

  role: {
    type: String,
    required: true,
    default:"Donor",
    enum:["Donor"]
  },

//   userid: {
//     type: Number,
//     required: true
//   },

//   relationship:{
//     type:String
//   },

//   familyPermission:{
//     type:Boolean
//   },

//   causeOfDeath:{
//     type:"String"
//   },

//   deathDate:{
//     type:Date
//   },

//   ddoperationDate:{
//     type:Date
//   },

//   medicaldetails:{
//     type:String
//   },
  
//   transplantHospitalDetails: { type: Schema.Types.ObjectId, ref: Hospital }
},
{ timestamps: true });

module.exports=mongoose.model("Donor",DonorSchema)