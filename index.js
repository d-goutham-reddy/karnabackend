const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const HomeRoutes=require("./routes/HomeRoutes");
const AdminRoutes=require("./routes/AdminRoutes")
const DonorRoutes=require("./routes/DonorRoutes")
const HospitalRoutes=require("./routes/HospitalRoutes")
const BloodBankRoutes=require("./routes/BloodBankRoutes")
// const authRoute=require('./routes/authRoute')
const cors = require('cors');
const app=express();
app.use(express.json())
dotenv.config();

app.use(cors({ origin: 'http://localhost:5000',method: ['GET','POST','PUT','DELETE'] }));

mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true })
  .then(console.log("Connected to mongoDB"))
  .catch((err) => {
    console.log(err);
  });

  app.use("/home",HomeRoutes)
  app.use("/admin",AdminRoutes)
  app.use("/donor",DonorRoutes)
  app.use("/hospital",HospitalRoutes)
  app.use("/bloodbank",BloodBankRoutes)
//   app.use("/auth",authRoute)
  app.listen(process.env.PORT,(req,res)=>{console.log("app is working")})