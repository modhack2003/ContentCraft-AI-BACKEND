const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTP, verifyOTP } = require('../utils/otp');
const router = express.Router();

router.post('/register', async (req, res) => {
  const { phoneNumber, password, confirmPassword } = req.body;
  console.log(req.body)

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: 'Passwords do not match' });
  }

  try {
    let user = await User.findOne({ phoneNumber });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      phoneNumber,
      password
    });

    await user.save();

    const otp = await sendOTP(phoneNumber);

    res.status(201).json({ msg: 'User registered. Verify OTP to complete registration.', otp });
  } catch (err) {
    console.error('Register Error:', err.message);
    res.status(500).send('Server error');
  }
});

router.post('/verify', async (req, res) => {
  const { phoneNumber, otp } = req.body;
  console.log(req.body)
  try {
    const isVerified = await verifyOTP(phoneNumber, otp);
    if (!isVerified) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    await User.findOneAndUpdate({ phoneNumber }, { isVerified: true });

    res.status(200).json({ msg: 'Phone number verified' });
  } catch (err) {
    console.error('Verify Error:', err.message);
    res.status(500).send('Server error');
  }
});

router.post('/signin', async (req, res) => {
  const { phoneNumber, password } = req.body;
  console.log(req.body)

  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ msg: 'Phone number not verified' });
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
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error('Signin Error:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;