require('dotenv').config();
const express = require('express');
const { startBot } = require('./bot');
const { startMonitoring } = require('./jobs/monitor');
const { loadConfig } = require('./utils/storage');

// Create Express app for Render web service requirement
const app = express();
const port = process.env.PORT || 10000;

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Discord PayPal Bot',
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

async function main() {
    try {
        // Load configuration
        await loadConfig();

        // Start Discord bot
        await startBot();

        // Start monitoring job
        startMonitoring();

        // Start web server for Render compatibility
        app.listen(port, '0.0.0.0', () => {
            console.log(`🌐 Web server listening on port ${port}`);
        });

        console.log('🚀 Discord PayPal Bot is running!');
    } catch (error) {
        console.error('❌ Failed to start bot:', error);
        process.exit(1);
    }
}

main();