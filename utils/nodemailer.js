const nodemailer = require('nodemailer');
const Otp = require('../models/Otp');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Error verifying transporter:', error);
  } else {
    console.log('Transporter is ready to send emails');
  }
});

transporter.on('error', err => {
  console.error('Nodemailer error:', err.message);
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

  try {
    await transporter.sendMail(mailOptions);
    console.log('OTP sent successfully to:', email);

    // Remove any existing OTP for the email
    await Otp.findOneAndDelete({ email });

    // Save the new OTP
    const otpData = new Otp({ email, otp });
    await otpData.save();

    return otp;
  } catch (err) {
    console.error('Error sending OTP email:', err.message);
    throw err;
  }
};

const verifyOTP = async (email, otp) => {
  const otpData = await Otp.findOne({ email, otp });
  if (otpData) {
    await Otp.deleteOne({ _id: otpData._id });
    return true;
  }
  return false;
};

module.exports = { sendOTP, verifyOTP };
