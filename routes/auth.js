const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTP, verifyOTP } = require('../utils/nodemailer');
const router = express.Router();

// Registration route
router.post('/register', async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  console.log(req.body); // Log request body to check incoming data

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: 'Passwords do not match' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      email,
      password // Ensure password is hashed before saving in actual application
    });

    await user.save();

    try {
      const otp = await sendOTP(email);
      console.log('OTP sent successfully:', otp); // Log successful OTP sending
      res.status(201).redirect(`/verify?email=${email}`); // Redirect to OTP verification page
    } catch (otpError) {
      console.error('Error sending OTP:', otpError.message);
      await User.findByIdAndDelete(user._id); // Rollback user creation if OTP fails
      return res.status(500).json({ msg: 'Error sending OTP, please try again.' });
    }
  } catch (err) {
    console.error('Register Error:', err.message);
    res.status(500).send('Server error');
  }
});

// OTP verification route
router.post('/verify', async (req, res) => {
  const { email, otp } = req.body;
  console.log(req.body); // Log request body to check incoming data

  try {
    const isVerified = await verifyOTP(email, otp);
    if (!isVerified) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    await User.findOneAndUpdate({ email }, { isVerified: true });
    console.log('Email verified successfully:', email); // Log successful email verification
    res.status(200).redirect('/signin'); // Redirect to sign-in page
  } catch (err) {
    console.error('Verify Error:', err.message);
    res.status(500).send('Server error');
  }
});

// Sign-in route
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body); // Log request body to check incoming data

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ msg: 'Email not verified' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
      if (err) {
        console.error('JWT Sign Error:', err.message);
        return res.status(500).json({ msg: 'Server error' });
      }
      res.json({ token });
    });
  } catch (err) {
    console.error('Signin Error:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
