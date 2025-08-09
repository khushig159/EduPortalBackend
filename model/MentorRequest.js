const mongoose = require('mongoose');
const { Schema } = mongoose;

const mentorRequestSchema = new Schema({
  menteeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  mentorId: { type: Schema.Types.ObjectId, ref: 'Mentor', required: true },
  status: { type: String, enum: ['pending','accepted','rejected','cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('MentorRequest', mentorRequestSchema);
