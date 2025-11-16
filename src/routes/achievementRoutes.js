const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
 
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Achievements API is running',
        version: '2.0.0'
    });
});
 
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
       
        const snapshot = await db.collection('achievements')
            .where('userId', '==', userId)
            .get();
       
        const achievements = [];
        snapshot.forEach(doc => achievements.push({ id: doc.id, ...doc.data() }));
       
        res.json({ success: true, data: achievements });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
 
router.post('/unlock', async (req, res) => {
    try {
        const { userId, achievementType, name, description, progress = 100 } = req.body;
       
        const id = db.collection('achievements').doc().id;
        await db.collection('achievements').doc(id).set({
            id, userId, achievementType, name, description,
            isUnlocked: progress >= 100,
            progress,
            unlockedAt: progress >= 100 ? admin.firestore.FieldValue.serverTimestamp() : null,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
       
        res.json({ success: true, achievementId: id });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
 
module.exports = router;
 
 