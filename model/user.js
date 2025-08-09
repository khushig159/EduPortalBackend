const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed, ideally

    isVerified: {
        type: Boolean,
        default: false
    },
    resetToken: { type: String },
    resetTokenExpiration: { type: Date },

    refreshToken: { type: String },

}, { timestamps: true });

module.exports = mongoose.model('Student', UserSchema);
