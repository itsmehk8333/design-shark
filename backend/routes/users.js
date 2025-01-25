const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const auth = require('../middleware/auth.js');

// Get all users
router.get('/', auth, async (req, res) => {
    try {
        const users = await User.find({role:{$ne:"admin"}}).select('-password');
        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password ');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get user by username
router.get('/username/:username', auth, async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.params.username
        }).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;