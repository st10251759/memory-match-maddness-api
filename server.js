const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
 
// Import routes
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const gameRoutes = require('./src/routes/gameRoutes');
const achievementRoutes = require('./src/routes/achievementRoutes');
const themeRoutes = require('./src/routes/themeRoutes');
const multiplayerRoutes = require('./src/routes/multiplayerRoutes');
 
const app = express();
const PORT = process.env.PORT || 3000;
 
// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
 
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
 
// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
 
// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/multiplayer', multiplayerRoutes);
 
// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Memory Match Madness API',
        version: '2.0.0',
        status: 'running',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            games: '/api/games',
            achievements: '/api/achievements',
            themes: '/api/themes',
            multiplayer: '/api/multiplayer',
            health: '/api/health'
        }
    });
});
 
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});
 
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path,
        method: req.method
    });
});
 
// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Something went wrong!'
    });
});
 
// Start server
const server = app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 Memory Match Madness API v2.0');
    console.log('='.repeat(50));
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🕐 Started: ${new Date().toISOString()}`);
    console.log('='.repeat(50));
});
 
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM: Closing server');
    server.close(() => process.exit(0));
});
 
process.on('SIGINT', () => {
    console.log('SIGINT: Closing server');
    server.close(() => process.exit(0));
});
 
module.exports = server;
 
 