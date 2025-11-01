const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/authDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

// ==================== Routes ====================

// REGISTER User
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if email exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const newUser = new User({ username, email, password: hashedPassword });
        const savedUser = await newUser.save();

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: savedUser._id, username: savedUser.username, email: savedUser.email }
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// LOGIN User
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.status(200).json({
            message: 'Login successful',
            user: { id: user._id, username: user.username, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// =================================================

// Invalid Route
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});