const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport'); 
const authorize = require('./middleware/authorize');
const cors = require('cors')

const app = express();
const allowedOrigins = ['http://localhost:5173', 'https://content-craft-ai-github.vercel.app/', "http://localhost:5174" ,"http://localhost:5175",];

const corsOptions = {
  origin: (origin, callback) => {
    // Check if the origin is in the allowed origins list or if it's undefined (for non-browser requests)
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOptions));
// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize cookie-parser middleware
app.use(cookieParser());

// Initialize session middleware
app.use(session({
  secret: 'your_secret_key', // Change to a secure secret for session management
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Secure cookie in production (HTTPS)
    sameSite: 'None', // Required for cross-site requests
  }
}));
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// Set EJS as the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/auth', require('./routes/authSocial'));
app.use('/api', require('./routes/chat')); 

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

// Render Password Reset Pages
app.get('/request-password-reset', (req, res) => {
  res.render('request-password-reset');
});

app.get('/reset-password', (req, res) => {
  const { email } = req.query;
  res.render('reset-password', { email });
});

// Protected Routes (example)
app.get('/admin', authorize('admin'), (req, res) => {
  res.send('Admin content');
});

app.get("/chat", authorize(['user', 'admin']), (req, res) => {
  res.render("chat");
});

app.get('/user', authorize(['user', 'admin']), (req, res) => {
  res.send('User content');
});

app.get('/guest', authorize(['guest', 'user', 'admin']), (req, res) => {
  res.send('Guest content');
});

app.get("/*", (req, res) => {
  res.redirect("/");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
