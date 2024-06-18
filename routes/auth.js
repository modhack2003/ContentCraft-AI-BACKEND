const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOTP, verifyOTP } = require("../utils/nodemailer");
const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  console.log(req.body);

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Passwords do not match" });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({
      email,
      password,
    });

    await user.save();

    try {
      const otp = await sendOTP(email);
      console.log("OTP sent successfully:", otp);
      res.status(201).redirect(`/verify?email=${email}`);
    } catch (otpError) {
      console.error("Error sending OTP:", otpError.message);
      await User.findByIdAndDelete(user._id);
      return res
        .status(500)
        .json({ msg: "Error sending OTP, please try again." });
    }
  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).send("Server error");
  }
});

router.post("/verify", async (req, res) => {
  const { email, otp } = req.body;
  console.log(req.body);

  try {
    const isVerified = await verifyOTP(email, otp);
    if (!isVerified) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    await User.findOneAndUpdate({ email }, { isVerified: true });
    console.log("Email verified successfully:", email);
    res.status(200).redirect("/signin");
  } catch (err) {
    console.error("Verify Error:", err.message);
    res.status(500).send("Server error");
  }
});
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ msg: "Email not verified" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

   
   
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) {
          console.error("JWT Sign Error:", err.message);
          return res.status(500).json({ msg: "Server error" });
        }
        res.json({ token });
      }
    );
  } catch (err) {
    console.error("Signin Error:", err.message);
    res.status(500).send("Server error");
  }
});
router.post("/request-password-reset", async (req, res) => {
  const { email } = req.body;
  console.log(req.body);

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    try {
      const otp = await sendOTP(email);
      console.log("OTP sent successfully:", otp);
      res.redirect(`/reset-password?email=${email}`);
    } catch (otpError) {
      console.error("Error sending OTP:", otpError.message);
      return res.status(500).json({ msg: "Error sending OTP, please try again." });
    }
  } catch (err) {
    console.error("Request Password Reset Error:", err.message);
    res.status(500).send("Server error");
  }
});


router.post("/reset-password", async (req, res) => {
  const { email, otp, newPassword, confirmNewPassword } = req.body;
  console.log(req.body);

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ msg: "Passwords do not match" });
  }

  try {
    const isVerified = await verifyOTP(email, otp);
    if (!isVerified) {
      return res.status(400).json({ msg: "Invalid OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findOneAndUpdate({ email }, { password: hashedPassword });
    console.log("Password reset successfully for:", email);
    res.redirect(`/signin`);
  } catch (err) {
    console.error("Reset Password Error:", err.message);
    res.status(500).send("Server error");
  }
});


module.exports = router;
