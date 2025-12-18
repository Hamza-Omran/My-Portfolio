import { google } from "googleapis";

const senderOAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID?.replace(/"/g, ''),
    process.env.GMAIL_CLIENT_SECRET?.replace(/"/g, ''),
    process.env.GMAIL_REDIRECT_URI?.replace(/"/g, '')
);

senderOAuth2Client.setCredentials({
    access_token: process.env.GMAIL_ACCESS_TOKEN?.replace(/"/g, ''),
    refresh_token: process.env.GMAIL_REFRESH_TOKEN?.replace(/"/g, '')
});

const autoReplyOAuth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID?.replace(/"/g, ''),
    process.env.GMAIL_CLIENT_SECRET?.replace(/"/g, ''),
    process.env.GMAIL_REDIRECT_URI?.replace(/"/g, '')
);

autoReplyOAuth2Client.setCredentials({
    access_token: process.env.GMAIL_SECONDARY_ACCESS_TOKEN?.replace(/"/g, ''),
    refresh_token: process.env.GMAIL_SECONDARY_REFRESH_TOKEN?.replace(/"/g, '')
});

/**
 * POST /api/send-email
 * Send contact form email via Gmail API
 */
export default async function handler(req, res) {
    // Set CORS headers
    const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        process.env.FRONTEND_URL,
    ].filter(Boolean);

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, message } = req.body;

        // Validate input
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                error: "All fields (name, email, message) are required"
            });
        }

        const gmail = google.gmail({ version: "v1", auth: senderOAuth2Client });

        const emailLines = [
            `From: ${name}`,
            `Email: ${email}`,
            `Message: ${message}`,
            '',
            '---',
            'This email was sent from your portfolio contact form.'
        ];

        const emailContent = [
            'Content-Type: text/plain; charset="UTF-8"',
            'MIME-Version: 1.0',
            `To: hamza.hussain.omran@gmail.com`,
            `From: hamza770440@gmail.com`,
            `Subject: Portfolio Contact: ${name}`,
            '',
            emailLines.join('\n')
        ].join('\n');

        const encodedMessage = Buffer.from(emailContent)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage
            }
        });

        const autoReplyGmail = google.gmail({ version: "v1", auth: autoReplyOAuth2Client });

        const autoReplyContent = [
            'Content-Type: text/plain; charset="UTF-8"',
            'MIME-Version: 1.0',
            `To: ${email}`,
            `From: hamza.hussain.omran@gmail.com`,
            `Subject: Thank you for contacting me!`,
            '',
            `Hi ${name},\n\nThank you for reaching out through my portfolio! I've received your message and will get back to you as soon as possible.\n\nBest regards,\nHamza Hussain Omran`
        ].join('\n');

        const encodedAutoReply = Buffer.from(autoReplyContent)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

        await autoReplyGmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedAutoReply
            }
        });

        res.json({
            success: true,
            message: "Email sent successfully! You'll receive a confirmation shortly."
        });

    } catch (error) {
        console.error("Email sending error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to send email"
        });
    }
}
