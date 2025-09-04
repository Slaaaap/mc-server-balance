const { EmbedBuilder } = require('discord.js');

function createBalanceEmbed(balance, monthlyCost) {
    const monthsLeft = Math.floor(balance / monthlyCost);
    const daysLeft = Math.floor((balance % monthlyCost) / (monthlyCost / 30));
    const isFunded = balance >= monthlyCost;

    return new EmbedBuilder()
        .setTitle('💰 Statut des fonds')
        .setColor(isFunded ? '#00ff00' : '#ff0000')
        .addFields([
            { name: 'Nous avons', value: `${balance.toFixed(2)}€`, inline: true },
            { name: 'Le serveur nous coûte', value: `${monthlyCost.toFixed(2)}€`, inline: true },
            { name: 'Statut', value: isFunded ? '✅ Ok pour le mois prochain' : '❌ Besoin de fonds !', inline: false },
            { name: 'Temps de couverture', value: `${monthsLeft} mois, ${daysLeft} jours`, inline: true },
            { name: 'Prochain paiement', value: getNextPaymentDate(), inline: true }
        ])
        .setTimestamp()
        .setFooter({ text: 'Dernière mise à jour' });
}

function createProgressEmbed(balance, monthlyCost) {
    const percentage = Math.min((balance / monthlyCost) * 100, 100);
    const progressBar = createProgressBar(percentage);
    const needed = Math.max(0, monthlyCost - balance);

    return new EmbedBuilder()
        .setTitle('📊 Progression des fonds')
        .setDescription(`\`\`\`${progressBar}\`\`\``)
        .addFields([
            { name: 'Progression', value: `${percentage.toFixed(1)}%`, inline: true },
            { name: 'Nous avons', value: `${balance.toFixed(2)}€`, inline: true },
            { name: 'Le serveur nous coûte', value: `${monthlyCost.toFixed(2)}€`, inline: true }
        ])
        .addFields([
            { name: 'Il nous faut encore', value: needed > 0 ? `${needed.toFixed(2)}€` : 'Fonds suffisants! 🎉', inline: false }
        ])
        .setColor(percentage >= 100 ? '#00ff00' : percentage >= 50 ? '#ffaa00' : '#ff4444')
        .setTimestamp();
}

function createLowBalanceEmbed(balance, monthlyCost) {
    const needed = monthlyCost - balance;

    return new EmbedBuilder()
        .setTitle('🚨 Alerte de fonds insuffisants !')
        .setDescription(`Nous avons besoin de **${needed.toFixed(2)}€** de plus pour le prochain paiement du serveur.`)
        .addFields([
            { name: 'Nous avons', value: `${balance.toFixed(2)}€`, inline: true },
            { name: 'Le serveur nous coûte', value: `${monthlyCost.toFixed(2)}€`, inline: true },
            { name: 'Il nous faut encore', value: `${needed.toFixed(2)}€`, inline: true }
        ])
        .setColor('#ff4444')
        .setTimestamp();
}

function createProgressBar(percentage, length = 20) {
    const filledLength = Math.floor((percentage / 100) * length);
    const emptyLength = length - filledLength;
    return '█'.repeat(filledLength) + '░'.repeat(emptyLength) + ` ${percentage.toFixed(1)}%`;
}

function getNextPaymentDate() {
    const now = new Date();
    const currentMonth11th = new Date(now.getFullYear(), now.getMonth(), 11);

    // If we're before the 11th of this month, use this month's 11th
    // Otherwise, use next month's 11th
    const targetDate = now.getDate() < 11
        ? currentMonth11th
        : new Date(now.getFullYear(), now.getMonth() + 1, 11);

    return targetDate.toLocaleDateString('fr-FR', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
}

module.exports = {
    createBalanceEmbed,
    createProgressEmbed,
    createLowBalanceEmbed
};