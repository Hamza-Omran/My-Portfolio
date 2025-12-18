# Portfolio Migration - Deployment Guide

This guide will walk you through deploying your refactored portfolio with Vercel backend and PostgreSQL database.

## 📋 Prerequisites

- [Vercel Account](https://vercel.com/signup)
- [Supabase Account](https://supabase.com)
- [GitHub Account](https://github.com) (you already have this!)
- GitHub Personal Access Token
- Gmail API credentials (you already have these)

---

## 🗄️ Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose organization, name your project (e.g., "portfolio-db")
4. Set a strong database password (**SAVE THIS!**)
5. Select region (closest to your users)
6. Click **Create new project** (takes ~2 minutes)

### 1.2 Run Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `server/database/schema.sql`
4. Paste into the SQL Editor
5. Click **Run** or press `Ctrl+Enter`
6. Verify success: Check for "Success. No rows returned" message

### 1.3 Get Connection String
1. Go to **Project Settings** → **Database**
2. Scroll to **Connection string**
3. Select **URI** (Transaction mode recommended)
4. Click **Copy** next to the connection string
5. **Important**: Replace `[YOUR-PASSWORD]` with your actual database password
6. Save this for later as `DATABASE_URL`

---

## 🔑 Step 2: Configure GitHub

### 2.1 Create Personal Access Token
1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click **Generate new token** → **Generate new token (classic)**
3. Name: "Portfolio Backend API"
4. Expiration: Choose duration (recommend: No expiration or 1 year)
5. Select scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `read:user` (Read user profile data)
6. Click **Generate token**
7. **Copy the token immediately** (you won't see it again!)
8. Save as `GITHUB_TOKEN`

### 2.2 Generate Webhook Secret
Open your terminal and run:
```bash
openssl rand -hex 32
```
Copy the output and save as `GITHUB_WEBHOOK_SECRET`

---

## 🚀 Step 3: Deploy Backend to Vercel

### 3.1 Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

### 3.2 Link Project
```bash
cd server
vercel
```

Follow prompts:
- **Set up and deploy?**: Yes
- **Which scope?**: Select your account
- **Link to existing project?**: No
- **Project name**: `portfolio-backend` (or your choice)
- **Directory containing code**: `./` (current directory)
- **Override settings?**: No

This creates a preview deployment.

### 3.3 Add Environment Variables

#### Via Vercel Dashboard (Recommended)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your `portfolio-backend` project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

**Database:**
```
DATABASE_URL = your_supabase_connection_string
```

**GitHub:**
```
GITHUB_TOKEN = ghp_your_token_here
GITHUB_USERNAME = Hamza-Omran
GITHUB_WEBHOOK_SECRET = your_webhook_secret
```

**Gmail:**
```
GMAIL_CLIENT_ID = your_client_id
GMAIL_CLIENT_SECRET = your_client_secret
GMAIL_ACCESS_TOKEN = your_access_token
GMAIL_REFRESH_TOKEN = your_refresh_token
GMAIL_SECONDARY_ACCESS_TOKEN = your_secondary_access_token
GMAIL_SECONDARY_REFRESH_TOKEN = your_secondary_refresh_token
GMAIL_REDIRECT_URI = https://your-portfolio.vercel.app
```

**Frontend URL** (update after frontend deployment):
```
FRONTEND_URL = https://your-portfolio.vercel.app
```

**Optional:**
```
NODE_ENV = production
```

#### Via Vercel CLI
```bash
vercel env add DATABASE_URL production
# Paste your value when prompted
# Repeat for each variable
```

### 3.4 Deploy to Production
```bash
vercel --prod
```

Copy the production URL (e.g., `https://portfolio-backend.vercel.app`)

---

## 🌐 Step 4: Deploy Frontend to Vercel

### 4.1 Update Frontend Environment Variable

Create/update `portfolio-app/.env`:
```bash
VITE_BACKEND_URL=https://your-backend-url.vercel.app/api
```

### 4.2 Deploy Frontend
```bash
cd ../portfolio-app
vercel
```

Follow prompts similar to backend deployment.

### 4.3 Add Environment Variable
In Vercel Dashboard → Frontend Project → Settings → Environment Variables:
```
VITE_BACKEND_URL = https://your-backend-url.vercel.app/api
```

### 4.4 Deploy to Production
```bash
vercel --prod
```

Copy the production URL (e.g., `https://hamza-omran.vercel.app`)

### 4.5 Update Backend FRONTEND_URL
Go back to backend project settings and update:
```
FRONTEND_URL = https://your-frontend-url.vercel.app
```

Then redeploy backend:
```bash
cd ../server
vercel --prod
```

---

## 🪝 Step 5: Configure GitHub Webhook

### 5.1 Add Webhook
1. Go to [GitHub Settings → Webhooks](https://github.com/settings/webhooks)
2. Click **Add webhook**

### 5.2 Configure Webhook
- **Payload URL**: `https://your-backend-url.vercel.app/api/webhook`
- **Content type**: `application/json`
- **Secret**: Paste your `GITHUB_WEBHOOK_SECRET`
- **SSL verification**: Enable SSL verification
- **Which events**: Select individual events
  - ✅ Pushes
  - ✅ Repositories
  - ✅ Releases
- **Active**: ✅ Checked
- Click **Add webhook**

### 5.3 Verify Webhook
1. After adding, you'll see a **Recent Deliveries** section
2. Click on the webhook to see details
3. GitHub will send a `ping` event
4. Check **Response** - should see `200 OK` with message "Pong! Webhook is configured correctly."

If you see an error:
- Check your backend URL is correct
- Verify webhook secret matches
- Check Vercel logs: `vercel logs`

---

## 📊 Step 6: Populate Database (Initial Sync)

Now that everything is deployed, populate your database with repository data.

### 6.1 Trigger Initial Sync

**Option A: Using curl**
```bash
# Sync first 5 repos
curl -X POST "https://your-backend-url.vercel.app/api/sync-repos"

# If you have more repos, sync next batch
curl -X POST "https://your-backend-url.vercel.app/api/sync-repos?batch_size=5&offset=5"

# Continue until all repos are synced
curl -X POST "https://your-backend-url.vercel.app/api/sync-repos?batch_size=5&offset=10"
```

**Option B: Using browser console**
```javascript
// Open your frontend in browser, open DevTools Console, and run:
fetch('https://your-backend-url.vercel.app/api/sync-repos', {
  method: 'POST'
})
.then(r => r.json())
.then(data => console.log(data));
```

**Option C: Automated script**
Create a file `sync-all.sh`:
```bash
#!/bin/bash
BACKEND_URL="https://your-backend-url.vercel.app/api/sync-repos"
BATCH_SIZE=5
OFFSET=0
HAS_MORE=true

while [ "$HAS_MORE" = "true" ]; do
  echo "Syncing batch at offset $OFFSET..."
  RESPONSE=$(curl -s -X POST "${BACKEND_URL}?batch_size=${BATCH_SIZE}&offset=${OFFSET}")
  
  echo "$RESPONSE"
  
  HAS_MORE=$(echo "$RESPONSE" | grep -o '"hasMore":true' || echo "false")
  OFFSET=$((OFFSET + BATCH_SIZE))
  
  # Wait 2 seconds between batches
  sleep 2
done

echo "✅ All repositories synced!"
```

Run:
```bash
chmod +x sync-all.sh
./sync-all.sh
```

### 6.2 Verify Data
1. Go to Supabase Dashboard → **Table Editor**
2. Select `repositories` table
3. You should see your repositories!

---

## ✅ Step 7: Testing

### 7.1 Test Frontend
1. Visit your frontend URL
2. Navigate to the **Projects** section
3. Projects should load **instantly** (no GitHub API rate limits!)
4. Check browser DevTools → Network tab
   - Should see request to `/api/repositories`
   - Should NOT see requests to `api.github.com`

### 7.2 Test Webhook
1. Make a change to any of your GitHub repositories (e.g., update README)
2. Push the changes
3. Wait ~5 seconds
4. Refresh your portfolio - the project should update!

**Verify webhook delivery:**
- Go to [GitHub Settings → Webhooks](https://github.com/settings/webhooks)
- Click your webhook
- Check **Recent Deliveries**
- Should see successful `push` event

### 7.3 Test Email
1. Go to Contact section on your portfolio
2. Fill out the form
3. Submit
4. Check:
   - ✅ Email received at `hamza.hussain.omran@gmail.com`
   - ✅ Auto-reply received at the email you sent from

---

## 🔍 Monitoring & Debugging

### View Vercel Logs
```bash
# Backend logs
cd server
vercel logs --follow

# Frontend logs
cd portfolio-app
vercel logs --follow
```

### View Database Logs
Supabase Dashboard → **Logs** → **Postgres Logs**

### Check Sync History
```sql
SELECT * FROM sync_logs ORDER BY started_at DESC LIMIT 20;
```

### Webhook Deliveries
GitHub Settings → Webhooks → Your webhook → Recent Deliveries

---

## 🔄 Making Updates

### Update Backend Code
```bash
cd server
# Make changes
vercel --prod
```

### Update Frontend Code
```bash
cd portfolio-app
# Make changes
vercel --prod
```

### Update Database Schema
```sql
-- Run in Supabase SQL Editor
ALTER TABLE repositories ADD COLUMN new_field VARCHAR(255);
```

---

## 🐛 Troubleshooting

### "Failed to fetch repositories" error
- Check `VITE_BACKEND_URL` is set correctly
- Verify backend is deployed: Visit `https://your-backend-url.vercel.app/api/repositories`
- Check CORS settings in backend

### Webhook not working
- Verify `GITHUB_WEBHOOK_SECRET` matches in both places
- Check Recent Deliveries for error messages
- View Vercel logs for webhook endpoint

### Database connection error
- Verify `DATABASE_URL` is correct
- Check Supabase project is not paused (free tier pauses after 1 week inactivity)
- Test connection: Run schema.sql again

### Email not sending
- Verify Gmail tokens are valid and not expired
- Check Vercel logs for Gmail API errors
- Re-run OAuth flow if needed

---

## 🎉 Success!

Your portfolio is now running on a modern, scalable architecture:

✅ **Frontend**: Blazing fast, no API rate limits  
✅ **Backend**: Serverless, auto-scaling  
✅ **Database**: PostgreSQL with automatic backups  
✅ **Webhooks**: Real-time updates from GitHub  
✅ **Cost**: $0/month on free tier!

---

## 📈 Next Steps (Optional)

1. **Add caching**: Implement edge caching for `/api/repositories`
2. **Add admin panel**: Build a simple UI to trigger syncs and view logs
3. **Analytics**: Add Vercel Analytics or Google Analytics
4. **Custom domain**: Add your own domain in Vercel settings
5. **Monitoring**: Set up error tracking with Sentry
6. **Rate limiting**: Add rate limiting to public endpoints

Enjoy your new architecture! 🚀
