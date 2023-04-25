const mongoose =require('mongoose')

const AdminSchema =mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique : true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    required: true,
    default:"Admin",
    enum:["Admin"]
  }

},
{ timestamps: true });
module.exports=mongoose.model("Admin",AdminSchema)