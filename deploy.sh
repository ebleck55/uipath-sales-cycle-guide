#!/bin/bash

# UiPath Sales Cycle Guide - Quick Deployment Script
echo "🚀 UiPath Sales Cycle Guide - GitHub Deployment"
echo "================================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📝 Initializing git repository..."
    git init
fi

# Add all files
echo "📦 Adding files to git..."
git add .

# Create commit with timestamp
TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
echo "💾 Creating commit..."
git commit -m "Deploy UiPath Sales Guide - $TIMESTAMP

✨ Features ready for testing:
- Interactive timeline navigation
- Expandable persona tiles with admin data
- Industry/LOB filtering system  
- Admin content management panel
- AI-powered features and search
- Mobile-responsive design

🎯 Ready for user feedback collection"

# Check if remote is set
if ! git remote get-url origin &> /dev/null; then
    echo "⚠️  GitHub remote not set up yet!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Create a new repository on GitHub"
    echo "2. Run: git remote add origin https://github.com/YOURUSERNAME/REPOSITORY-NAME.git"
    echo "3. Run: git push -u origin main"
    echo "4. Enable GitHub Pages in repository settings"
else
    echo "🚀 Pushing to GitHub..."
    git push origin main
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "🔗 Your site will be available at:"
    REMOTE_URL=$(git remote get-url origin)
    USERNAME=$(echo $REMOTE_URL | sed 's/.*github.com[:/]\([^/]*\).*/\1/')
    REPO=$(echo $REMOTE_URL | sed 's/.*\/\([^.]*\)\.git/\1/' | sed 's/.*\/\([^/]*\)$/\1/')
    echo "   https://$USERNAME.github.io/$REPO"
    echo ""
    echo "📋 Don't forget to:"
    echo "   1. Enable GitHub Pages in repository settings"
    echo "   2. Wait 2-5 minutes for deployment"
    echo "   3. Test the live site"
    echo "   4. Share with users for feedback!"
fi

echo ""
echo "🎉 Ready to collect user feedback!"