const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Submit multiplayer game result
router.post('/result', async (req, res) => {
    try {
        const {
            userId,
            theme,
            player1Score,
            player2Score,
            timeTaken,
            totalMoves,
            timestamp
        } = req.body;

        // Validate required fields
        if (!userId || !theme || player1Score === undefined || player2Score === undefined) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Determine winner
        let winner = null;
        if (player1Score > player2Score) {
            winner = 'player1';
        } else if (player2Score > player1Score) {
            winner = 'player2';
        } else {
            winner = 'tie';
        }

        // Create game document
        const gameData = {
            userId,
            gameMode: 'MULTIPLAYER',
            theme,
            player1Score,
            player2Score,
            winner,
            timeTaken,
            totalMoves,
            timestamp: timestamp || Date.now(),
            createdAt: new Date().toISOString()
        };

        // Save to Firestore
        const gameRef = await db.collection('multiplayerGames').add(gameData);

        console.log(`✅ Multiplayer game saved: ${gameRef.id}`);

        res.json({
            success: true,
            message: 'Multiplayer result saved successfully',
            data: {
                gameId: gameRef.id,
                winner
            }
        });

    } catch (error) {
        console.error('❌ Error saving multiplayer result:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save multiplayer result',
            error: error.message
        });
    }
});

// Get user's multiplayer history
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
        snapshot.forEach(doc => {
            games.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.json({
            success: true,
            data: games
        });

    } catch (error) {
        console.error('❌ Error fetching multiplayer history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch multiplayer history',
            error: error.message
        });
    }
});

module.exports = router;