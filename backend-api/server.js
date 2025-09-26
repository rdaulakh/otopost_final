const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');

const port = process.env.PORT || 5000;

connectDB();

const app = express();

// CORS Configuration
const allowedOrigins = [
  process.env.CUSTOMER_CLIENT_URL,
  process.env.ADMIN_CLIENT_URL
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/business', require('./routes/businessRoutes'));
app.use('/api/plans', require('./routes/planRoutes'));
app.use('/api/content', require('./routes/contentRoutes')); // New
app.use('/api/posts', require('./routes/postRoutes'));     // New

app.use(errorHandler);

app.listen(port, () => console.log(`[SERVER] Server is running on port ${port}`));

