const mongoose= require("mongoose")
const leadSchema= new mongoose.Schema({
    first_name: String,
    last_name: String,
    email: { type: String, unique: true },
    phone: String,
    company: String,
    city: String,
    state: String,
    source:{type: String, enum: ["webiste", "facebook_ads","google_ads","referral","events","others"]},
    status: { type: String, enum: ["new","contacted","qualified","lost","won"], default: "new" },
  score: { type: Number, min: 0, max: 100, default: 0 },
  lead_value: { type: Number, default: 0 },
  last_activity_at: Date,
  is_qualified: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  
},{timestamps:{createdAt: "created_at", updatedAt: "updated_at"}});
module.exports=mongoose.model("Lead", leadSchema);
