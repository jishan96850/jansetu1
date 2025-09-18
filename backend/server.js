const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db.js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('MONGO_URI:', process.env.MONGO_URI); // Debug line

const app = express();
connectDB();

// CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4173',
      process.env.FRONTEND_URL
    ].filter(Boolean); // Remove undefined values
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', require('./src/routes/auth.js'))
app.use('/api/reports', require('./src/routes/reports'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/stats', require('./src/routes/stats'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/geocode', require('./src/routes/geocode')); // proxy to avoid CORS

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});