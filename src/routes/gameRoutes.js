const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');
 
// GET /api/games - Test endpoint
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Games API is running',
        version: '2.0.0',
        endpoints: {
            levelResult: 'POST /api/games/level-result',
            arcadeResult: 'POST /api/games/arcade-result',
            userLevelProgress: 'GET /api/games/user/:userId/level-progress',
            leaderboard: 'GET /api/games/leaderboard'
        }
    });
});
 
// POST /api/games/level-result
router.post('/level-result', async (req, res) => {
    try {
        const { userId, levelNumber, stars, score, time, moves, theme } = req.body;
 
        if (!userId || !levelNumber) {
            return res.status(400).json({
                success: false,
                error: 'userId and levelNumber are required'
            });
        }
 
        console.log(`📊 Level result: User ${userId}, Level ${levelNumber}, Stars ${stars}`);
 
        const levelProgressQuery = await db.collection('levelProgress')
            .where('userId', '==', userId)
            .where('levelNumber', '==', levelNumber)
            .limit(1)
            .get();
 
        let isNewRecord = false;
        let previousBest = 0;
 
        if (levelProgressQuery.empty) {
            const levelRef = db.collection('levelProgress').doc();
            await levelRef.set({
                userId,
                levelNumber,
                stars: stars || 0,
                bestScore: score || 0,
                bestTime: time || 0,
                bestMoves: moves || 0,
                isUnlocked: true,
                isCompleted: (stars || 0) > 0,
                lastPlayed: Date.now(),
                timesPlayed: 1,
                theme: theme || 'ANIMALS',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            isNewRecord = true;
        } else {
            const doc = levelProgressQuery.docs[0];
            const data = doc.data();
            previousBest = data.bestScore || 0;
 
            const updates = {
                lastPlayed: Date.now(),
                timesPlayed: (data.timesPlayed || 0) + 1
            };
 
            if ((score || 0) > (data.bestScore || 0)) {
                updates.bestScore = score;
                updates.stars = stars;
                isNewRecord = true;
            }
            if ((stars || 0) > (data.stars || 0)) updates.stars = stars;
            if (time && (!data.bestTime || time < data.bestTime)) updates.bestTime = time;
            if (moves && (!data.bestMoves || moves < data.bestMoves)) updates.bestMoves = moves;
            if (stars > 0) updates.isCompleted = true;
            if (theme) updates.theme = theme;
 
            await doc.ref.update(updates);
        }
 
        // Unlock next level
        if ((stars || 0) > 0 && levelNumber < 16) {
            const nextQuery = await db.collection('levelProgress')
                .where('userId', '==', userId)
                .where('levelNumber', '==', levelNumber + 1)
                .limit(1)
                .get();
 
            if (nextQuery.empty) {
                const nextRef = db.collection('levelProgress').doc();
                await nextRef.set({
                    userId,
                    levelNumber: levelNumber + 1,
                    stars: 0,
                    bestScore: 0,
                    isUnlocked: true,
                    isCompleted: false,
                    timesPlayed: 0,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            } else {
                await nextQuery.docs[0].ref.update({ isUnlocked: true });
            }
        }
 
        // Save game result
        const gameId = db.collection('games').doc().id;
        await db.collection('games').doc(gameId).set({
            gameId,
            userId,
            gameMode: 'ADVENTURE',
            levelNumber,
            stars: stars || 0,
            score: score || 0,
            time: time || 0,
            moves: moves || 0,
            theme: theme || 'ANIMALS',
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            timestamp: Date.now()
        });
 
        res.json({
            success: true,
            data: { gameId, isNewRecord, previousBest, currentScore: score || 0 }
        });
 
    } catch (error) {
        console.error('❌ Error submitting level result:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
 
// POST /api/games/arcade-result
router.post('/arcade-result', async (req, res) => {
    try {
        const { userId, score, time, moves, theme, gridSize, levelNumber } = req.body;
 
        if (!userId) {
            return res.status(400).json({ success: false, error: 'userId is required' });
        }
 
        const gameId = db.collection('games').doc().id;
        await db.collection('games').doc(gameId).set({
            gameId,
            userId,
            gameMode: 'ARCADE',
            score: score || 0,
            time: time || 0,
            moves: moves || 0,
            theme: theme || 'ANIMALS',
            gridSize: gridSize || '4x4',
            levelNumber: levelNumber || null,
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            timestamp: Date.now()
        });
 
        res.json({ success: true, data: { gameId, score: score || 0 } });
 
    } catch (error) {
        console.error('❌ Error submitting arcade result:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
 
// GET /api/games/user/:userId/level-progress
router.get('/user/:userId/level-progress', async (req, res) => {
    try {
        const { userId } = req.params;
 
        const snapshot = await db.collection('levelProgress')
            .where('userId', '==', userId)
            .get();
 
        const levels = [];
        let totalStars = 0;
 
        snapshot.forEach(doc => {
            const data = doc.data();
            levels.push({
                id: doc.id,
                levelNumber: data.levelNumber,
                stars: data.stars || 0,
                bestScore: data.bestScore || 0,
                isUnlocked: data.isUnlocked || false,
                isCompleted: data.isCompleted || false
            });
            totalStars += data.stars || 0;
        });
 
        levels.sort((a, b) => a.levelNumber - b.levelNumber);
 
        res.json({ success: true, data: { levels, totalStars } });
 
    } catch (error) {
        console.error('❌ Error fetching level progress:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
 
// GET /api/games/leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
 
        const snapshot = await db.collection('games')
            .orderBy('score', 'desc')
            .limit(limit)
            .get();
 
        const leaderboard = [];
        for (const doc of snapshot.docs) {
            const game = doc.data();
            const userDoc = await db.collection('users').doc(game.userId).get();
            leaderboard.push({
                userId: game.userId,
                username: userDoc.exists ? (userDoc.data().username || 'Anonymous') : 'Anonymous',
                score: game.score,
                time: game.time
            });
        }
 
        res.json({ success: true, data: leaderboard });
 
    } catch (error) {
        console.error('❌ Error fetching leaderboard:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
 
module.exports = router;
 
 