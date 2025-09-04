const { exec } = require('child_process');
const path = require('path');

console.log('🚀 Starting Discord PayPal Bot...');

// Change to project directory
process.chdir(path.join(__dirname, '..'));

// Start the bot
const child = exec('yarn start', (error, stdout, stderr) => {
    if (error) {
        console.error('❌ Error starting bot:', error);
        return;
    }
});

child.stdout.on('data', (data) => {
    console.log(data);
});

child.stderr.on('data', (data) => {
    console.error(data);
});

child.on('close', (code) => {
    console.log(`Bot process exited with code ${code}`);
});