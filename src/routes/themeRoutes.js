const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// Get all themes
router.get('/', async (req, res) => {
    try {
        const themesSnapshot = await db.collection('themes').get();
        
        const themes = [];
        themesSnapshot.forEach(doc => {
            themes.push({ id: doc.id, ...doc.data() });
        });
        
        res.json({ success: true, data: themes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get theme by name
router.get('/:themeName', async (req, res) => {
    try {
        const { themeName } = req.params;
        
        const themeDoc = await db.collection('themes').doc(themeName).get();
        
        if (!themeDoc.exists) {
            return res.status(404).json({ error: 'Theme not found' });
        }
        
        res.json({ success: true, data: themeDoc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;