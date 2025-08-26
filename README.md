# UiPath Sales Cycle Guide

A comprehensive interactive web application that guides sales professionals through the UiPath sales cycle, featuring industry-specific buyer personas, stage-specific content, and progress tracking.

## Features

- **Industry-Specific Content**: Toggle between Banking and Insurance industry views
- **Interactive Sales Stages**: 5 comprehensive stages with collapsible sections
- **Progress Tracking**: Checkbox-based progress tracking with visual progress bars
- **AI-Powered Assistance**: Generate follow-up questions and objection responses using Claude (Anthropic)
- **Smart Objection Handling**: AI-generated responses to customer objections with context awareness
- **Contextual Follow-up Questions**: AI generates relevant questions based on customer notes and sales stage
- **Admin Mode**: Edit content inline (when enabled)
- **Responsive Design**: Mobile-friendly interface with collapsible navigation
- **Local Storage**: Persists progress and notes across sessions

## Sales Stages

1. **Discovery**: Find Impact, Build Trust
2. **Business Qualification**: Value, Sponsor, Compelling Event
3. **Technical Qualification**: Feasibility, Risk, Architecture
4. **Proposal & Negotiation**: Commercials, Scope, Success Plan
5. **Implement & Expand**: Deliver Value, Land & Expand

## Technologies Used

- HTML5
- CSS3 (with Tailwind CSS via CDN)
- Vanilla JavaScript
- Google Fonts (Inter & Poppins)

## Getting Started

1. Clone this repository
2. Open `index.html` in your web browser
3. No build process required - runs directly in the browser

## GitHub Pages Deployment

This application is designed to work seamlessly with GitHub Pages:

1. Push your code to a GitHub repository
2. Enable GitHub Pages in your repository settings
3. Select the main branch as the source
4. Your application will be available at `https://[username].github.io/[repository-name]`

## File Structure

```
uipath-sales-cycle-guide/
├── index.html              # Optimized HTML structure with AI integration
├── css/
│   └── styles.css         # Separated CSS with performance optimizations
├── js/
│   ├── data.js           # Sales cycle data configuration
│   ├── app.js            # Main application logic
│   ├── ai-integration.js # AI integration for Claude (Anthropic)
│   └── performance.js    # Performance optimizations and utilities
├── sw.js                  # Service Worker for offline functionality
├── README.md             # Documentation
└── .gitignore            # Git ignore file
```

## AI Integration

Configure any or all of these AI providers in the application:

### Supported Providers:
- **Claude (Anthropic)**: Get your API key from [console.anthropic.com](https://console.anthropic.com)

### AI Features:
- **Smart Follow-up Questions**: Generate contextual questions based on sales stage and customer notes
- **Intelligent Objection Handling**: Get AI-powered responses to customer objections with industry context
- **Contextual Awareness**: AI considers current sales stage, industry (Banking/Insurance), and customer notes
- **Single Provider**: Powered by Claude for consistent, high-quality AI assistance
- **Customizable Settings**: Adjust temperature (creativity) and max tokens per response

### Usage:
1. Click the "AI Settings" button in the header
2. Select your preferred AI provider
3. Enter your API key(s)
4. Test the connection
5. Use the "✨ AI: Generate Follow-up Questions" buttons in each sales stage
6. Click "✨ AI Response" on any objection for contextual responses

## Performance Optimizations

- **Separated concerns**: CSS, JavaScript, and data are in separate files
- **Service Worker**: Enables offline functionality and caching
- **Resource hints**: Preconnect to external domains for faster loading
- **Lazy loading**: Ready for images and heavy content
- **Modern clipboard API**: With fallback for older browsers
- **Memory management**: Built-in monitoring and cleanup utilities
- **Accessibility**: ARIA labels, semantic HTML, keyboard navigation
- **AI Integration**: Modular AI system with error handling and fallbacks

## Browser Compatibility

This application works in all modern browsers including:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Local Development

Simply open `index.html` in your browser. No server required for basic functionality.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).