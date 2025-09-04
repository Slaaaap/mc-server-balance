// Import fetch from node-fetch (for Node.js < 18 or when fetch is not global)
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const PAYPAL_CONFIG = {
    clientId: process.env.PAYPAL_CLIENT_ID,
    clientSecret: process.env.PAYPAL_CLIENT_SECRET,
    baseUrl: process.env.PAYPAL_MODE === 'live'
        ? 'https://api.paypal.com'
        : 'https://api.sandbox.paypal.com'
};

let accessToken = null;
let tokenExpiry = null;

async function getAccessToken() {
    // Check if token is still valid
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken;
    }

    try {
        const response = await fetch(`${PAYPAL_CONFIG.baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Accept-Language': 'en_US',
                'Authorization': `Basic ${Buffer.from(`${PAYPAL_CONFIG.clientId}:${PAYPAL_CONFIG.clientSecret}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('PayPal Auth Error Details:', data);
            throw new Error(`PayPal Auth Error: ${data.error_description || data.error}`);
        }

        console.log('PayPal Authentication successful');
        accessToken = data.access_token;
        tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 minute buffer

        return accessToken;
    } catch (error) {
        console.error('PayPal authentication error:', error);
        throw error;
    }
}

async function getAccountBalance() {
    try {
        console.log('PayPal Configuration:');
        console.log('- Base URL:', PAYPAL_CONFIG.baseUrl);
        console.log('- Client ID exists:', !!PAYPAL_CONFIG.clientId);
        console.log('- Client Secret exists:', !!PAYPAL_CONFIG.clientSecret);
        console.log('- Mode:', process.env.PAYPAL_MODE || 'not set');

        const token = await getAccessToken();

        const response = await fetch(`${PAYPAL_CONFIG.baseUrl}/v1/reporting/balances`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        const data = await response.json();
        console.log('PayPal Balance Response:', JSON.stringify(data, null, 2));
        console.log('Response Status:', response.status);

        if (!response.ok) {
            console.error('PayPal API Error Details:', data);
            throw new Error(`PayPal API Error: ${data.message || 'Unknown error'}`);
        }

        // Get primary balance (usually USD)
        const primaryBalance = data.balances?.find(balance => balance.primary) || data.balances?.[0];

        if (!primaryBalance) {
            throw new Error('No balance information found');
        }

        return parseFloat(primaryBalance.total_balance.value);

    } catch (error) {
        console.error('PayPal balance fetch error:', error);
        throw error;
    }
}

module.exports = {
    getAccountBalance
};