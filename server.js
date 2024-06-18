const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const passportconfig = require('./config/passport.js'); 
const passport = require('passport'); 

const session = require('express-session');

dotenv.config();

const app = express();

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize session and passport middleware
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Set EJS as the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// API Routes
app.use('/api/auth', require('./routes/auth'));


app.use('/auth', require('./routes/authSocial'));

// Render Home Page
app.get('/', (req, res) => {
  res.render('home');
});

// Render Register Page
app.get('/register', (req, res) => {
  res.render('register');
});

// Render OTP Verification Page
app.get('/verify', (req, res) => {
  const { email } = req.query;
  res.render('verify', { email });
});

// Render Sign-in Page
app.get('/signin', (req, res) => {
  res.render('signin');
});
app.get('/request-password-reset', (req,res)=>{
  res.render('request-password-reset');
})
app.get('/reset-password', (req,res)=>{
  const {email} = req.query;
  res.render('reset-password', {email});
})

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
