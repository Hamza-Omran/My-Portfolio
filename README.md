# My Portfolio

Modern portfolio website with automated GitHub repository showcase and contact form.
- # Live Demo: https://hamzaomran.online
<img width="1914" height="805" alt="image" src="https://github.com/user-attachments/assets/63a0f03b-1e85-45d2-81d4-88de056d5d79" />


## 🏗️ Architecture

### Frontend
- **Framework**: React with Vite
- **Styling**: Vanilla CSS
- **Hosting**: Vercel
- **Features**: 
  - Instant-loading projects section
  - Real-time GitHub updates via webhooks
  - Contact form with auto-reply

### Backend
- **Runtime**: Node.js (Serverless functions)
- **Database**: PostgreSQL (Supabase)
- **Hosting**: Vercel
- **APIs**:
  - `/api/repositories` - Get all repositories
  - `/api/webhook` - GitHub webhook handler
  - `/api/sync-repos` - Manual sync trigger
  - `/api/send-email` - Contact form handler

### Data Flow
1. **GitHub → Webhook → Backend → Database**
   - When you push code to any repository
   - GitHub sends webhook to `/api/webhook`
   - Backend fetches README, extracts demo link & image
   - Stores processed data in PostgreSQL

2. **Database → Frontend**
   - Frontend requests `/api/repositories`
   - Returns pre-processed data instantly
   - No GitHub API calls on page load!

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🔧 Development

### Prerequisites
- Node.js 18+
- PostgreSQL database (Supabase recommended)
- GitHub Personal Access Token
- Gmail API credentials

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Hamza-Omran/My-Portfolio.git
cd My-Portfolio
```

2. **Install dependencies**
```bash
# Backend
cd server
npm install

# Frontend
cd ../portfolio-app
npm install
```

3. **Configure environment variables**

Backend (`server/.env`):
```bash
DATABASE_URL=your_supabase_connection_string
GITHUB_TOKEN=your_github_token
GITHUB_USERNAME=Hamza-Omran
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_ACCESS_TOKEN=your_gmail_access_token
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token
GMAIL_SECONDARY_ACCESS_TOKEN=your_secondary_access_token
GMAIL_SECONDARY_REFRESH_TOKEN=your_secondary_refresh_token
FRONTEND_URL=http://localhost:5173
```

Frontend (`portfolio-app/.env`):
```bash
VITE_BACKEND_URL=http://localhost:3000/api
```

See [server/ENV_SETUP.md](./server/ENV_SETUP.md) for detailed configuration guide.

4. **Set up database**
```bash
# Run schema in Supabase SQL Editor
# Copy contents of server/database/schema.sql
```

5. **Run development servers**

Backend:
```bash
cd server
npm run dev
```

Frontend (in another terminal):
```bash
cd portfolio-app
npm run dev
```

6. **Populate database**
```bash
curl -X POST "http://localhost:3000/api/sync-repos"
```

Visit `http://localhost:5173` 🎉

## 📁 Project Structure

```
My-Portfolio/
├── portfolio-app/          # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── About/
│   │   │   ├── Contact/
│   │   │   ├── Navbar/
│   │   │   ├── Projects/   # Fetches from backend API
│   │   │   └── Skills/
│   │   ├── services/
│   │   │   ├── emailService.js
│   │   │   └── githubService.js  # Backend API client
│   │   └── main.jsx
│   └── package.json
│
├── server/                 # Backend serverless functions
│   ├── api/
│   │   ├── repositories.js     # GET repositories
│   │   ├── webhook.js          # GitHub webhook handler
│   │   ├── sync-repos.js       # Manual sync endpoint
│   │   └── send-email.js       # Contact form handler
│   ├── lib/
│   │   ├── db.js              # PostgreSQL utilities
│   │   ├── github.js          # GitHub API client
│   │   └── patterns.js        # README pattern extraction
│   ├── database/
│   │   └── schema.sql         # PostgreSQL schema
│   ├── package.json
│   └── vercel.json
│
├── DEPLOYMENT.md          # Deployment guide
└── README.md             # This file
```

## 🔐 Environment Variables

### Backend
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Supabase PostgreSQL connection string | ✅ |
| `GITHUB_TOKEN` | GitHub Personal Access Token | ✅ |
| `GITHUB_USERNAME` | Your GitHub username | ✅ |
| `GITHUB_WEBHOOK_SECRET` | Secret for webhook verification | ✅ |
| `GMAIL_CLIENT_ID` | Gmail OAuth Client ID | ✅ |
| `GMAIL_CLIENT_SECRET` | Gmail OAuth Client Secret | ✅ |
| `GMAIL_ACCESS_TOKEN` | Gmail OAuth Access Token | ✅ |
| `GMAIL_REFRESH_TOKEN` | Gmail OAuth Refresh Token | ✅ |
| `GMAIL_SECONDARY_ACCESS_TOKEN` | Secondary account access token | ✅ |
| `GMAIL_SECONDARY_REFRESH_TOKEN` | Secondary account refresh token | ✅ |
| `FRONTEND_URL` | Frontend URL for CORS | ✅ |

### Frontend
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_BACKEND_URL` | Backend API base URL | ✅ |

## 📊 Database Schema

### `repositories` table
Stores GitHub repository data with extracted README information.

### `sync_logs` table
Tracks webhook and manual sync operations for monitoring.

See [server/database/schema.sql](./server/database/schema.sql) for complete schema.

## 🔄 How Webhooks Work

1. Configure webhook at GitHub Settings → Webhooks
2. Point to `https://your-backend.vercel.app/api/webhook`
3. On push/repository update:
   - GitHub sends webhook to your backend
   - Backend validates signature
   - Fetches repository and README from GitHub API
   - Extracts demo link and project image
   - Updates PostgreSQL database
4. Frontend automatically shows updated data on next load

## 🧪 Testing

### Test backend locally
```bash
# Test repositories endpoint
curl http://localhost:3000/api/repositories

# Trigger manual sync
curl -X POST http://localhost:3000/api/sync-repos

# Test webhook (requires ngrok for GitHub delivery)
ngrok http 3000
# Update webhook URL to ngrok URL
```

### Test frontend
```bash
npm run dev
# Visit http://localhost:5173
```

## 🐛 Troubleshooting

See [DEPLOYMENT.md#troubleshooting](./DEPLOYMENT.md#troubleshooting) for common issues and solutions.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Hamza Hussain Omran**
- GitHub: [@Hamza-Omran](https://github.com/Hamza-Omran)
- Email: hamza.hussain.omran@gmail.com

## 🙏 Acknowledgments

- Built with React, Vite, and Vercel
- Database hosted on Supabase
- Email via Gmail API
- Real-time updates via GitHub Webhooks
