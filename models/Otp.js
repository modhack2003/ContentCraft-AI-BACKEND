const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300  // OTP expires after 5 minutes (adjust as needed)
  }
});

module.exports = mongoose.model('Otp', OtpSchema);
