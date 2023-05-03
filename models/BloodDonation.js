const mongoose = require("mongoose");
const Schema=require('mongoose').Schema
const Donor = require("./Donor");
const BloodBank = require("./BloodBank");

const BloodDonationSchema = mongoose.Schema({
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
    
    arriveStatus:{
        type:Boolean,
        default:false,
        required:true
    },

    plateletCount:{
        type:String
    },

    haemoglobinLevel:{
        type:String
    },

    rbcCount:{
        type:String
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

    donorDetails: { type: Schema.Types.ObjectId, ref: Donor },

    bloodbankDetails: { type: Schema.Types.ObjectId, ref: BloodBank }
},
{ timestamps: true });
module.exports=mongoose.model("BloodDonation",BloodDonationSchema);