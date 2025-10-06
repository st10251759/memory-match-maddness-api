const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');

// ===== SUBMIT LEVEL RESULT (FIXED) =====
router.post('/level-result', async (req, res) => {
    try {
        const { userId, levelNumber, score, timeTaken, moves, theme, completed } = req.body;
        
        // Validate required fields
        if (!userId || !levelNumber || score === undefined || timeTaken === undefined || moves === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, levelNumber, score, timeTaken, moves'
            });
        }

        console.log(`📊 Processing level result - User: ${userId}, Level: ${levelNumber}, Score: ${score}`);

        // Calculate stars (1-3 based on performance)
        let stars = 1;
        if (moves <= 15 && timeTaken <= 30) {
            stars = 3;
        } else if (moves <= 20 && timeTaken <= 45) {
            stars = 2;
        }

        // Query WITHOUT compound index - use simple query
        const levelProgressSnapshot = await db.collection('levelProgress')
            .where('userId', '==', userId)
            .get();

        // Filter in memory for levelNumber
        let existingProgress = null;
        levelProgressSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.levelNumber === levelNumber) {
                existingProgress = { id: doc.id, ...data };
            }
        });

        if (existingProgress) {
            // Update existing progress
            const updateData = {
                stars: Math.max(existingProgress.stars || 0, stars),
                bestScore: Math.max(existingProgress.bestScore || 0, score),
                bestTime: existingProgress.bestTime ? Math.min(existingProgress.bestTime, timeTaken) : timeTaken,
                bestMoves: existingProgress.bestMoves ? Math.min(existingProgress.bestMoves, moves) : moves,
                isCompleted: completed || existingProgress.isCompleted,
                lastPlayed: admin.firestore.FieldValue.serverTimestamp(),
                timesPlayed: (existingProgress.timesPlayed || 0) + 1
            };

            await db.collection('levelProgress').doc(existingProgress.id).update(updateData);
            
            console.log(`✅ Updated level ${levelNumber} progress for user ${userId}`);
            
            // Unlock next level if this one is completed
            if (completed && levelNumber < 16) {
                await unlockNextLevel(userId, levelNumber + 1);
            }

            return res.json({
                success: true,
                message: 'Level progress updated',
                starsEarned: stars,
                isNewBest: score > (existingProgress.bestScore || 0)
            });
        } else {
            // Create new progress entry
            const newProgressId = db.collection('levelProgress').doc().id;
            const newProgress = {
                userId: userId,
                levelNumber: levelNumber,
                stars: stars,
                bestScore: score,
                bestTime: timeTaken,
                bestMoves: moves,
                isUnlocked: true,
                isCompleted: completed || false,
                lastPlayed: admin.firestore.FieldValue.serverTimestamp(),
                timesPlayed: 1,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('levelProgress').doc(newProgressId).set(newProgress);
            
            console.log(`✅ Created new level ${levelNumber} progress for user ${userId}`);

            // Unlock next level if this one is completed
            if (completed && levelNumber < 16) {
                await unlockNextLevel(userId, levelNumber + 1);
            }

            return res.json({
                success: true,
                message: 'Level progress created',
                starsEarned: stars,
                isNewBest: true
            });
        }

    } catch (error) {
        console.error('❌ Error submitting level result:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Helper function to unlock next level
async function unlockNextLevel(userId, nextLevelNumber) {
    try {
        const nextLevelSnapshot = await db.collection('levelProgress')
            .where('userId', '==', userId)
            .get();

        let nextLevelExists = false;
        let nextLevelDocId = null;

        nextLevelSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.levelNumber === nextLevelNumber) {
                nextLevelExists = true;
                nextLevelDocId = doc.id;
            }
        });

        if (nextLevelExists && nextLevelDocId) {
            await db.collection('levelProgress').doc(nextLevelDocId).update({
                isUnlocked: true
            });
            console.log(`🔓 Unlocked level ${nextLevelNumber} for user ${userId}`);
        } else {
            // Create the next level entry
            const newLevelId = db.collection('levelProgress').doc().id;
            await db.collection('levelProgress').doc(newLevelId).set({
                userId: userId,
                levelNumber: nextLevelNumber,
                stars: 0,
                bestScore: 0,
                bestTime: 0,
                bestMoves: 0,
                isUnlocked: true,
                isCompleted: false,
                lastPlayed: 0,
                timesPlayed: 0,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`🔓 Created and unlocked level ${nextLevelNumber} for user ${userId}`);
        }
    } catch (error) {
        console.error(`Error unlocking level ${nextLevelNumber}:`, error);
    }
}

