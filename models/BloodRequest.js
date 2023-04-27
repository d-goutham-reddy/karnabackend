const mongoose = require("mongoose");
const Schema=require('mongoose').Schema
const Hospital = require("./Hospital");
const BloodPacket = require("./BloodPacket");

const BloodRequestSchema = mongoose.Schema({
    bloodgroup: {
        type: String,
        enum:["A+","A-","B+","B-","O+","O-","AB+","AB-"],
        required: true
    },

    status:{
        type:String,
        default:"Waiting",
        enum:["Waiting","Confirmed","Delivered","Cancelled"],
        required: true
    },

    component:{
        type:String,
        required:true
    },

    purpose:{
        type:String,
        required:true
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
        required: true,
        unique : true
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

    hospitalDetails: { type: Schema.Types.ObjectId, ref: Hospital },

    bloodPacketDetails: { type: Schema.Types.ObjectId, ref: BloodPacket }

},
{ timestamps: true });
module.exports=mongoose.model("BloodRequest",BloodRequestSchema);