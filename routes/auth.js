// Required modules
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import your User model
const { sendOTP, verifyOTP } = require('../utils/nodemailer'); // Import nodemailer utility
const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({ msg: 'User already exists' });
      } else {
        await User.findByIdAndDelete(user._id);
        console.log('Unverified user deleted:', email);
      }
    }

    user = new User({ name, email, password, isVerified: false });
    await user.save();

    // Schedule deletion of unverified user after 24 hours
    setTimeout(async () => {
      const foundUser = await User.findOne({ email });
      if (foundUser && !foundUser.isVerified) {
        await User.findByIdAndDelete(foundUser._id);
        console.log('Unverified user deleted:', email);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

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

// Verify OTP for email verification
router.post('/verify', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if OTP matches
    const isVerified = await verifyOTP(email, otp);

    if (!isVerified) {
      // Increment failed attempts and check if user should be deleted
      user.failedAttempts = (user.failedAttempts || 0) + 1;
      await user.save();

      if (user.failedAttempts >= 5) {
        await User.findByIdAndDelete(user._id);
        console.log('User deleted due to 5 failed OTP attempts:', email);
        return res.status(400).json({ msg: 'Too many invalid OTP attempts. Account deleted. Please register again.' });
      }

      return res.status(400).json({ msg: 'Invalid OTP' });
    }

    // Reset failed attempts if OTP is verified
    delete user.failedAttempts;
    user.isVerified = true;
    await user.save();

    console.log('Email verified successfully:', email);
    res.status(200).json({ msg: 'Email verified successfully', email });
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


// Route to send OTP after verifying token
router.post('/sendOtp', async (req, res) => {
  const token  = req.cookies?.token;
  console.log(token) 
  

  try {
    // Verify token and find user's email
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    // Send OTP to the user's email
    const otp = await sendOTP(user.email);
    console.log('OTP sent successfully:', otp);

    res.status(200).json({ msg: 'OTP sent successfully', email: user.email });
  } catch (err) {
    console.error('Send OTP Error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Route to reset password with token, OTP, current password, and new password
router.post('/reset-password', async (req, res) => {
  const { otp, currentPassword, newPassword } = req.body;
  const  token  = req.cookies?.token;
   if  (!token) {
      return res.json({msg : ' signin first'} )
   } 
  try {
    // Verify token and find user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.id);
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

 

    // Check current password for signed-in users
    if (currentPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Current password is incorrect' });
      }
    }
       // Verify OTP
       const isVerified = await verifyOTP(user.email, otp);
       if (!isVerified) {
         return res.status(400).json({ msg: 'Invalid OTP' });
       }

    // Update password with new hashed password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ msg: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset Password Error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});



router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ msg: 'Please verify your email before signing in' });
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
          secure: process.env.NODE_ENV === 'production', // Ensure secure attribute is set in production
          sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax' // Adjust as needed
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