// ===== SUBMIT ARCADE RESULT (FIXED) =====
router.post('/arcade-result', async (req, res) => {
    try {
        const { userId, score, time, theme, gridSize, moves } = req.body;
        
        // Validate required fields
        if (!userId || score === undefined || time === undefined || moves === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: userId, score, time, moves'
            });
        }

        console.log(`🎮 Processing arcade result - User: ${userId}, Score: ${score}`);

        const arcadeSessionId = db.collection('arcadeSessions').doc().id;
        
        const sessionData = {
            sessionId: arcadeSessionId,
            userId: userId,
            score: score,
            time: time,
            theme: theme || 'default',
            gridSize: gridSize || '4x4',
            moves: moves,
            completedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('arcadeSessions').doc(arcadeSessionId).set(sessionData);

        console.log(`✅ Arcade session saved for user ${userId}`);

        // Update user stats (optional)
        try {
            const userRef = db.collection('users').doc(userId);
            const userDoc = await userRef.get();
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                await userRef.update({
                    totalGamesPlayed: (userData.totalGamesPlayed || 0) + 1,
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        } catch (userError) {
            console.error('Error updating user stats:', userError);
            // Continue anyway - arcade result was saved
        }

        res.json({
            success: true,
            message: 'Arcade result saved successfully',
            sessionId: arcadeSessionId,
            score: score
        });

    } catch (error) {
        console.error('❌ Error submitting arcade result:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ===== GET USER LEVEL PROGRESS (FIXED) =====
router.get('/user/:userId/level-progress', async (req, res) => {
    try {
        const { userId } = req.params;

        console.log(`📊 Fetching level progress for user: ${userId}`);

        // Simple query without compound index
        const levelProgressSnapshot = await db.collection('levelProgress')
            .where('userId', '==', userId)
            .get();

        // Sort in memory after fetching
        const levels = [];
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
        });

        // Sort by levelNumber in memory
        levels.sort((a, b) => a.levelNumber - b.levelNumber);

        // Calculate totals
        let totalStars = 0;
        let completedCount = 0;

        levels.forEach(level => {
            totalStars += level.stars;
            if (level.isCompleted) completedCount++;
        });

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

// ===== GET USER GAMES (with mode filter) =====
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10, mode } = req.query;
        
        let query = db.collection('games')
            .where('userId', '==', userId)
            .limit(parseInt(limit));

        // Note: Can't use orderBy with where without index
        // Fetch and sort in memory instead
        const gamesSnapshot = await query.get();
        
        const games = [];
        gamesSnapshot.forEach(doc => {
            const data = doc.data();
            if (!mode || data.gameMode === mode) {
                games.push({ id: doc.id, ...data });
            }
        });

        // Sort by completedAt in memory
        games.sort((a, b) => {
            const aTime = a.completedAt?.toMillis?.() || 0;
            const bTime = b.completedAt?.toMillis?.() || 0;
            return bTime - aTime; // Descending
        });
        
        res.json({ success: true, data: games.slice(0, parseInt(limit)) });
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
            .limit(parseInt(limit))
            .get();

        const sessions = [];
        sessionsSnapshot.forEach(doc => {
            sessions.push({ id: doc.id, ...doc.data() });
        });

        // Sort in memory by completedAt
        sessions.sort((a, b) => {
            const aTime = a.completedAt?.toMillis?.() || 0;
            const bTime = b.completedAt?.toMillis?.() || 0;
            return bTime - aTime;
        });

        res.json({ success: true, data: sessions });
    } catch (error) {
        console.error('Error fetching arcade sessions:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ===== GET LEADERBOARD (FIXED) =====
router.get('/leaderboard', async (req, res) => {
    try {
        const { mode = 'ARCADE', limit = 10 } = req.query;
        
        console.log(`🏆 Fetching leaderboard - Mode: ${mode}`);

        let collection = mode === 'ARCADE' ? 'arcadeSessions' : 'levelProgress';

        // Fetch all documents and sort in memory to avoid index issues
        const leaderboardSnapshot = await db.collection(collection)
            .limit(parseInt(limit) * 3) // Fetch more to account for duplicates
            .get();
        
        const leaderboard = [];
        const userIds = new Set();

        // Create array of all entries
        const allEntries = [];
        leaderboardSnapshot.forEach(doc => {
            const data = doc.data();
            allEntries.push({
                userId: data.userId,
                score: mode === 'ARCADE' ? (data.score || 0) : (data.bestScore || 0),
                time: mode === 'ARCADE' ? (data.time || 0) : (data.bestTime || 0),
                completedAt: data.completedAt
            });
        });

        // Sort by score descending
        allEntries.sort((a, b) => b.score - a.score);

        // Get unique users (best score only)
        for (const entry of allEntries) {
            if (!userIds.has(entry.userId) && leaderboard.length < parseInt(limit)) {
                userIds.add(entry.userId);
                
                // Get username from users collection
                try {
                    const userDoc = await db.collection('users').doc(entry.userId).get();
                    const username = userDoc.exists ? 
                        (userDoc.data().username || 'Anonymous') : 'Anonymous';

                    leaderboard.push({
                        userId: entry.userId,
                        username: username,
                        score: entry.score,
                        timeTaken: entry.time,
                        completedAt: entry.completedAt
                    });
                } catch (userError) {
                    console.error(`Error fetching user ${entry.userId}:`, userError);
                    leaderboard.push({
                        userId: entry.userId,
                        username: 'Anonymous',
                        score: entry.score,
                        timeTaken: entry.time,
                        completedAt: entry.completedAt
                    });
                }
            }
        }

        console.log(`✅ Leaderboard fetched: ${leaderboard.length} entries`);

        res.json({ success: true, data: leaderboard });
    } catch (error) {
        console.error('❌ Error fetching leaderboard:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Legacy endpoint for backward compatibility
router.post('/result', async (req, res) => {
    try {
        const gameResult = req.body;
        const gameId = db.collection('games').doc().id;
        
        await db.collection('games').doc(gameId).set({
            ...gameResult,
            gameId: gameId,
            completedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log(`✅ Game result saved: ${gameId}`);
        
        // Update user stats
        await updateUserStats(gameResult.userId, gameResult.score > 0);
        
        res.json({ 
            success: true, 
            gameId: gameId,
            message: 'Game result saved successfully'
        });
    } catch (error) {
        console.error('Error submitting game result:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Helper function to update user stats
async function updateUserStats(userId, isWin) {
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        
        if (!userDoc.exists) {
            return;
        }

        const userData = userDoc.data();
        const totalGames = (userData.totalGamesPlayed || 0) + 1;
        const gamesWon = isWin ? (userData.gamesWon || 0) + 1 : userData.gamesWon || 0;
        
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