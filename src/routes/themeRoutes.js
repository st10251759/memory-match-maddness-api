const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
 
// Get all themes
router.get('/', async (req, res) => {
    try {
        const themesSnapshot = await db.collection('themes').get();
       
        const themes = [];
        themesSnapshot.forEach(doc => {
            const data = doc.data();
            themes.push({
                id: doc.id,
                displayName: data.displayName || doc.id,
                previewImageUrl: data.previewImageUrl || null,
                cardImageUrls: data.cardImageUrls || [],
                ...data
            });
        });
 
        // If no themes exist, return default themes list
        if (themes.length === 0) {
            const defaultThemes = [
                { id: 'animals', displayName: 'Animals', previewImageUrl: null, cardImageUrls: [] },
                { id: 'fruits', displayName: 'Fruits & Foods', previewImageUrl: null, cardImageUrls: [] },
                { id: 'f1', displayName: 'F1', previewImageUrl: null, cardImageUrls: [] },
                { id: 'pokemon', displayName: 'Pokémon', previewImageUrl: null, cardImageUrls: [] },
                { id: 'harry_potter', displayName: 'Harry Potter', previewImageUrl: null, cardImageUrls: [] },
            ];
           
            return res.json({
                success: true,
                data: defaultThemes
            });
        }
       
        res.json({
            success: true,
            data: themes
        });
    } catch (error) {
        console.error('Error fetching themes:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
 
// Get theme by ID or name
router.get('/:themeId', async (req, res) => {
    try {
        const { themeId } = req.params;
       
        const themeDoc = await db.collection('themes').doc(themeId).get();
       
        if (!themeDoc.exists) {
            return res.status(404).json({
                success: false,
                error: 'Theme not found'
            });
        }
       
        const data = themeDoc.data();
        res.json({
            success: true,
            data: {
                id: themeDoc.id,
                displayName: data.displayName || themeDoc.id,
                previewImageUrl: data.previewImageUrl || null,
                cardImageUrls: data.cardImageUrls || [],
                ...data
            }
        });
    } catch (error) {
        console.error('Error fetching theme:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
 
// Create or update theme (admin endpoint)
router.post('/', async (req, res) => {
    try {
        const { id, displayName, previewImageUrl, cardImageUrls } = req.body;
       
        if (!id || !displayName) {
            return res.status(400).json({
                success: false,
                error: 'Theme id and displayName are required'
            });
        }
       
        const themeData = {
            displayName,
            previewImageUrl: previewImageUrl || null,
            cardImageUrls: cardImageUrls || [],
            updatedAt: new Date().toISOString()
        };
       
        await db.collection('themes').doc(id).set(themeData, { merge: true });
       
        console.log(`✅ Theme ${id} created/updated`);
       
        res.json({
            success: true,
            message: 'Theme saved successfully',
            data: { id, ...themeData }
        });
    } catch (error) {
        console.error('Error saving theme:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
 
// Delete theme (admin endpoint)
router.delete('/:themeId', async (req, res) => {
    try {
        const { themeId } = req.params;
       
        await db.collection('themes').doc(themeId).delete();
       
        console.log(`✅ Theme ${themeId} deleted`);
       
        res.json({
            success: true,
            message: 'Theme deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting theme:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
 
module.exports = router;
 