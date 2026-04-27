import dotenv from 'dotenv';
dotenv.config();

export const config = {
    twilio: {
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: process.env.TWILIO_PHONE_NUMBER
    },
    sendgrid: {
        apiKey: process.env.SENDGRID_API_KEY
    },
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY
    },
    slack: {
        botToken: process.env.SLACK_BOT_TOKEN
    },
    teams: {
        webhookUrl: process.env.TEAMS_WEBHOOK_URL
    },
    vonage: {
        apiKey: process.env.VONAGE_API_KEY,
        apiSecret: process.env.VONAGE_API_SECRET
    },
    aws: {
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY
    },
    mqtt: {
        url: process.env.MQTT_URL || 'mqtt://localhost:1883'
    }
};

export function isChannelConfigured(channel: keyof typeof config): boolean {
    const channelConfig = config[channel];
    return Object.values(channelConfig).every(val => val !== undefined && val !== '');
}
