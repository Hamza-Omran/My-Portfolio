#!/bin/bash

# Portfolio Backend - Quick Test Script
# Tests all backend endpoints locally

echo "🧪 Testing Portfolio Backend Endpoints"
echo "======================================="
echo ""

# Configuration
BACKEND_URL=${1:-"http://localhost:3000/api"}

echo "Testing against: $BACKEND_URL"
echo ""

# Test 1: Get Repositories
echo "1️⃣ Testing GET /repositories..."
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" "$BACKEND_URL/repositories")
HTTP_STATUS=$(echo "$RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ GET /repositories - SUCCESS"
    REPO_COUNT=$(echo "$BODY" | grep -o '"count":[0-9]*' | cut -d: -f2)
    echo "   Found $REPO_COUNT repositories"
else
    echo "❌ GET /repositories - FAILED (Status: $HTTP_STATUS)"
    echo "   Response: $BODY"
fi
echo ""

# Test 2: Trigger Sync
echo "2️⃣ Testing POST /sync-repos..."
echo "   ⚠️  This will fetch from GitHub API and update database"
read -p "   Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
        -X POST \
        "$BACKEND_URL/sync-repos?batch_size=2")
    HTTP_STATUS=$(echo "$RESPONSE" | grep HTTP_STATUS | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo "✅ POST /sync-repos - SUCCESS"
        echo "   Response: $BODY"
    else
        echo "❌ POST /sync-repos - FAILED (Status: $HTTP_STATUS)"
        echo "   Response: $BODY"
    fi
else
    echo "⏭️  Skipped sync test"
fi
echo ""

# Test 3: Webhook Test (requires valid GitHub webhook payload)
echo "3️⃣ Testing POST /webhook..."
echo "   ℹ️  Skipping (requires valid GitHub signature)"
echo "   To test webhook, use GitHub webhook settings or ngrok"
echo ""

# Summary
echo "======================================="
echo "✅ Backend endpoint tests complete!"
echo ""
echo "Next steps:"
echo "1. Set up Supabase database"
echo "2. Configure environment variables"
echo "3. Deploy to Vercel"
echo "4. Set up GitHub webhook"
echo ""
echo "See DEPLOYMENT.md for detailed instructions"
