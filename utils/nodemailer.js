const nodemailer = require('nodemailer');
const Otp = require('../models/Otp');  // Make sure you have this model

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

const sendOTP = async (email) => {
  const otp = generateOTP();
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`
  };

  await transporter.sendMail(mailOptions);
  
  // Store OTP in database
  const otpData = new Otp({ email, otp });
  await otpData.save();

  return otp;
};

const verifyOTP = async (email, otp) => {
  const otpData = await Otp.findOne({ email, otp });
  if (otpData) {
    await Otp.deleteOne({ _id: otpData._id });  // Delete OTP after verification
    return true;
  }
  return false;
};

module.exports = { sendOTP, verifyOTP };