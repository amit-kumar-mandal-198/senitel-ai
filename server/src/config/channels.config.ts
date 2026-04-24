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
    }
};

export function isChannelConfigured(channel: keyof typeof config): boolean {
    const channelConfig = config[channel];
    return Object.values(channelConfig).every(val => val !== undefined && val !== '');
}
