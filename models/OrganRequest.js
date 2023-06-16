const mongoose = require("mongoose");
const Schema=require('mongoose').Schema;
const Hospital = require("./Hospital");
const Donor = require("./Donor");

const OrganRequestSchema = mongoose.Schema({

    status:{
        type:String,
        required:true,
        default:"Unbooked",
        enum:["Unbooked","Booked","Arrived"]
    },

    name:{
        type:String,
        required:true
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
    
    bloodgroup: {
        type: String,
        enum:["A+","A-","B+","B-","O+","O-","AB+","AB-"],
        required: true
    },

    diabetes:{
        type:Boolean,
        required:true
    },

    priororgantransplant:{
        type:Boolean,
        required:true
    },

    dialysisDate:{
        type:Date,
        required:true
    },

    kidneydisease:{
        type:String,
        required:true,
        enum:["Chronic Kidney Disease","Diabetic Nephropathy","Glomerulonephritis","Polycrytic Kidney Disease"]
    },

    hlatype:{
        type:String,
        required:true,
        enum:["HLA-A","HLA-B","HLA-C","HLA-DRB1","HLA-DQB1","HLA-DPB1"]
    },

    hlatypingmethod:{
        type:String,
        required:true,
        enum:["Polymerase Chain Reaction","Sequence Specific Oligonucleotide","Sequence Based Typing","Serological"]
    },

    pralevel:{
        type:Number,
        required:true
    },

    hlaantigen:{
        type:String,
        required:true,
        enum:["HLA-A","HLA-B","HLA-C","HLA-DRB1","HLA-DQB1","HLA-DPB1"]
    },

    pramethod:{
        type:String,
        required:true,
        enum:["Single Antigen Bead","Complement Dependent Cytotoxicity","Flow Cytometry"]
    },

    sensitizationreason:{
        type:String,
        required:true,
        enum:["Previous Transplantation","Blood Transfusion","Pregnancy","NA"]
    },

    height:{
        type:Number,
        required:true
    },

    weight:{
        type:Number,
        required:true
    },
    
    surgicalevaluationremarks:{
        type:String,
        required:true
    },

    otherdetails:{
        type:String,
        required:true
    },

    rawepts:{
        type:Number,
        required:true
    },

    epts:{
        type:Number,
        required:true
    },

    lat: {
        type: String
    },
    
    long: {
        type: String
    },
    
    position: {
        type: String
    },
    
    speed: {
        type: String
    },

    donorDetails:{ type: Schema.Types.ObjectId, ref: Donor },

    fromHospital:{ type: Schema.Types.ObjectId, ref: Hospital },

    toHospital:{ type: Schema.Types.ObjectId, ref: Hospital },
    
},
{ timestamps: true });
module.exports=mongoose.model("OrganRequest",OrganRequestSchema);