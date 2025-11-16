const express = require('express');
const router = express.Router();
const { auth } = require('../config/firebase');
 
// GET /api/auth - Test endpoint
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Authentication API is running',
        version: '2.0.0',
        endpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            verify: 'POST /api/auth/verify',
            user: 'GET /api/auth/user/:userId'
        }
    });
});
 
// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;
 
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }
 
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters'
            });
        }
 
        const userRecord = await auth.createUser({
            email: email,
            password: password,
            displayName: username || email.split('@')[0],
            emailVerified: false
        });
 
        const customToken = await auth.createCustomToken(userRecord.uid);
 
        console.log(`✅ User registered: ${email} (${userRecord.uid})`);
 
        res.json({
            success: true,
            userId: userRecord.uid,
            email: userRecord.email,
            username: userRecord.displayName,
            customToken: customToken,
            message: 'User registered successfully'
        });
 
    } catch (error) {
        console.error('Registration error:', error);
 
        if (error.code === 'auth/email-already-exists') {
            return res.status(400).json({
                success: false,
                error: 'Email already registered'
            });
        }
        if (error.code === 'auth/invalid-email') {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }
 
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
 
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
 
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required'
            });
        }
 
        const userRecord = await auth.getUserByEmail(email);
        const customToken = await auth.createCustomToken(userRecord.uid);
 
        console.log(`✅ Login successful: ${email}`);
 
        res.json({
            success: true,
            userId: userRecord.uid,
            email: userRecord.email,
            username: userRecord.displayName,
            customToken: customToken,
            message: 'Login successful'
        });
 
    } catch (error) {
        console.error('Login error:', error);
 
        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
 
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
 
// POST /api/auth/verify
router.post('/verify', async (req, res) => {
    try {
        const { idToken } = req.body;
 
        if (!idToken) {
            return res.status(400).json({
                success: false,
                error: 'idToken is required'
            });
        }
 
        const decodedToken = await auth.verifyIdToken(idToken);
 
        res.json({
            success: true,
            userId: decodedToken.uid,
            email: decodedToken.email
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
});
 
// GET /api/auth/user/:userId
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userRecord = await auth.getUser(userId);
 
        res.json({
            success: true,
            data: {
                userId: userRecord.uid,
                email: userRecord.email,
                username: userRecord.displayName,
                emailVerified: userRecord.emailVerified,
                disabled: userRecord.disabled,
                createdAt: userRecord.metadata.creationTime,
                lastSignIn: userRecord.metadata.lastSignInTime
            }
        });
 
    } catch (error) {
        console.error('Error fetching user:', error);
 
        if (error.code === 'auth/user-not-found') {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
 
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
 
module.exports = router;
 
 