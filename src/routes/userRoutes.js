const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');

// Get user profile
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }
        
        res.json({ 
            success: true, 
            data: userDoc.data() 
        });
    } catch (error) {
        console.error('Error getting user profile:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Create/Update user profile
router.post('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const userData = req.body;
        
        await db.collection('users').doc(userId).set({
            ...userData,
            userId: userId,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        // Initialize level progress if new user
        const levelProgressSnapshot = await db.collection('levelProgress')
            .where('userId', '==', userId)
            .limit(1)
            .get();

        if (levelProgressSnapshot.empty) {
            console.log(`Initializing level progress for new user: ${userId}`);
            const batch = db.batch();
            
            for (let i = 1; i <= 16; i++) {
                const levelRef = db.collection('levelProgress').doc();
                batch.set(levelRef, {
                    userId,
                    levelNumber: i,
                    stars: 0,
                    bestScore: 0,
                    bestTime: 0,
                    bestMoves: 0,
                    isUnlocked: i === 1,
                    isCompleted: false,
                    lastPlayed: 0,
                    timesPlayed: 0,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            
            await batch.commit();
            console.log('✅ Level progress initialized');
        }
        
        res.json({ 
            success: true, 
            message: 'Profile updated successfully',
            data: userData
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get user progress (with level progress included)
router.get('/:userId/progress', async (req, res) => {
    try {
        const { userId } = req.params;
        const userDoc = await db.collection('users').doc(userId).get();
        
        if (!userDoc.exists) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }
        
        const userData = userDoc.data();

        // Get level progress
        const levelProgressSnapshot = await db.collection('levelProgress')
            .where('userId', '==', userId)
            .orderBy('levelNumber', 'asc')
            .get();

        const levelProgress = [];
        let totalStars = 0;
        let completedLevels = 0;

        levelProgressSnapshot.forEach(doc => {
            const level = doc.data();
            levelProgress.push({
                levelNumber: level.levelNumber,
                stars: level.stars || 0,
                bestScore: level.bestScore || 0,
                bestTime: level.bestTime || 0,
                bestMoves: level.bestMoves || 0,
                isUnlocked: level.isUnlocked || false,
                isCompleted: level.isCompleted || false
            });
            totalStars += level.stars || 0;
            if (level.isCompleted) completedLevels++;
        });

        // Get arcade stats
        const arcadeSnapshot = await db.collection('arcadeSessions')
            .where('userId', '==', userId)
            .orderBy('score', 'desc')
            .limit(1)
            .get();

        let bestArcadeScore = 0;
        if (!arcadeSnapshot.empty) {
            bestArcadeScore = arcadeSnapshot.docs[0].data().score || 0;
        }

        res.json({
            success: true,
            data: {
                totalXP: userData.totalXP || 0,
                level: userData.level || 1,
                totalGamesPlayed: userData.totalGamesPlayed || 0,
                gamesWon: userData.gamesWon || 0,
                currentStreak: userData.currentStreak || 0,
                bestStreak: userData.bestStreak || 0,
                averageCompletionTime: userData.averageCompletionTime || 0,
                accuracyRate: userData.accuracyRate || 0,
                // Level-specific stats
                totalStars: totalStars,
                completedLevels: completedLevels,
                levelProgress: levelProgress,
                bestArcadeScore: bestArcadeScore
            }
        });
    } catch (error) {
        console.error('Error getting user progress:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get user level progress (dedicated endpoint)
router.get('/:userId/level-progress', async (req, res) => {
    try {
        const { userId } = req.params;

        const levelProgressSnapshot = await db.collection('levelProgress')
            .where('userId', '==', userId)
            .orderBy('levelNumber', 'asc')
            .get();

        const levels = [];
        let totalStars = 0;
        let completedCount = 0;

        levelProgressSnapshot.forEach(doc => {
            const data = doc.data();
            levels.push({
                levelNumber: data.levelNumber,
                stars: data.stars || 0,
                bestScore: data.bestScore || 0,
                bestTime: data.bestTime || 0,
                bestMoves: data.bestMoves || 0,
                isUnlocked: data.isUnlocked || false,
                isCompleted: data.isCompleted || false,
                lastPlayed: data.lastPlayed || 0,
                timesPlayed: data.timesPlayed || 0
            });
            totalStars += data.stars || 0;
            if (data.isCompleted) completedCount++;
        });

        // Initialize levels if none exist
        if (levels.length === 0) {
            const batch = db.batch();
            for (let i = 1; i <= 16; i++) {
                const levelRef = db.collection('levelProgress').doc();
                const levelData = {
                    userId,
                    levelNumber: i,
                    stars: 0,
                    bestScore: 0,
                    bestTime: 0,
                    bestMoves: 0,
                    isUnlocked: i === 1,
                    isCompleted: false,
                    lastPlayed: 0,
                    timesPlayed: 0,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                };
                batch.set(levelRef, levelData);
                levels.push(levelData);
            }
            await batch.commit();
            console.log('✅ Initialized level progress for user:', userId);
        }

        res.json({
            success: true,
            data: {
                levels,
                totalStars,
                completedCount
            }
        });

    } catch (error) {
        console.error('Error getting level progress:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
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
        
        res.json({ 
            success: true, 
            message: 'Settings updated successfully' 
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Delete user (cascade delete all related data)
router.delete('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Delete user document
        await db.collection('users').doc(userId).delete();
        
        // Delete level progress
        const levelProgressSnapshot = await db.collection('levelProgress')
            .where('userId', '==', userId)
            .get();
        
        const batch = db.batch();
        levelProgressSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        // Delete arcade sessions
        const arcadeSnapshot = await db.collection('arcadeSessions')
            .where('userId', '==', userId)
            .get();
        
        arcadeSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        // Delete games
        const gamesSnapshot = await db.collection('games')
            .where('userId', '==', userId)
            .get();
        
        gamesSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        // Delete achievements
        const achievementsSnapshot = await db.collection('achievements')
            .where('userId', '==', userId)
            .get();
        
        achievementsSnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        
        console.log(`✅ User ${userId} and all related data deleted`);
        
        res.json({ 
            success: true, 
            message: 'User and all related data deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;