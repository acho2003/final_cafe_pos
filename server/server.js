require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Check for essential environment variables
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    console.error("FATAL ERROR: MONGO_URI and JWT_SECRET must be defined in the .env file.");
    process.exit(1);
}

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/cafes', require('./routes/cafeRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/menu-items', require('./routes/menuItemRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
