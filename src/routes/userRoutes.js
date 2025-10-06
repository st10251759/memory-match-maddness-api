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
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
            
            await batch.commit();
            console.log(`✅ Initialized 16 levels for user ${userId}`);
        }
        
        res.json({ 
            success: true, 
            message: 'User profile updated',
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

// Get user progress
router.get('/:userId/progress', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get user data
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.exists ? userDoc.data() : {};

        // Get level progress - NO COMPOUND INDEX
        const levelProgressSnapshot = await db.collection('levelProgress')
            .where('userId', '==', userId)
            .get();

        let totalStars = 0;
        let completedLevels = 0;
        const levelProgress = [];

        levelProgressSnapshot.forEach(doc => {
            const data = doc.data();
            totalStars += data.stars || 0;
            if (data.isCompleted) completedLevels++;
            levelProgress.push({
                levelNumber: data.levelNumber,
                stars: data.stars || 0,
                isCompleted: data.isCompleted || false
            });
        });

        // Sort in memory
        levelProgress.sort((a, b) => a.levelNumber - b.levelNumber);

        // Get best arcade score - NO ORDER BY
        const arcadeSnapshot = await db.collection('arcadeSessions')
            .where('userId', '==', userId)
            .get();

        let bestArcadeScore = 0;
        arcadeSnapshot.forEach(doc => {
            const score = doc.data().score || 0;
            if (score > bestArcadeScore) {
                bestArcadeScore = score;
            }
        });

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

// Get user level progress (dedicated endpoint) - FIXED FOR TEST 12
router.get('/:userId/level-progress', async (req, res) => {
    try {
        const { userId } = req.params;

        console.log(`📊 Fetching level progress for user: ${userId}`);

        // Simple query - NO COMPOUND INDEX NEEDED
        const levelProgressSnapshot = await db.collection('levelProgress')
            .where('userId', '==', userId)
            .get();

        const levels = [];
        let totalStars = 0;
        let completedCount = 0;

        // Process all documents
        levelProgressSnapshot.forEach(doc => {
            const data = doc.data();
            levels.push({
                levelNumber: data.levelNumber,
                stars: data.stars || 0,
                bestScore: data.bestScore || 0,
                bestTime: data.bestTime || 0,
                bestMoves: data.bestMoves || 0,
                isUnlocked: data.isUnlocked || false,
                isCompleted: data.isCompleted || false
            });
            
            totalStars += data.stars || 0;
            if (data.isCompleted) completedCount++;
        });

        // Sort by levelNumber IN MEMORY (no index required)
        levels.sort((a, b) => a.levelNumber - b.levelNumber);

        console.log(`✅ Found ${levels.length} levels, ${totalStars} stars, ${completedCount} completed`);

        res.json({
            success: true,
            data: {
                levels,
                totalStars,
                completedCount
            }
        });

    } catch (error) {
        console.error('❌ Error fetching level progress:', error);
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
            ...settings,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
        
        res.json({ 
            success: true, 
            message: 'Settings updated' 
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;