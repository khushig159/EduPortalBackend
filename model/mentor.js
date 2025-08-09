const mongoose = require("mongoose");
const { Schema } = mongoose;
const jwt=require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid'); // <-- Add this at the top

const mentorSchema = new Schema({
  // Personal Info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed
  refreshTokenrecruiter: {
    type: String,
  },

  isVerified: {
    type: Boolean,
    default: false
  },
  Qualification:{
    type:String,
    required:true
  },
  Exp:{
    type:String,
    required:'True'
  },
  Organisation:{
    type:String,
    required:true
  },
  personality:{
    type:String,
    required:true
  },

resetToken: { type: String },
resetTokenExpiration: { type: Date },

}, { timestamps: true });

mentorSchema.methods.createAccessToken=async function(){
  return jwt.sign(
          {
                  email:this.email,
                  _id:this._id,

          },
          process.env.ACCESS_TOKEN,
          {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
  );
}

mentorSchema.methods.createRefreshToken=async function(){
  return jwt.sign(
          {
                  _id:this._id,
                  jti: uuidv4(), // 👈 unique token ID to ensure refreshToken is always different
          },
          process.env.REFRESH_TOKEN,
          {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
  );
}

module.exports = mongoose.model('Mentor', mentorSchema);