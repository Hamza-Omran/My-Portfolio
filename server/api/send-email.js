/**
 * POST /api/send-email
 * Send contact form email via Resend
 */
export default async function handler(req, res) {
    // Set CORS headers
    const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
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
                error: 'All fields (name, email, message) are required',
            });
        }

        const RESEND_API_KEY = process.env.RESEND_API_KEY;

        if (!RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is not configured');
        }

        // Send notification to you
        const notificationResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Portfolio Contact <onboarding@resend.dev>',
                to: 'hamza.hussain.omran@gmail.com',
                subject: `Portfolio Contact: ${name}`,
                html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, '<br>')}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">This email was sent from your portfolio contact form.</p>
        `,
            }),
        });

        if (!notificationResponse.ok) {
            const error = await notificationResponse.json();
            throw new Error(`Failed to send notification: ${JSON.stringify(error)}`);
        }

        // Send auto-reply to the sender
        const autoReplyResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: 'Hamza Hussain <onboarding@resend.dev>',
                to: email,
                subject: 'Thank you for contacting me!',
                html: `
          <h2>Hi ${name},</h2>
          <p>Thank you for reaching out through my portfolio! I've received your message and will get back to you as soon as possible.</p>
          <p>Best regards,<br>Hamza Hussain Omran</p>
        `,
            }),
        });

        if (!autoReplyResponse.ok) {
            console.warn('Auto-reply failed, but notification was sent');
        }

        res.json({
            success: true,
            message: "Email sent successfully! You'll receive a confirmation shortly.",
        });
    } catch (error) {
        console.error('Email sending error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to send email',
        });
    }
}
