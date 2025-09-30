const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Get user profile
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ success: true, data: userDoc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create/Update user profile
router.post('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userData = req.body;
        
        await db.collection('users').doc(userId).set({
            ...userData,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        res.json({ success: true, message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user progress
router.get('/:userId/progress', async (req, res) => {
    try {
        const { userId } = req.params;
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const userData = userDoc.data();
        res.json({
            success: true,
            data: {
                totalXP: userData.totalXP || 0,
                level: userData.level || 1,
                totalGamesPlayed: userData.totalGamesPlayed || 0,
                gamesWon: userData.gamesWon || 0,
                currentStreak: userData.currentStreak || 0,
                bestStreak: userData.bestStreak || 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user settings
router.put('/:userId/settings', async (req, res) => {
    try {
        const { userId } = req.params;
        const settings = req.body;
        
        await db.collection('users').doc(userId).update({
            settings: settings,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.json({ success: true, message: 'Settings updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;