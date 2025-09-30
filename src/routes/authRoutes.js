const express = require('express');
const router = express.Router();
const { auth } = require('../config/firebase');

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

module.exports = router;