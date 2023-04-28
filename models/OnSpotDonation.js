const mongoose = require("mongoose");
const Schema=require('mongoose').Schema
const BloodBank = require("./BloodBank");

const OnspotDonationSchema = mongoose.Schema({
    bloodgroup: {
        type: String,
        enum:["A+","A-","B+","B-","O+","O-","AB+","AB-"],
        required: true
    },

    location: {
        type: String,
        required: true
    },

    appdate:{
        type:Date,
        required:true
    },

    time: {
        type: String,
        required: true
    },

    status:{
        type:String,
        default:"Upcoming",
        enum:["Upcoming","Completed","Cancelled"],
        required: true
    },

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

    cancelReason:{
        type:String
    },

    report:{
        type:String
    },

    feedback:{
        type:String
    },

    bloodbankDetails: { type: Schema.Types.ObjectId, ref: BloodBank }
},
{ timestamps: true });
module.exports=mongoose.model("OnspotDonation",OnspotDonationSchema);