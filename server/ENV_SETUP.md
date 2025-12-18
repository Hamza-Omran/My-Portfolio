# Portfolio Backend - Environment Variables Configuration

Copy this file to `.env` in the `server/` directory and fill in your values.

## Database Configuration (Supabase PostgreSQL)

```bash
# Get these from Supabase Dashboard → Project Settings → Database
DATABASE_URL=postgresql://postgres.[your-project-ref]:[your-password]@aws-0-[region].pooler.supabase.com:5432/postgres

# Alternative Supabase connection strings (optional)
POSTGRES_URL=your_supabase_pooler_url
POSTGRES_PRISMA_URL=your_supabase_prisma_url
POSTGRES_URL_NON_POOLING=your_supabase_direct_url
```

## GitHub Configuration

```bash
# Personal Access Token (for API access)
# Create at: https://github.com/settings/tokens
# Required scopes: repo, read:user
GITHUB_TOKEN=ghp_your_personal_access_token_here

# Your GitHub username
GITHUB_USERNAME=Hamza-Omran

# Webhook Secret (for signature verification)
# Generate a random string: openssl rand -hex 32
GITHUB_WEBHOOK_SECRET=your_random_webhook_secret_here
```

## Gmail API Configuration (Email Functionality)

```bash
# Get these from Google Cloud Console
# Guide: https://developers.google.com/gmail/api/quickstart/nodejs
GMAIL_CLIENT_ID=your_google_oauth_client_id
GMAIL_CLIENT_SECRET=your_google_oauth_client_secret
GMAIL_REDIRECT_URI=https://your-portfolio.vercel.app

# Access tokens (from OAuth flow)
GMAIL_ACCESS_TOKEN=your_access_token
GMAIL_REFRESH_TOKEN=your_refresh_token

# Secondary account for auto-replies
GMAIL_SECONDARY_ACCESS_TOKEN=your_secondary_access_token
GMAIL_SECONDARY_REFRESH_TOKEN=your_secondary_refresh_token
```

## Frontend Configuration

```bash
# Frontend URL (for CORS)
FRONTEND_URL=https://your-portfolio.vercel.app
```

## Optional Configuration

```bash
# Secret for manual sync endpoint (optional)
SYNC_SECRET=your_optional_sync_secret

# Node environment
NODE_ENV=production
```

---

## Setup Instructions

### 1. Supabase Database Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → Database**
3. Copy the **Connection String** (Transaction pooler recommended)
4. Navigate to **SQL Editor**
5. Run the schema from `server/database/schema.sql`

### 2. GitHub Configuration

#### Personal Access Token
1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click **Generate new token** → **Generate new token (classic)**
3. Select scopes: `repo`, `read:user`
4. Copy the token and set as `GITHUB_TOKEN`

#### Webhook Setup (After Deployment)
1. Deploy your backend to Vercel first
2. Go to [GitHub Settings → Webhooks](https://github.com/settings/webhooks)
3. Click **Add webhook**
4. Set **Payload URL**: `https://your-backend.vercel.app/api/webhook`
5. Set **Content type**: `application/json`
6. Set **Secret**: Use the same value as `GITHUB_WEBHOOK_SECRET`
7. Select events:
   - ☑️ Push
   - ☑️ Repository
   - ☑️ Release
8. Click **Add webhook**

### 3. Gmail API Setup

Follow the [Gmail API Node.js Quickstart](https://developers.google.com/gmail/api/quickstart/nodejs) to:
1. Enable Gmail API in Google Cloud Console
2. Create OAuth 2.0 credentials
3. Run the OAuth flow to get access and refresh tokens

### 4. Vercel Deployment

#### Backend
```bash
cd server
vercel
```

#### Environment Variables
Add all the above environment variables to your Vercel project:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable from above

#### Frontend
Update `VITE_BACKEND_URL` in your frontend:
```bash
VITE_BACKEND_URL=https://your-backend.vercel.app/api
```

---

## Testing Locally

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Create `.env` file
Copy this template and fill in your values.

### 3. Test Database Connection
```bash
node -e "import('./lib/db.js').then(db => db.query('SELECT NOW()')).then(() => console.log('✅ Database connected'))"
```

### 4. Run with Vercel Dev
```bash
npm run dev
```

### 5. Test Endpoints
```bash
# Get repositories
curl http://localhost:3000/api/repositories

# Trigger sync (first 5 repos)
curl -X POST http://localhost:3000/api/sync-repos

# Test webhook (requires ngrok for GitHub delivery)
```

---

## Initial Data Population

After deploying, populate your database:

```bash
# Sync first batch (5 repos)
curl -X POST https://your-backend.vercel.app/api/sync-repos

# If you have more repos, call again with offset
curl -X POST "https://your-backend.vercel.app/api/sync-repos?batch_size=5&offset=5"

# Continue until all repos are synced
```

Or use the frontend to trigger sync programmatically.

---

## Monitoring

### View Sync Logs
Connect to your Supabase database and query:
```sql
SELECT * FROM sync_logs ORDER BY started_at DESC LIMIT 10;
```

### Check Vercel Logs
```bash
vercel logs
```

### GitHub Webhook Deliveries
Go to [GitHub Settings → Webhooks](https://github.com/settings/webhooks) and click on your webhook to see recent deliveries.
