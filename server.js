const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('./config/passport'); 
const cors = require('cors');

const app = express();

// Update allowed origins with your production client URL
const allowedOrigins = [
  'http://localhost:5173', 
  'https://content-craft-ai-github.vercel.app', // Example production client URL
  'http://localhost:5174',
  'http://localhost:5175',
];

const corsOptions = {
  origin: (origin, callback) => {
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
  secret: process.env.SESSION_SECRET || 'your_secret_key', // Use environment variable for session secret
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Secure cookie in production (HTTPS)
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Required for cross-site requests
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

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/auth', require('./routes/authSocial'));
app.use('/api/createContent', require('./routes/createContent'));
app.use('/api/consult', require('./routes/consult'));

// Render Home Page
app.get('/', (req, res) => {
  res.json('working');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
