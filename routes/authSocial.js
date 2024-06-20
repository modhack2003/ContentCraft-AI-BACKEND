const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper function to handle redirection based on user role
const handleRedirection = (userRole, res) => {
  if (userRole === 'admin') {
    res.redirect('/admin');
  } else if (userRole === 'user') {
    res.redirect('/user');
  } else {
    res.redirect('/guest');
  }
};

// Facebook authentication routes
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/signin' }),
  (req, res) => {
    console.log("Facebook authentication successful:", req.user);

    const payload = {
      user: {
        id: req.user.id,
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
        console.log("JWT created successfully");
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        handleRedirection(req.user.role, res);
      }
    );
  });

// Google authentication routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/signin' }),
  (req, res) => {
    console.log("Google authentication successful:", req.user);

    const payload = {
      user: {
        id: req.user.id,
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
        console.log("JWT created successfully");
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        handleRedirection(req.user.role, res);
      }
    );
  });

// Apple authentication routes 
router.get('/apple', passport.authenticate('apple'));

router.post('/apple/callback',
  passport.authenticate('apple', { failureRedirect: '/signin' }),
  (req, res) => {
    console.log("Apple authentication successful:", req.user);

    const payload = {
      user: {
        id: req.user.id,
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
        console.log("JWT created successfully");
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        handleRedirection(req.user.role, res);
      }
    );
  });

module.exports = router;
