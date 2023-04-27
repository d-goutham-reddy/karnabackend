const mongoose = require("mongoose");
const Schema=require('mongoose').Schema
const BloodDonation = require("./BloodDonation");

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

    BloodDonation:{ type: Schema.Types.ObjectId, ref: BloodDonation }

},
{ timestamps: true });
module.exports=mongoose.model("BloodPacket",BloodPacketSchema);