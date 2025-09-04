const { getAccountBalance } = require('../services/paypal');
const { createBalanceEmbed } = require('../utils/embed');
const { getConfig } = require('../utils/storage');

module.exports = {
    name: 'balance',
    description: 'Check current PayPal balance and funding status',

    async execute(message, args) {
        try {
            const balance = await getAccountBalance();
            const config = getConfig();
            const monthlyCost = config.monthlyServerCost;

            const embed = createBalanceEmbed(balance, monthlyCost);
            await message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Balance command error:', error);
            message.channel.send('❌ Une erreur est survenue. Veuillez réessayer plus tard.');
        }
    }
};