const jwt = require('jsonwebtoken');
const express = require('express');
const router = express.Router();

// const auth = async (req, res, next) => {
//     try {
//         console.log('auth middleware');
//         const token = req.header('Authorization')?.replace('Bearer ', '');

//         if (!token) {
//             return res.status(401).json({
//                 message: 'No token, authorization denied',
//                 success: false
//             });
//         }

//         // Add explicit options for verification
//         const decoded = jwt.verify(token, process.env.JWT_SECRET, {
//             ignoreExpiration: false // Ensure expiration is checked
//         });

        
//         const currentTimestamp = Math.floor(Date.now() / 1000); // Convert to seconds
//         const tokenExp = Math.floor(decoded.exp); // Ensure exp is in seconds

//         console.log('Current timestamp (s):', currentTimestamp);
//         console.log('Token expiration (s):', tokenExp);

//         if (tokenExp < currentTimestamp) {
//             console.log('Token has expired');
//             return res.status(401).json({
//                 message: 'Token has expired. Please login again.',
//                 success: false,
//                 isExpired: true
//             });
//         }


//         req.user = decoded.user;
//         next();

//     } catch (error) {
//         console.log('Token error:', error.name, error.message);

//         if (error.name === 'TokenExpiredError') {
//             return res.status(401).json({
//                 message: 'Token has expired. Please login again.',
//                 success: false,
//                 isExpired: true
//             });
//         }

//         res.status(401).json({
//             message: 'Token is not valid',
//             success: false
//         });
//     }
// };
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                message: 'No token, authorization denied',
                success: false
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded.user;
            next();
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    message: 'Token expired',
                    success: false,
                    isExpired: true
                });
            }
            throw err;
        }

    } catch (error) {
        res.status(401).json({
            message: 'Token is not valid',
            success: false
        });
    }
};

module.exports = auth;
