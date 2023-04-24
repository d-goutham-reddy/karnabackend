const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
// const DonorRoute=require("./routes/DonorRoute")
// const HospitalRoute=require("./routes/HospitalRoute")
// const AdminRoute=require("./routes/AdminRoute")
// const authRoute=require('./routes/authRoute')
const cors = require('cors');
const app=express();
app.use(express.json())
dotenv.config();

app.use(cors({ origin: 'http://localhost:3000',method: ['GET','POST','PUT','DELETE'] }));

mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true })
  .then(console.log("Connected to mongoDB"))
  .catch((err) => {
    console.log(err);
  });

//   app.use("/donor",DonorRoute)
//   app.use("/hospital",HospitalRoute)
//   app.use("/admin",AdminRoute)
//   app.use("/auth",authRoute)
  app.listen(process.env.PORT,(req,res)=>{console.log("app is working")})
