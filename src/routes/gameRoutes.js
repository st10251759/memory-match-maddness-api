const express = require('express');
const router = express.Router();
const { db, admin } = require('../config/firebase');

// Submit game result
router.post('/result', async (req, res) => {
    try {
        const gameData = req.body;
        const gameId = gameData.gameId || db.collection('games').doc().id;
        
        await db.collection('games').doc(gameId).set({
            ...gameData,
            submittedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Update user stats
        await updateUserStats(gameData.userId, gameData);
        
        res.json({ success: true, gameId: gameId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user games
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10 } = req.query;
        
        const gamesSnapshot = await db.collection('games')
            .where('userId', '==', userId)
            .orderBy('completedAt', 'desc')
            .limit(parseInt(limit))
            .get();
        
        const games = [];
        gamesSnapshot.forEach(doc => {
            games.push({ id: doc.id, ...doc.data() });
        });
        
        res.json({ success: true, data: games });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const { mode = 'ARCADE', limit = 10 } = req.query;
        
        const gamesSnapshot = await db.collection('games')
            .where('gameMode', '==', mode)
            .orderBy('score', 'desc')
            .limit(parseInt(limit))
            .get();
        
        const leaderboard = [];
        gamesSnapshot.forEach(doc => {
            const data = doc.data();
            leaderboard.push({
                userId: data.userId,
                username: data.username || 'Anonymous',
                score: data.score,
                timeTaken: data.timeTaken,
                completedAt: data.completedAt
            });
        });
        
        res.json({ success: true, data: leaderboard });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper function to update user stats
async function updateUserStats(userId, gameData) {
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
}

module.exports = router;