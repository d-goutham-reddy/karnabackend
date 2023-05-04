const mongoose = require("mongoose");
const Schema=require('mongoose').Schema
const BloodDonation = require("./BloodDonation");
const BloodRequest = require("./BloodRequest");

const BloodPacketSchema = mongoose.Schema({

    separationType:{
        type:String,
        enum:["whole","rbc","platelet","plasma"],
        required:true
    },

    expiryDate:{
        type:Date,
        required:true
    },

    availablestatus:{
        type:Boolean,
        required:true,
        default:true
    },

    bloodDonationDetails:{ type: Schema.Types.ObjectId, ref: BloodDonation },

    bloodRequestDetails:{ type: Schema.Types.ObjectId, ref: BloodRequest}

},
{ timestamps: true });
module.exports=mongoose.model("BloodPacket",BloodPacketSchema);