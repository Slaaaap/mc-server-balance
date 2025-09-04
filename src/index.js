require('dotenv').config();
const { startBot } = require('./bot');
const { startMonitoring } = require('./jobs/monitor');
const { loadConfig } = require('./utils/storage');

async function main() {
    try {
        // Load configuration
        await loadConfig();

        // Start Discord bot
        await startBot();

        // Start monitoring job
        startMonitoring();

        console.log('🚀 Discord PayPal Bot is running!');
    } catch (error) {
        console.error('❌ Failed to start bot:', error);
        process.exit(1);
    }
}

main();