const mongoose =require('mongoose')

const GeolocatorSchema =mongoose.Schema({
  lat: {
    type: String,
    required: true,
    unique : true
  },

  long: {
    type: String,
    required: true,
    unique : true
  },

  speed: {
    type: String,
    required: true,
    unique : true
  }

},
{ timestamps: true });
module.exports=mongoose.model("Geolocator",GeolocatorSchema)