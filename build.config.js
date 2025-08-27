/**
 * Build Configuration for UiPath Sales Cycle Guide
 * Defines build processes, asset optimization, and deployment settings
 */

export const buildConfig = {
  // Environment settings
  environments: {
    development: {
      minify: false,
      sourceMaps: true,
      debug: true,
      watchFiles: true
    },
    staging: {
      minify: true,
      sourceMaps: true,
      debug: false,
      watchFiles: false
    },
    production: {
      minify: true,
      sourceMaps: false,
      debug: false,
      watchFiles: false
    }
  },

  // File paths and structure
  paths: {
    src: 'src/',
    dist: 'dist/',
    assets: 'assets/',
    components: 'src/components/',
    modules: 'src/',
    config: 'src/config/'
  },

  // Entry points for the application
  entryPoints: {
    main: 'index.html',
    app: 'src/app.js',
    timeline: 'src/components/timeline-app.js',
    admin: 'src/admin/optimized-admin.html'
  },

  // Asset optimization
  optimization: {
    // JavaScript minification
    js: {
      enabled: true,
      removeConsole: ['log', 'debug'], // Keep 'warn' and 'error'
      removeComments: true,
      preserveModules: true
    },

    // CSS optimization
    css: {
      enabled: true,
      removeUnused: true,
      minify: true,
      autoprefixer: true
    },

    // Image optimization
    images: {
      enabled: true,
      formats: ['webp', 'jpg', 'png'],
      quality: 80,
      progressive: true
    },

    // Bundle splitting for better caching
    chunks: {
      vendor: ['modules', 'third-party'],
      core: ['src/core/', 'src/config/'],
      components: ['src/components/'],
      admin: ['src/admin/']
    }
  },

  // Development server settings
  devServer: {
    port: 3000,
    host: 'localhost',
    hot: true,
    cors: true,
    compress: true,
    historyApiFallback: true,
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  },

  // Build plugins and tools
  plugins: {
    // HTML processing
    html: {
      minify: {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        useShortDoctype: true
      }
    },

    // Service worker for PWA features
    serviceWorker: {
      enabled: true,
      cacheStrategy: 'networkFirst',
      offlinePages: ['index.html', 'src/admin/optimized-admin.html']
    },

    // Security headers
    security: {
      csp: {
        enabled: true,
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'", "https://corsproxy.io"],
          'style-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", "data:", "https:"],
          'connect-src': ["'self'", "https://api.anthropic.com", "https://corsproxy.io"]
        }
      }
    }
  },

  // File watching patterns for development
  watch: {
    patterns: [
      'src/**/*.js',
      'src/**/*.html',
      'src/**/*.css',
      'src/**/*.json',
      '*.html',
      '*.css',
      '*.js'
    ],
    ignore: [
      'node_modules/**',
      'dist/**',
      '.git/**',
      '*.log'
    ]
  },

  // Deployment configurations
  deploy: {
    // GitHub Pages
    github: {
      branch: 'gh-pages',
      cleanBuild: true,
      baseUrl: '/uipath-sales-cycle-guide'
    },

    // Static hosting (Netlify, Vercel, etc.)
    static: {
      outputDir: 'dist',
      cleanBuild: true,
      copyFiles: [
        { from: 'src/data/', to: 'data/' },
        { from: 'assets/', to: 'assets/' }
      ]
    },

    // CDN deployment
    cdn: {
      enabled: false,
      provider: '',
      bucket: '',
      region: '',
      accessKey: '', // Should be set via environment variables
      secretKey: ''  // Should be set via environment variables
    }
  },

  // Testing configuration
  testing: {
    framework: 'native', // or 'jest', 'vitest'
    coverage: {
      enabled: true,
      threshold: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80
      }
    },
    e2e: {
      enabled: true,
      browser: 'chromium',
      headless: true
    }
  }
};

// Build scripts for different environments
export const buildScripts = {
  // Development build with watching
  dev: {
    command: 'Build for development with file watching',
    steps: [
      'Clean previous build artifacts',
      'Copy static assets',
      'Process HTML files',
      'Bundle JavaScript modules',
      'Compile CSS',
      'Start development server',
      'Enable file watching'
    ]
  },

  // Production build
  build: {
    command: 'Build optimized version for production',
    steps: [
      'Clean dist directory',
      'Validate source files',
      'Process and minify HTML',
      'Bundle and minify JavaScript',
      'Optimize and minify CSS',
      'Compress and optimize images',
      'Generate service worker',
      'Create build manifest',
      'Generate deployment files'
    ]
  },

  // Preview production build locally
  preview: {
    command: 'Preview production build locally',
    steps: [
      'Build production version',
      'Start local server with production build',
      'Open browser with production URL'
    ]
  },

  // Deploy to production
  deploy: {
    command: 'Deploy to configured hosting platform',
    steps: [
      'Run production build',
      'Validate build output',
      'Run pre-deployment tests',
      'Upload files to hosting platform',
      'Verify deployment success',
      'Clear CDN cache if configured'
    ]
  }
};

export default buildConfig;