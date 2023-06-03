const mongoose =require('mongoose')

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

  lastdonationdate:{
    type:Date
  },

  permanentbanreason:{
    type:String,
    default:"false",
    required:true
  },

  eligibledate:{
    type:Date,
    default:new Date(),
    required:true
  },

  livessavedmeter:{
    type:Number,
    default:0,
    required:true
  },

  points:{
    type:Number,
    default:0,
    required:true
  },

  badge:{
    type:String,
    default:"Rookie",
    enum:["Rookie","Enthusiast","Elite","Pro","Guru","Specialist","Champion"],
    required:true
  },

  volunteer:{
    type:Boolean,
    default:false,
    required:true
  },

  feedback:{
    type:String
  },

  dead:{
    type:Boolean,
    default:false,
    required:true
  },

  organRequest:{
    type:Boolean,
    default:false,
    required:true
  },

  familyPermission:{
    type:Boolean,
    default:false,
    required:true
  },

  height:{
    type:Number
  },

  weight:{
    type:Number
  },

  ethnicity:{
    type:String,
    enum:["American Indian","Asian","Black","Hispanic","Pacific Islander","White","Multi Racial"]
  },

  hypertension:{
    type:Boolean
  },

  diabetes:{
    type:Boolean
  },

  causeOfDeath:{
    type:String,
    enum:["Anoxia","Cerebrovascular Accident","Head Trauma","CNS Tumor","Other"]
  },

  creatinine:{
    type:Number
  },

  hcv:{
    type:Boolean
  },

  dcd:{
    type:Boolean
  },

  kdrimed:{
    type:Number
  },

  kdpi:{
    type:Number
  }

},
{ timestamps: true });

module.exports=mongoose.model("Donor",DonorSchema)