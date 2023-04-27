const mongoose = require("mongoose");
// const Schema=require('mongoose').Schema
// const Hospital = require("./Hospital");

const OrganDonationSchema = mongoose.Schema({
    // bloodgroup: {
    //     type: String,
    //     enum:["A+","A-","B+","B-","O+","O-","AB+","AB-"],
    //     required: true
    // },

    // location: {
    //     type: String,
    //     required: true
    // },

    // time: {
    //     type: String,
    //     required: true
    // }

//   transplantHospitalDetails: { type: Schema.Types.ObjectId, ref: Hospital }
},
{ timestamps: true });
module.exports=mongoose.model("OrganDonation",OrganDonationSchema);