const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
 
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Multiplayer API is running',
        version: '2.0.0'
    });
});
 
router.post('/result', async (req, res) => {
    try {
        const { userId, theme, player1Score, player2Score, timeTaken, totalMoves } = req.body;
 
        if (!userId || !theme || player1Score === undefined || player2Score === undefined) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }
 
        let winner = player1Score > player2Score ? 'player1' :
                     player2Score > player1Score ? 'player2' : 'tie';
 
        const gameRef = await db.collection('multiplayerGames').add({
            userId,
            gameMode: 'MULTIPLAYER',
            theme,
            player1Score,
            player2Score,
            winner,
            timeTaken,
            totalMoves,
            timestamp: Date.now(),
            createdAt: new Date().toISOString()
        });
 
        res.json({
            success: true,
            data: { gameId: gameRef.id, winner }
        });
 
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
 
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 10;
 
        const snapshot = await db.collection('multiplayerGames')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();
 
        const games = [];
        snapshot.forEach(doc => games.push({ id: doc.id, ...doc.data() }));
 
        res.json({ success: true, data: games });
 
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
 
module.exports = router;
 
 