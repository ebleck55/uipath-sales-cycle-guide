# 🌐 HTTP Server Setup for UiPath Sales Guide

## Quick HTTP Server Setup

### Option 1: Python (Recommended)
```bash
# Navigate to your project directory
cd /Users/eric.bouchard/my-first-claude-project

# Start HTTP server on port 8000
python3 -m http.server 8000

# Or use Python 2 if needed
python -m SimpleHTTPServer 8000
```

### Option 2: Node.js (if you have it installed)
```bash
# Install a simple server globally
npm install -g http-server

# Start server
http-server -p 8000

# Or use npx (no installation needed)
npx http-server -p 8000
```

### Option 3: PHP (if available)
```bash
php -S localhost:8000
```

## 🔗 Production Links

Once your HTTP server is running, access these URLs:

### Main Combined App
**http://localhost:9000/index-combined-timeline-admin.html**
- **Complete Timeline Edition with integrated admin functionality**
- Full hardened UiPath Sales Cycle Guide interface
- Admin mode toggle for analytics and management
- All personas, sales stages, and resources included
- Modular admin services with real-time tracking

### Alternative Versions
**http://localhost:9000/index-timeline-admin.html**
- Timeline Edition with integrated admin overlay
- Preserves all existing Timeline Edition functionality
- Modular admin services with analytics tracking
- Clean separation between user and admin features

### Legacy Production App
**http://localhost:8000/index-production.html**
- Complete integrated version with all harvested data
- Full admin panel with analytics
- AI features with prompt tracking
- All personas and sales stages included

### Testing Dashboard
**http://localhost:8000/local-testing.html**
- Interactive testing interface
- Progress tracking
- Console testing commands

### Legacy Versions (for comparison)
- **Hardened Version:** http://localhost:8000/index-hardened.html
- **Original Modular:** http://localhost:8000/index.html
- **Standalone Admin:** http://localhost:8000/src/admin/admin.html

## 📊 What's Included in Production Version

### Complete Sales Data:
- **Banking Personas:** 10 detailed personas (COO, CCO, CIO/CTO, etc.)
- **Insurance Personas:** 2 detailed personas (Chief Claims Officer, Head of Underwriting)
- **Sales Stages:** 5 comprehensive stages with activities, deliverables, and resources
- **Resources:** 75+ industry-specific resources and links

### Advanced Features:
- ✅ **AI Service** with Claude API integration
- ✅ **Analytics Tracking** with prompt quality assessment
- ✅ **Admin Panel** with site statistics
- ✅ **Security Features** including sanitization and rate limiting
- ✅ **Export Capabilities** for notes and analytics
- ✅ **Mobile Responsive** design
- ✅ **PWA Support** for offline access

### Admin Functionality:
- 🎯 **Site Analytics:** Track user interactions and AI usage
- 🤖 **AI Management:** Configure Claude API, test connections
- 📊 **Content Stats:** View persona counts, resource metrics
- 📤 **Data Export:** Download analytics and usage data

## 🧪 Testing Instructions

1. **Start the server** using one of the methods above
2. **Open the production app** at http://localhost:8000/index-production.html
3. **Test basic functionality:**
   - Switch between Banking/Insurance industries
   - Explore personas and sales stages
   - Try the Export Notes feature

4. **Test admin features:**
   - Click "Enter Edit Mode"
   - Open "Admin Panel" 
   - Navigate through Analytics, AI Settings, and Content tabs
   - Add your Claude API key to test AI features

5. **Test AI integration:**
   - Configure API key in Admin Panel → AI Settings
   - Test the connection
   - Check Analytics tab for tracked prompts

## 🚀 Production Deployment

For production deployment, simply upload these files to any web server:
- `index-production.html` (main app)
- `production-app.js` (application logic)

The app is completely self-contained with:
- All data embedded in JavaScript
- No external dependencies except Tailwind CSS CDN
- Secure client-side API key storage
- Full offline PWA capabilities

## 💡 Pro Tips

- **Development Mode:** Add `?validate=true` to any URL to load validation scripts
- **Console Testing:** Use F12 dev tools to run `validateIntegration()`
- **Mobile Testing:** The app is fully responsive and works on all devices
- **Offline Use:** Install as PWA for offline access to all features

Your complete, production-ready UiPath Sales Guide is now available at:
**http://localhost:8000/index-production.html** 🎉