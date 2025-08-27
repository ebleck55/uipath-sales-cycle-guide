# UiPath Sales Cycle Guide - Timeline Edition

A modern, interactive sales cycle guide application designed to help UiPath sales professionals navigate complex sales processes with comprehensive persona insights, stage-specific guidance, and intelligent content recommendations.

## 🌟 Key Features

### ✨ **Timeline Navigation**
- Interactive sales cycle timeline with visual progression
- Click any stage to navigate through the sales process
- Real-time progress tracking and stage indicators

### 👥 **Rich Decision Maker & Personas**
- **Expandable persona tiles** with comprehensive details
- **Level indicators**: 👑 C-Suite, 🎯 Executive, 📋 Director
- **Influence markers**: ✅ Decision Maker, 🤝 Influencer
- **Priority badges**: ⭐ High Priority personas
- **Detailed insights**: Who they are, what they care about, how UiPath helps
- **Line of Business targeting** and key focus areas

### 🎯 **Customer Context Management**
- Industry selection (Banking, Insurance)
- Line of Business filtering
- Project type customization (RPA, IDP, Agentic, Maestro)
- Customer type targeting (New Logo vs Existing)

### 🤖 **AI-Powered Features**
- Intelligent search and content recommendations
- Company research capabilities
- Competitive analysis tools
- Context-aware persona matching

### ⚙️ **Admin Interface**
- Content management for personas, resources, and use cases
- Real-time editing capabilities
- Import/export functionality for easy content updates

## 🚀 Quick Start

### Option 1: GitHub Pages (Recommended for Testing)
1. Visit: **[https://yourusername.github.io/repository-name](https://yourusername.github.io/repository-name)**
2. No installation required - works directly in your browser!

### Option 2: Local Development
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/repository-name.git
   cd repository-name
   ```

2. **Start a local server:**
   ```bash
   # Option A: Using Python
   python3 -m http.server 8080
   
   # Option B: Using Node.js
   npx http-server -p 8080
   
   # Option C: Using PHP
   php -S localhost:8080
   ```

3. **Open in browser:**
   ```
   http://localhost:8080
   ```

## 📱 Usage Guide

### For Sales Professionals
1. **Select your context:** Choose industry, LOB, project type, and customer type
2. **Navigate the timeline:** Click on different sales stages to explore content
3. **Explore personas:** Click on any persona tile to expand detailed information
4. **Use AI features:** Ask questions, research companies, analyze competitors

### For Administrators
1. **Access admin panel:** Click the "⚙️ Admin" button in the top right
2. **Edit content:** Modify personas, resources, and use cases in real-time
3. **Import/Export:** Bulk update content using JSON files
4. **Preview changes:** Test modifications before publishing

## 🔧 Technical Details

### Architecture
- **Frontend:** Vanilla JavaScript (ES6+), HTML5, CSS3
- **Styling:** Tailwind CSS for responsive design
- **Data:** JSON-based content management
- **Security:** CSP-compliant with XSS protection

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### File Structure
```
├── index.html                 # Main application
├── timeline-app.js           # Core application logic
├── js/
│   ├── data.js              # Sales cycle data
│   └── ai-integration.js    # AI features
├── src/
│   ├── admin/               # Admin interface
│   ├── data/               # JSON data files
│   └── components/         # Reusable components
└── css/
    └── styles.css          # Custom styles
```

## 🐛 Known Issues & Feedback

We're actively seeking feedback! Please help us improve by reporting:

### 🔍 **What to Test**
- [ ] **Persona expansion:** Can you click and expand persona tiles?
- [ ] **Timeline navigation:** Does stage progression work smoothly?
- [ ] **Industry switching:** Do personas update when changing industries?
- [ ] **Admin functionality:** Can you edit content in the admin panel?
- [ ] **Mobile experience:** How does it work on phones/tablets?
- [ ] **Loading performance:** Are there any slow loading issues?

### 📝 **How to Provide Feedback**
1. **Create an Issue:** [Click here to create a GitHub issue](https://github.com/yourusername/repository-name/issues/new)
2. **Include:**
   - What you were trying to do
   - What happened vs what you expected
   - Browser and device information
   - Screenshots if relevant

### 🚨 **Priority Feedback Areas**
- **Persona functionality** (newly rebuilt)
- **Content accuracy** for your industry
- **Mobile usability**
- **Admin workflow** efficiency

## 🛠️ Development

### Making Changes
1. **Edit content:** Modify files in `src/data/` for personas, resources
2. **Update styling:** Edit `css/styles.css` or modify Tailwind classes
3. **Add features:** Extend `timeline-app.js` with new functionality

### Deploying Changes
```bash
# Commit your changes
git add .
git commit -m "Your change description"
git push origin main

# Changes will automatically deploy to GitHub Pages
```

## 📊 Roadmap

### 🎯 **Phase 1: User Feedback** (Current)
- Collect user feedback on core functionality
- Fix critical bugs and usability issues
- Improve mobile experience

### 🚀 **Phase 2: Enhanced Features**
- Advanced search and filtering
- Offline capability (PWA)
- Integration with CRM systems
- Advanced analytics dashboard

### 🎨 **Phase 3: Customization**
- White-label theming options
- Custom content templates
- API integrations
- Multi-language support

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/repository-name/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/repository-name/discussions)
- **Email:** your-email@company.com

## 📄 License

This project is proprietary software owned by UiPath. Please contact the development team for licensing information.

---

**Built with ❤️ for UiPath Sales Teams**