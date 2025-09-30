const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');

// Get user achievements
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const achievementsSnapshot = await db.collection('achievements')
            .where('userId', '==', userId)
            .orderBy('unlockedAt', 'desc')
            .get();
        
        const achievements = [];
        achievementsSnapshot.forEach(doc => {
            achievements.push({ id: doc.id, ...doc.data() });
        });
        
        res.json({ success: true, data: achievements });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Unlock achievement
router.post('/unlock', async (req, res) => {
    try {
        const { userId, achievementType, name, description } = req.body;
        const achievementId = db.collection('achievements').doc().id;
        
        await db.collection('achievements').doc(achievementId).set({
            achievementId,
            userId,
            achievementType,
            name,
            description,
            isUnlocked: true,
            progress: 100,
            unlockedAt: admin.firestore.FieldValue.serverTimestamp(),
            isSynced: true
        });
        
        res.json({ success: true, achievementId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;