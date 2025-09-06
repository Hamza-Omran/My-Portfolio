import express from "express";
import cors from "cors";
import { google } from "googleapis";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// CORS configuration for production and development
const allowedOrigins = [
  "http://localhost:5173", // Vite dev server
  "http://localhost:3000", // Alternative dev server
  process.env.FRONTEND_URL, // Production frontend URL (Vercel)
].filter(Boolean); // Remove undefined values

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Gmail OAuth2 configuration for hamza770440@gmail.com (sender account)
const senderOAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID?.replace(/"/g, ''),
  process.env.GMAIL_CLIENT_SECRET?.replace(/"/g, ''),
  process.env.GMAIL_REDIRECT_URI?.replace(/"/g, '') || "https://my-portfolio-production-d67a.up.railway.app/"
);

// Set credentials for sender account (hamza770440@gmail.com)
senderOAuth2Client.setCredentials({
  access_token: process.env.GMAIL_ACCESS_TOKEN?.replace(/"/g, ''),
  refresh_token: process.env.GMAIL_REFRESH_TOKEN?.replace(/"/g, '')
});

console.log('🔧 Gmail Config Debug:');
console.log('- Client ID:', process.env.GMAIL_CLIENT_ID ? 'Set' : 'Missing');
console.log('- Client Secret:', process.env.GMAIL_CLIENT_SECRET ? 'Set' : 'Missing');
console.log('- Access Token:', process.env.GMAIL_ACCESS_TOKEN ? 'Set' : 'Missing');
console.log('- Refresh Token:', process.env.GMAIL_REFRESH_TOKEN ? 'Set' : 'Missing');
console.log('- Redirect URI:', process.env.GMAIL_REDIRECT_URI || 'Using default');

// Gmail OAuth2 configuration for hamza.hussain.omran@gmail.com (auto-reply account)
const autoReplyOAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID?.replace(/"/g, ''),
  process.env.GMAIL_CLIENT_SECRET?.replace(/"/g, ''),
  process.env.GMAIL_REDIRECT_URI?.replace(/"/g, '') || "https://my-portfolio-production-d67a.up.railway.app/"
);

// Set credentials for auto-reply account (hamza.hussain.omran@gmail.com)
autoReplyOAuth2Client.setCredentials({
  access_token: process.env.GMAIL_SECONDARY_ACCESS_TOKEN?.replace(/"/g, ''),
  refresh_token: process.env.GMAIL_SECONDARY_REFRESH_TOKEN?.replace(/"/g, '')
});

// Test Gmail configuration on startup
async function testGmailConfig() {
  try {
    const gmail = google.gmail({ version: "v1", auth: senderOAuth2Client });
    const profile = await gmail.users.getProfile({ userId: "me" });
    console.log(`✅ Gmail connected successfully: ${profile.data.emailAddress}`);
  } catch (error) {
    console.error("❌ Gmail configuration error:", error.message);
  }
}

// Call test function on startup
testGmailConfig();

// Email sending endpoint
app.post("/send-email", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        error: "All fields (name, email, message) are required" 
      });
    }

    // Create Gmail API instance
    const gmail = google.gmail({ version: "v1", auth: senderOAuth2Client });

    // Email content for main notification
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

    // Send main notification email
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage
      }
    });

    // Send auto-reply email using secondary account
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

    // Send auto-reply
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
});

// Root route (Railway health check)
app.get("/", (req, res) => {
  res.json({ 
    status: "Portfolio Backend API", 
    timestamp: new Date().toISOString(),
    gmail: "configured",
    endpoints: ["/send-email", "/health"]
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "Server is running", 
    timestamp: new Date().toISOString(),
    gmail: "configured"
  });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Email server running at http://localhost:${PORT}`);
  console.log(`📧 Ready to send emails from hamza770440@gmail.com`);
  console.log(`🎯 Target recipient: hamza.hussain.omran@gmail.com`);
  console.log(`🌐 Railway deployment ready`);
});

export default app;
