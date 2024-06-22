const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTP, verifyOTP } = require('../utils/nodemailer');
const router = express.Router();


// Register route
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({ name, email, password });
    await user.save();

    try {
      const otp = await sendOTP(email);
      console.log('OTP sent successfully:', otp);
      res.status(201).json({ msg: 'User registered successfully. OTP sent.', email });
    } catch (otpError) {
      console.error('Error sending OTP:', otpError.message);
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({ msg: 'Error sending OTP, please try again.' });
    }
  } catch (err) {
    console.error('Register Error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});



// OTP verification route
router.post('/verify', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const isVerified = await verifyOTP(email, otp);
    if (!isVerified) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true } // Return the updated document
    );

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    let msg = 'Email verified successfully';
   

    console.log('Email verified successfully:', email);
    res.status(200).json({ msg, email });
  } catch (err) {
    console.error('Verify Error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/update-user-details', async (req, res) => {
  const { email, role, description, organisation } = req.body;
  console.log('Request body:', req.body);

  try {
    let updatedFields = {};
    let updateRequired = false; 

    if (role !== "") {
      updatedFields.role = role;
      updateRequired = true;
    } 

    if (description !== "") {
      updatedFields.description = description;
      updateRequired = true;
    } 

    if (organisation !== "") {
      updatedFields.organisation = organisation;
      updateRequired = true;
    } 

    console.log('Updated fields:', updatedFields);

    if (!updateRequired) {
      return res.status(200).json({ msg: 'Not set, please do in settings' });
    }

    const user = await User.findOneAndUpdate(
      { email },
      updatedFields,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    console.log('User details updated successfully for:', email);
    res.status(200).json({ msg: 'User details updated successfully', user });
  } catch (err) {
    console.error('Update User Details Error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});




// Password reset request route
router.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'User does not exist' });
    }

    try {
      const otp = await sendOTP(email);
      console.log('OTP sent successfully:', otp);
      res.status(200).json({ msg: 'OTP sent. Check your email.', email });
    } catch (otpError) {
      console.error('Error sending OTP:', otpError.message);
      return res.status(500).json({ msg: 'Error sending OTP, please try again.' });
    }
  } catch (err) {
    console.error('Request Password Reset Error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Password reset verification route
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword, confirmNewPassword } = req.body;
  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ msg: 'Passwords do not match' });
  }

  try {
    const isVerified = await verifyOTP(email, otp);
    if (!isVerified) {
      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    console.log('Password reset successfully for:', email);
    res.status(200).json({ msg: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset Password Error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});
// Sign-in route
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        description: user.description,
        organisation: user.organisation
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) {
          console.error('JWT Sign Error:', err.message);
          return res.status(500).json({ msg: 'Server error' });
        }

        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'None'
        });

        res.status(200).json({
          token,
          user: payload.user
        });
      }
    );
  } catch (err) {
    console.error('Sign-in Error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});





module.exports = router;
