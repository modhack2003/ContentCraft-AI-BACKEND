const twilio = require('twilio');
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const Otp = require('../models/Otp');
const generateOTP = () => Math.floor(100000 + Math.random() * 900000);
const sendOTP = async (phoneNumber) => {
  const otp = generateOTP();  // Generate OTP
  const otpData = new Otp({ phoneNumber, otp });

  try {
    await otpData.save();  // Save OTP to database
    await client.messages.create({
      body: `Your OTP code is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    return otp;
  } catch (err) {
    throw new Error(`Error sending OTP: ${err.message}`);
  }
};

const verifyOTP = async (phoneNumber, otp) => {
  try {
    const otpData = await Otp.findOne({ phoneNumber, otp });
    if (!otpData) {
      return false;  // OTP not found or expired
    }
    await Otp.deleteOne({ _id: otpData._id });  // Delete OTP after verification
    return true;
  } catch (err) {
    throw new Error(`Error verifying OTP: ${err.message}`);
  }
};

module.exports = { sendOTP, verifyOTP };
