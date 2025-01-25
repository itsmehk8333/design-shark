const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

// Validation middleware
const validateRegistration = (req, res, next) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    next();
};

// Register endpoint
router.post('/register', validateRegistration, async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        user = new User({
            username,
            email: email.toLowerCase(), // convert email to lowercase
            password,
            role: 'user' // default role
        });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save user
        await user.save();

        res.json({ message: "user registered successfully", success: true });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
});


// Login endpoint

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Please provide email and password',
                success: false
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: 'User not found',
                success: false
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid credentials',
                success: false
            });
        }

        // Generate access token
        const accessPayload = {
            user: {
                id: user.id,
                role: user.role
            },
            type: 'access', // Token type
            iat: Math.floor(Date.now() / 1000) 
        };
        
        const accessToken = jwt.sign(
            accessPayload,
            process.env.JWT_SECRET,
            {
                expiresIn: "24h", 
                algorithm: 'HS256'
            }
        );
        res.json({
            message: "Login successful",
            success: true,
            accessToken,
            // refreshToken,
            // tokenExpiry: Date.now() + (2 * 60 * 1000), // 2 minutes in milliseconds
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({
            message: 'Server error',
            success: false
        });
    }
});



// After existing routes...
router.post('/verify-token', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                isValid: false,
                message: 'No token found'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.user.id).select('-password');

        if (!user) {
            return res.status(401).json({
                isValid: false,
                message: 'User not found'
            });
        }

        return res.json({
            isValid: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                isValid: false,
                message: 'Token expired',
                isExpired: true
            });
        }
        return res.status(401).json({
            isValid: false,
            message: 'Invalid token'
        });
    }
});

module.exports = router;