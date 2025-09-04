const fs = require('fs').promises;
const path = require('path');

const CONFIG_FILE = path.join(__dirname, '../../data/config.json');
const DEFAULT_CONFIG = {
    monthlyServerCost: 25.00,
    lastBalanceCheck: null,
    alertsSent: []
};

let currentConfig = null;

async function ensureDataDirectory() {
    const dataDir = path.dirname(CONFIG_FILE);
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

async function loadConfig() {
    try {
        await ensureDataDirectory();
        const data = await fs.readFile(CONFIG_FILE, 'utf8');
        currentConfig = { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    } catch (error) {
        console.log('No existing config found, creating default...');
        currentConfig = { ...DEFAULT_CONFIG };
        await saveConfig(currentConfig);
    }
    return currentConfig;
}

async function saveConfig(config) {
    try {
        await ensureDataDirectory();
        await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
        currentConfig = config;
    } catch (error) {
        console.error('Error saving config:', error);
        throw error;
    }
}

function getConfig() {
    if (!currentConfig) {
        throw new Error('Config not loaded. Call loadConfig() first.');
    }
    return currentConfig;
}

module.exports = {
    loadConfig,
    saveConfig,
    getConfig
};