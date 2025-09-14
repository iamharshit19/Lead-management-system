const express= require("express");
const mongoose= require("mongoose");
const cookieParser= require("cookie-parser");
const cors= require("cors");
const authRoutes= require("./routes/auth");
const leadRoutes= require("./routes/leads");
const app= express();
require("dotenv").config();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin:process.env.FRONTEND_ORIGIN,
    credentials: true
}));

app.use("/api/auth", authRoutes);
app.use("/api/leads",leadRoutes);

mongoose.connect(process.env.MONGO_URI)
   .then(()=>{
    console.log("MongoDB connected");
    app.listen(5000,()=>console.log("Server running on port 5000"));
      })
      .catch(err=>console.error(err));