const { saveConfig, getConfig } = require('../utils/storage');

module.exports = {
    name: 'setcost',
    description: 'Set monthly server cost (admin only)',

    async execute(message, args) {
        // Check if user is admin
        if (message.author.id !== process.env.ADMIN_USER_ID) {
            return message.channel.send('❌ Vous n\'avez pas la permission d\'utiliser cette commande.');
        }

        const cost = parseFloat(args[0]);
        if (isNaN(cost) || cost <= 0) {
            return message.channel.send('❌ Veuillez fournir un montant valide. Exemple: `!setcost 25.00`');
        }

        try {
            const config = getConfig();
            config.monthlyServerCost = cost;
            await saveConfig(config);

            message.channel.send(`✅ Le coût mensuel du serveur a été défini à ${cost.toFixed(2)}€`);

        } catch (error) {
            console.error('Set cost command error:', error);
            message.channel.send('❌ Une erreur est survenue lors de la sauvegarde de la configuration.');
        }
    }
};