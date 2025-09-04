const { getAccountBalance } = require('../services/paypal');
const { createProgressEmbed } = require('../utils/embed');
const { getConfig } = require('../utils/storage');

module.exports = {
    name: 'progress',
    description: 'Show funding progress towards next month',

    async execute(message, args) {
        try {
            const balance = await getAccountBalance();
            const config = getConfig();
            const monthlyCost = config.monthlyServerCost;

            const embed = createProgressEmbed(balance, monthlyCost);
            await message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Progress command error:', error);
            message.channel.send('❌ Une erreur est survenue. Veuillez réessayer plus tard.');
        }
    }
};