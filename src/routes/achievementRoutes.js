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
            const data = doc.data();
            achievements.push({ 
                achievementId: doc.id,
                userId: data.userId,
                achievementType: data.achievementType,
                name: data.name,
                description: data.description,
                isUnlocked: data.isUnlocked || false,
                progress: data.progress || 0,
                unlockedAt: data.unlockedAt || null,
                ...data 
            });
        });
        
        res.json({ 
            success: true, 
            data: achievements 
        });
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Unlock achievement
router.post('/unlock', async (req, res) => {
    try {
        const { userId, achievementType, name, description, progress = 100 } = req.body;
        
        if (!userId || !achievementType || !name) {
            return res.status(400).json({
                success: false,
                error: 'userId, achievementType, and name are required'
            });
        }
        
        // Check if achievement already exists
        const existingSnapshot = await db.collection('achievements')
            .where('userId', '==', userId)
            .where('achievementType', '==', achievementType)
            .where('name', '==', name)
            .get();
        
        if (!existingSnapshot.empty) {
            const existingDoc = existingSnapshot.docs[0];
            const existingData = existingDoc.data();
            
            // Update progress if not already unlocked
            if (!existingData.isUnlocked) {
                await db.collection('achievements').doc(existingDoc.id).update({
                    isUnlocked: progress >= 100,
                    progress: progress,
                    unlockedAt: progress >= 100 ? admin.firestore.FieldValue.serverTimestamp() : null,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                
                return res.json({
                    success: true,
                    achievementId: existingDoc.id,
                    message: progress >= 100 ? 'Achievement unlocked' : 'Achievement progress updated',
                    isUnlocked: progress >= 100
                });
            }
            
            return res.json({
                success: true,
                achievementId: existingDoc.id,
                message: 'Achievement already unlocked',
                isUnlocked: true
            });
        }
        
        // Create new achievement
        const achievementId = db.collection('achievements').doc().id;
        const isUnlocked = progress >= 100;
        
        await db.collection('achievements').doc(achievementId).set({
            achievementId,
            userId,
            achievementType,
            name,
            description: description || '',
            isUnlocked: isUnlocked,
            progress: progress,
            unlockedAt: isUnlocked ? admin.firestore.FieldValue.serverTimestamp() : null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            isSynced: true
        });
        
        console.log(`✅ Achievement ${name} created for user ${userId}`);
        
        res.json({ 
            success: true, 
            achievementId,
            message: isUnlocked ? 'Achievement unlocked' : 'Achievement created',
            isUnlocked: isUnlocked
        });
    } catch (error) {
        console.error('Error unlocking achievement:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Update achievement progress
router.put('/progress', async (req, res) => {
    try {
        const { userId, achievementType, name, progress } = req.body;
        
        if (!userId || !achievementType || !name || progress === undefined) {
            return res.status(400).json({
                success: false,
                error: 'userId, achievementType, name, and progress are required'
            });
        }
        
        const achievementSnapshot = await db.collection('achievements')
            .where('userId', '==', userId)
            .where('achievementType', '==', achievementType)
            .where('name', '==', name)
            .get();
        
        if (achievementSnapshot.empty) {
            return res.status(404).json({
                success: false,
                error: 'Achievement not found'
            });
        }
        
        const achievementDoc = achievementSnapshot.docs[0];
        const isUnlocked = progress >= 100;
        
        await db.collection('achievements').doc(achievementDoc.id).update({
            progress: progress,
            isUnlocked: isUnlocked,
            unlockedAt: isUnlocked ? admin.firestore.FieldValue.serverTimestamp() : achievementDoc.data().unlockedAt,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.json({
            success: true,
            achievementId: achievementDoc.id,
            message: isUnlocked ? 'Achievement unlocked' : 'Progress updated',
            progress: progress,
            isUnlocked: isUnlocked
        });
        
    } catch (error) {
        console.error('Error updating achievement progress:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get achievement statistics
router.get('/stats/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const achievementsSnapshot = await db.collection('achievements')
            .where('userId', '==', userId)
            .get();
        
        let totalAchievements = 0;
        let unlockedAchievements = 0;
        let totalProgress = 0;
        
        achievementsSnapshot.forEach(doc => {
            const data = doc.data();
            totalAchievements++;
            if (data.isUnlocked) unlockedAchievements++;
            totalProgress += data.progress || 0;
        });
        
        const averageProgress = totalAchievements > 0 ? totalProgress / totalAchievements : 0;
        
        res.json({
            success: true,
            data: {
                totalAchievements,
                unlockedAchievements,
                lockedAchievements: totalAchievements - unlockedAchievements,
                averageProgress: Math.round(averageProgress),
                completionRate: totalAchievements > 0 ? Math.round((unlockedAchievements / totalAchievements) * 100) : 0
            }
        });
        
    } catch (error) {
        console.error('Error fetching achievement stats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete achievement
router.delete('/:achievementId', async (req, res) => {
    try {
        const { achievementId } = req.params;
        
        await db.collection('achievements').doc(achievementId).delete();
        
        console.log(`✅ Achievement ${achievementId} deleted`);
        
        res.json({
            success: true,
            message: 'Achievement deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting achievement:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;