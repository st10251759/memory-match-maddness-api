const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
 
// GET /api/users - Test endpoint
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Users API is running',
        version: '2.0.0',
        endpoints: {
            profile: 'GET /api/users/:userId',
            createUpdate: 'POST /api/users/:userId',
            progress: 'GET /api/users/:userId/progress',
            levelProgress: 'GET /api/users/:userId/level-progress',
            settings: 'PUT /api/users/:userId/settings'
        }
    });
});
 
// GET /api/users/:userId - Get user profile
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
 
// POST /api/users/:userId - Create/update user profile
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
            console.log(`Initializing level progress for user: ${userId}`);
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
 
// GET /api/users/:userId/progress - Get user progress summary
router.get('/:userId/progress', async (req, res) => {
    try {
        const { userId } = req.params;
 
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.exists ? userDoc.data() : {};
 
        const gamesSnapshot = await db.collection('games')
            .where('userId', '==', userId)
            .get();
 
        let totalGames = 0;
        let totalScore = 0;
        let totalTime = 0;
 
        gamesSnapshot.forEach(doc => {
            const game = doc.data();
            totalGames++;
            totalScore += game.score || 0;
            totalTime += game.time || 0;
        });
 
        res.json({
            success: true,
            data: {
                username: userData.username || 'Player',
                totalGamesPlayed: totalGames,
                totalScore: totalScore,
                averageScore: totalGames > 0 ? Math.round(totalScore / totalGames) : 0,
                totalPlaytime: totalTime
            }
        });
 
    } catch (error) {
        console.error('Error fetching user progress:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
 
// GET /api/users/:userId/level-progress - Get detailed level progress
router.get('/:userId/level-progress', async (req, res) => {
    try {
        const { userId } = req.params;
 
        const levelProgressSnapshot = await db.collection('levelProgress')
            .where('userId', '==', userId)
            .get();
 
        const levels = [];
        let totalStars = 0;
        let completedCount = 0;
 
        levelProgressSnapshot.forEach(doc => {
            const data = doc.data();
            levels.push({
                id: doc.id,
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
 
        levels.sort((a, b) => a.levelNumber - b.levelNumber);
 
        res.json({
            success: true,
            data: {
                levels,
                totalStars,
                completedCount
            }
        });
 
    } catch (error) {
        console.error('Error fetching level progress:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
 
// PUT /api/users/:userId/settings - Update settings
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
 
 