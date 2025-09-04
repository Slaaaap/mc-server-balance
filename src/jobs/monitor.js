const cron = require('node-cron');
const { getAccountBalance } = require('../services/paypal');
const { createLowBalanceEmbed } = require('../utils/embed');
const { getConfig, saveConfig } = require('../utils/storage');
const { client } = require('../bot');

let isMonitoring = false;

function startMonitoring() {
    if (isMonitoring) return;

    // Check balance every hour
    cron.schedule('0 * * * *', async () => {
        try {
            await checkBalance();
        } catch (error) {
            console.error('Monitoring error:', error);
        }
    });

    isMonitoring = true;
    console.log('📊 Balance monitoring started (checks every hour)');
}

async function checkBalance() {
    try {
        const balance = await getAccountBalance();
        const config = getConfig();
        const monthlyCost = config.monthlyServerCost;
        const threshold = monthlyCost * 0.8; // 80% threshold

        // Update last check time
        config.lastBalanceCheck = new Date().toISOString();
        await saveConfig(config);

        // Check if balance is low and we haven't sent an alert recently
        if (balance < threshold) {
            const now = Date.now();
            const lastAlert = config.alertsSent?.[0] || 0;
            const alertCooldown = 24 * 60 * 60 * 1000; // 24 hours

            if (now - lastAlert > alertCooldown) {
                await sendLowBalanceAlert(balance, monthlyCost);

                // Update alerts history
                config.alertsSent = [now, ...(config.alertsSent || []).slice(0, 4)]; // Keep last 5
                await saveConfig(config);
            }
        }

        console.log(`💰 Balance check: ${balance.toFixed(2)}€ (${balance >= monthlyCost ? 'OK' : 'LOW'})`);

    } catch (error) {
        console.error('Balance check failed:', error);
    }
}

async function sendLowBalanceAlert(balance, monthlyCost) {
    try {
        const channelId = process.env.NOTIFICATION_CHANNEL_ID;
        if (!channelId) {
            console.warn('No notification channel configured');
            return;
        }

        const channel = client.channels.cache.get(channelId);
        if (!channel) {
            console.warn('Notification channel not found');
            return;
        }

        const embed = createLowBalanceEmbed(balance, monthlyCost);
        await channel.send({ embeds: [embed] });

        console.log('🚨 Low balance alert sent');

    } catch (error) {
        console.error('Error sending low balance alert:', error);
    }
}

module.exports = {
    startMonitoring,
    checkBalance
};