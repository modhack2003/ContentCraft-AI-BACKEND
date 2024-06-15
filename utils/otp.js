const twilio = require('twilio');
const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendOTP = async (phoneNumber) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    await client.messages.create({
      body: `Your OTP code is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    return otp;
  } catch (err) {
    console.error('Error sending OTP:', err.message);
    throw new Error('Error sending OTP');
  }
};
const verifyOTP = async (phoneNumber, otp) => {
  
  return true;
};

module.exports = { sendOTP, verifyOTP };