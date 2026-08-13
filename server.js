require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./src/config/db');
const setupSwagger = require('./src/config/swagger');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Swagger Setup
setupSwagger(app);

// Routes
app.use('/auth', authRoutes);

// Base Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Expiry Date Express Server is up and running',
        timestamp: new Date().toISOString()
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
