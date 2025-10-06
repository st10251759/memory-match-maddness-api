const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');

// ===== LEGACY GAME RESULT (Keep for backward compatibility) =====
router.post('/result', async (req, res) => {
    try {
        const gameData = req.body;
        const gameId = gameData.gameId || db.collection('games').doc().id;
        
        await db.collection('games').doc(gameId).set({
            ...gameData,
            submittedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Update user stats if not arcade/level specific
        if (gameData.gameMode === 'CLASSIC' || gameData.gameMode === 'TIMED') {
            await updateUserStats(gameData.userId, gameData);
        }
        
        res.json({ success: true, gameId: gameId });
    } catch (error) {
        console.error('Error submitting game result:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===== NEW: LEVEL RESULT ENDPOINT =====
router.post('/level-result', async (req, res) => {
    try {
        const {
            userId,
            levelNumber,
            stars,
            score,
            time,
            moves,
            difficulty,
            theme,
            gridSize,
            completedAt
        } = req.body;

        // Validate required fields
        if (!userId || !levelNumber || stars === undefined || !score || !time || !moves) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, levelNumber, stars, score, time, moves'
            });
        }

        // Validate level number (1-16)
        if (levelNumber < 1 || levelNumber > 16) {
            return res.status(400).json({
                success: false,
                message: 'Level number must be between 1 and 16'
            });
        }

        // Get user's level progress
        const levelProgressRef = db.collection('levelProgress')
            .where('userId', '==', userId)
            .where('levelNumber', '==', levelNumber);
        
        const levelProgressSnapshot = await levelProgressRef.get();

        let previousBest = 0;
        let levelProgressId = null;

        if (!levelProgressSnapshot.empty) {
            const doc = levelProgressSnapshot.docs[0];
            const data = doc.data();
            previousBest = data.bestScore || 0;
            levelProgressId = doc.id;
        }

        const newBest = score > previousBest;
        const levelData = {
            userId,
            levelNumber,
            stars: Math.max(stars, levelProgressSnapshot.empty ? 0 : levelProgressSnapshot.docs[0].data().stars),
            bestScore: newBest ? score : previousBest,
            bestTime: levelProgressSnapshot.empty ? time : Math.min(time, levelProgressSnapshot.docs[0].data().bestTime || time),
            bestMoves: levelProgressSnapshot.empty ? moves : Math.min(moves, levelProgressSnapshot.docs[0].data().bestMoves || moves),
            isUnlocked: true,
            isCompleted: true,
            lastPlayed: completedAt || Date.now(),
            timesPlayed: (levelProgressSnapshot.empty ? 0 : levelProgressSnapshot.docs[0].data().timesPlayed || 0) + 1,
            difficulty,
            theme,
            gridSize,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        // Update or create level progress
        if (levelProgressId) {
            await db.collection('levelProgress').doc(levelProgressId).update(levelData);
        } else {
            levelProgressId = db.collection('levelProgress').doc().id;
            await db.collection('levelProgress').doc(levelProgressId).set(levelData);
        }

        // Unlock next level if exists
        if (levelNumber < 16) {
            const nextLevelRef = db.collection('levelProgress')
                .where('userId', '==', userId)
                .where('levelNumber', '==', levelNumber + 1);
            
            const nextLevelSnapshot = await nextLevelRef.get();
            
            if (nextLevelSnapshot.empty) {
                // Create next level entry
                await db.collection('levelProgress').add({
                    userId,
                    levelNumber: levelNumber + 1,
                    stars: 0,
                    bestScore: 0,
                    bestTime: 0,
                    bestMoves: 0,
                    isUnlocked: true,
                    isCompleted: false,
                    lastPlayed: 0,
                    timesPlayed: 0,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Unlock existing next level
                await db.collection('levelProgress').doc(nextLevelSnapshot.docs[0].id).update({
                    isUnlocked: true,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        }

        // Update user stats
        await updateUserStatsForLevel(userId, { stars, score, time, moves });

        console.log(`✅ Level ${levelNumber} completed for user ${userId}`);
        
        res.json({
            success: true,
            message: 'Level result saved successfully',
            newBest: newBest,
            data: {
                gameId: levelProgressId,
                previousBest,
                newBest: score,
                stars,
                unlockedNextLevel: levelNumber < 16
            }
        });

    } catch (error) {
        console.error('❌ Error saving level result:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save level result',
            error: error.message
        });
    }
});

// ===== NEW: ARCADE RESULT ENDPOINT =====
router.post('/arcade-result', async (req, res) => {
    try {
        const {
            userId,
            sessionId,
            score,
            time,
            moves,
            bonus,
            stars,
            theme,
            gridSize,
            difficulty,
            completedAt
        } = req.body;

        // Validate required fields
        if (!userId || !score || !time || !moves) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, score, time, moves'
            });
        }

        // Create arcade session document
        const arcadeData = {
            userId,
            sessionId: sessionId || db.collection('arcadeSessions').doc().id,
            gameMode: 'ARCADE',
            score,
            time,
            moves,
            bonus: bonus || 0,
            stars: stars || 0,
            theme: theme || 'Random',
            gridSize: gridSize || 'Random',
            difficulty: difficulty || 'Random',
            completedAt: completedAt || Date.now(),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const arcadeRef = await db.collection('arcadeSessions').add(arcadeData);

        // Update user stats
        await updateUserStatsForArcade(userId, { score, time, moves, bonus, stars });

        console.log(`✅ Arcade session saved: ${arcadeRef.id}`);

        res.json({
            success: true,
            message: 'Arcade result saved successfully',
            data: {
                gameId: arcadeRef.id,
                score,
                bonus,
                stars
            }
        });

    } catch (error) {
        console.error('❌ Error saving arcade result:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save arcade result',
            error: error.message
        });
    }
});

// ===== GET USER LEVEL PROGRESS =====
router.get('/user/:userId/level-progress', async (req, res) => {
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

        // If no levels exist, initialize them
        if (levels.length === 0) {
            for (let i = 1; i <= 16; i++) {
                await db.collection('levelProgress').add({
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
                levels.push({
                    levelNumber: i,
                    stars: 0,
                    bestScore: 0,
                    bestTime: 0,
                    bestMoves: 0,
                    isUnlocked: i === 1,
                    isCompleted: false,
                    lastPlayed: 0,
                    timesPlayed: 0
                });
            }
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
        console.error('❌ Error fetching level progress:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ===== GET USER GAMES (with mode filter) =====
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10, mode } = req.query;
        
        let query = db.collection('games')
            .where('userId', '==', userId)
            .orderBy('completedAt', 'desc')
            .limit(parseInt(limit));

        if (mode) {
            query = query.where('gameMode', '==', mode);
        }
        
        const gamesSnapshot = await query.get();
        
        const games = [];
        gamesSnapshot.forEach(doc => {
            games.push({ id: doc.id, ...doc.data() });
        });
        
        res.json({ success: true, data: games });
    } catch (error) {
        console.error('Error fetching user games:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===== GET ARCADE SESSIONS =====
router.get('/user/:userId/arcade-sessions', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10 } = req.query;

        const sessionsSnapshot = await db.collection('arcadeSessions')
            .where('userId', '==', userId)
            .orderBy('completedAt', 'desc')
            .limit(parseInt(limit))
            .get();

        const sessions = [];
        sessionsSnapshot.forEach(doc => {
            sessions.push({ id: doc.id, ...doc.data() });
        });

        res.json({ success: true, data: sessions });
    } catch (error) {
        console.error('Error fetching arcade sessions:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===== GET LEADERBOARD =====
router.get('/leaderboard', async (req, res) => {
    try {
        const { mode = 'ARCADE', limit = 10 } = req.query;
        
        let collection = mode === 'ARCADE' ? 'arcadeSessions' : 'levelProgress';
        let orderByField = mode === 'ARCADE' ? 'score' : 'bestScore';

        const leaderboardSnapshot = await db.collection(collection)
            .orderBy(orderByField, 'desc')
            .limit(parseInt(limit))
            .get();
        
        const leaderboard = [];
        const userIds = new Set();

        for (const doc of leaderboardSnapshot.docs) {
            const data = doc.data();
            if (!userIds.has(data.userId)) {
                userIds.add(data.userId);
                
                // Get username from users collection
                const userDoc = await db.collection('users').doc(data.userId).get();
                const username = userDoc.exists ? userDoc.data().username : 'Anonymous';

                leaderboard.push({
                    userId: data.userId,
                    username: username,
                    score: mode === 'ARCADE' ? data.score : data.bestScore,
                    timeTaken: mode === 'ARCADE' ? data.time : data.bestTime,
                    completedAt: mode === 'ARCADE' ? data.completedAt : data.lastPlayed
                });
            }
        }
        
        res.json({ success: true, data: leaderboard });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===== HELPER FUNCTIONS =====

// Update user stats for level completion
async function updateUserStatsForLevel(userId, { stars, score, time, moves }) {
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            console.log('User not found, creating new user document');
            await userRef.set({
                userId,
                totalXP: score,
                totalGamesPlayed: 1,
                gamesWon: 1,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            });
            return;
        }
        
        const userData = userDoc.data();
        await userRef.update({
            totalXP: (userData.totalXP || 0) + score,
            totalGamesPlayed: (userData.totalGamesPlayed || 0) + 1,
            gamesWon: (userData.gamesWon || 0) + 1,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating user stats for level:', error);
    }
}

// Update user stats for arcade session
async function updateUserStatsForArcade(userId, { score, time, moves, bonus, stars }) {
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            await userRef.set({
                userId,
                totalXP: score + bonus,
                totalGamesPlayed: 1,
                gamesWon: 1,
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            });
            return;
        }
        
        const userData = userDoc.data();
        await userRef.update({
            totalXP: (userData.totalXP || 0) + score + bonus,
            totalGamesPlayed: (userData.totalGamesPlayed || 0) + 1,
            gamesWon: (userData.gamesWon || 0) + 1,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating user stats for arcade:', error);
    }
}

// Legacy update user stats
async function updateUserStats(userId, gameData) {
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) return;
        
        const userData = userDoc.data();
        const totalGames = (userData.totalGamesPlayed || 0) + 1;
        const gamesWon = gameData.isWin ? (userData.gamesWon || 0) + 1 : userData.gamesWon || 0;
        
        await userRef.update({
            totalGamesPlayed: totalGames,
            gamesWon: gamesWon,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating legacy user stats:', error);
    }
}

module.exports = router;