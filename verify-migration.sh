#!/bin/bash

# Quick verification script to check all required files exist

echo "🔍 Verifying Migration Files..."
echo "================================"
echo ""

ERRORS=0

# Backend files
echo "📦 Backend Files:"
files=(
    "server/api/repositories.js"
    "server/api/webhook.js"
    "server/api/sync-repos.js"
    "server/api/send-email.js"
    "server/lib/db.js"
    "server/lib/github.js"
    "server/lib/patterns.js"
    "server/database/schema.sql"
    "server/package.json"
    "server/vercel.json"
    "server/ENV_SETUP.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ MISSING: $file"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""
echo "📱 Frontend Files:"
files=(
    "portfolio-app/src/services/githubService.js"
    "portfolio-app/src/components/Projects/Projects.jsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ MISSING: $file"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""
echo "📚 Documentation:"
files=(
    "README.md"
    "DEPLOYMENT.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ MISSING: $file"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""
echo "================================"
if [ $ERRORS -eq 0 ]; then
    echo "✅ All files present!"
    echo ""
    echo "Next steps:"
    echo "1. Read DEPLOYMENT.md for deployment instructions"
    echo "2. Set up Supabase database"
    echo "3. Configure environment variables"
    echo "4. Deploy to Vercel"
else
    echo "❌ $ERRORS file(s) missing!"
    echo "Please check the error messages above"
fi
