# Portfolio Project

A modern portfolio website with React frontend and Node.js backend for contact form functionality.

## Structure

- `portfolio-app/` - React frontend built with Vite
- `server/` - Node.js/Express backend for email service

## Deployment

- Frontend: Vercel
- Backend: Railway

## Environment Variables

### Frontend (Vercel)
- `VITE_BACKEND_URL` - Railway backend URL
- `VITE_GITHUB_TOKEN` - GitHub personal access token

### Backend (Railway)
- `FRONTEND_URL` - Vercel frontend URL
- `GMAIL_CLIENT_ID` - Google OAuth client ID
- `GMAIL_CLIENT_SECRET` - Google OAuth client secret
- `GMAIL_REDIRECT_URI` - OAuth redirect URI
- `GMAIL_ACCESS_TOKEN` - Primary Gmail access token
- `GMAIL_REFRESH_TOKEN` - Primary Gmail refresh token
- `GMAIL_SECONDARY_ACCESS_TOKEN` - Secondary Gmail access token
- `GMAIL_SECONDARY_REFRESH_TOKEN` - Secondary Gmail refresh token

## Setup

1. Install dependencies in both directories
2. Configure environment variables
3. Deploy to respective platforms
