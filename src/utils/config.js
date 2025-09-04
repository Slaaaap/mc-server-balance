const config = {
    bot: {
        prefix: process.env.BOT_PREFIX || '!',
        adminUserId: process.env.ADMIN_USER_ID,
        notificationChannelId: process.env.NOTIFICATION_CHANNEL_ID
    },
    paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        mode: process.env.PAYPAL_MODE || 'sandbox'
    },
    monitoring: {
        checkInterval: 60 * 60 * 1000, // 1 hour
        lowBalanceThreshold: 0.8 // 80% of monthly cost
    }
};

module.exports = config;