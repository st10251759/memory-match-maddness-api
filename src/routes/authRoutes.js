const express = require('express');

const router = express.Router();

const { auth } = require('../config/firebase');
 
// ========================================

// EXISTING ENDPOINT - Token Verification

// ========================================
 
// Verify Firebase token

router.post('/verify', async (req, res) => {

    try {

        const { idToken } = req.body;

        const decodedToken = await auth.verifyIdToken(idToken);

        res.json({

            success: true,

            userId: decodedToken.uid,

            email: decodedToken.email

        });

    } catch (error) {

        res.status(401).json({ success: false, error: error.message });

    }

});
 
// ========================================

// NEW ENDPOINTS - Authentication

// ========================================
 
// Register new user (Email/Password)

router.post('/register', async (req, res) => {

    try {

        const { email, password, username } = req.body;

        // Validate input

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

        // Create user in Firebase Auth

        const userRecord = await auth.createUser({

            email: email,

            password: password,

            displayName: username || email.split('@')[0],

            emailVerified: false

        });

        // Generate custom token for immediate login

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

        // Handle specific Firebase errors

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
 
// Login user (Verify credentials and return custom token)

router.post('/login', async (req, res) => {

    try {

        const { email, password } = req.body;

        // Validate input

        if (!email || !password) {

            return res.status(400).json({ 

                success: false, 

                error: 'Email and password are required' 

            });

        }

        // Note: Firebase Admin SDK doesn't have a direct login method

        // The client SDK handles login. This endpoint is for verification after login.

        // We'll return user info if the email exists

        const userRecord = await auth.getUserByEmail(email);

        // Generate custom token

        const customToken = await auth.createCustomToken(userRecord.uid);

        console.log(`✅ Login token generated for: ${email}`);

        res.json({ 

            success: true,

            userId: userRecord.uid,

            email: userRecord.email,

            username: userRecord.displayName,

            customToken: customToken,

            message: 'Login token generated successfully'

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
 
// Get user info by ID

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

                createdAt: userRecord.metadata.creationTime,

                lastSignIn: userRecord.metadata.lastSignInTime

            }

        });

    } catch (error) {

        res.status(404).json({ 

            success: false, 

            error: 'User not found' 

        });

    }

});
 
// Delete user account

router.delete('/user/:userId', async (req, res) => {

    try {

        const { userId } = req.params;

        await auth.deleteUser(userId);

        console.log(`✅ User deleted: ${userId}`);

        res.json({ 

            success: true,

            message: 'User deleted successfully'

        });

    } catch (error) {

        res.status(500).json({ 

            success: false, 

            error: error.message 

        });

    }

});
 
// Send password reset email

router.post('/reset-password', async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {

            return res.status(400).json({ 

                success: false, 

                error: 'Email is required' 

            });

        }

        // Generate password reset link

        const link = await auth.generatePasswordResetLink(email);

        console.log(`✅ Password reset link generated for: ${email}`);

        res.json({ 

            success: true,

            resetLink: link,

            message: 'Password reset link generated'

        });

    } catch (error) {

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
 