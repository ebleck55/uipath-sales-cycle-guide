#!/usr/bin/env node
/**
 * Deployment Script for UiPath Sales Cycle Guide
 * Simple deployment automation for static hosting
 */

import fs from 'fs';
import path from 'path';
import { buildConfig } from '../build.config.js';

class Deployer {
  constructor(environment = 'production') {
    this.environment = environment;
    this.config = buildConfig;
    this.startTime = Date.now();
  }

  /**
   * Main deployment process
   */
  async deploy() {
    console.log(`🚀 Starting deployment for ${this.environment} environment...`);
    
    try {
      // Step 1: Pre-deployment checks
      await this.preDeploymentChecks();
      
      // Step 2: Build the application
      await this.buildApplication();
      
      // Step 3: Prepare deployment files
      await this.prepareDeploymentFiles();
      
      // Step 4: Validate build output
      await this.validateBuildOutput();
      
      // Step 5: Deploy (this would integrate with your hosting platform)
      await this.deployToHosting();
      
      // Step 6: Post-deployment verification
      await this.postDeploymentVerification();
      
      const totalTime = ((Date.now() - this.startTime) / 1000).toFixed(2);
      console.log(`✅ Deployment completed successfully in ${totalTime}s`);
      
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Pre-deployment checks
   */
  async preDeploymentChecks() {
    console.log('🔍 Running pre-deployment checks...');
    
    // Check if required files exist
    const requiredFiles = [
      'index.html',
      'src/app.js',
      'src/config/app-config.js',
      'src/components/timeline-app.js'
    ];
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }
    
    // Check if data files are present
    const dataDir = 'src/data';
    if (fs.existsSync(dataDir)) {
      const dataFiles = fs.readdirSync(dataDir);
      console.log(`📊 Found ${dataFiles.length} data files`);
    }
    
    console.log('✅ Pre-deployment checks passed');
  }

  /**
   * Build the application
   */
  async buildApplication() {
    console.log('🏗️ Building application...');
    
    const distDir = this.config.paths.dist;
    
    // Clean dist directory
    if (fs.existsSync(distDir)) {
      fs.rmSync(distDir, { recursive: true, force: true });
    }
    fs.mkdirSync(distDir, { recursive: true });
    
    // Copy main HTML file
    fs.copyFileSync('index.html', path.join(distDir, 'index.html'));
    
    // Copy src directory
    this.copyDirectory('src', path.join(distDir, 'src'));
    
    // Copy assets if they exist
    if (fs.existsSync('assets')) {
      this.copyDirectory('assets', path.join(distDir, 'assets'));
    }
    
    // Copy CSS files
    const cssFiles = fs.readdirSync('.').filter(file => file.endsWith('.css'));
    cssFiles.forEach(file => {
      fs.copyFileSync(file, path.join(distDir, file));
    });
    
    // Copy JavaScript files (if any in root)
    const jsFiles = fs.readdirSync('.').filter(file => file.endsWith('.js') && !file.startsWith('build.') && !file.startsWith('deploy.'));
    jsFiles.forEach(file => {
      fs.copyFileSync(file, path.join(distDir, file));
    });
    
    console.log('✅ Application built successfully');
  }

  /**
   * Copy directory recursively
   */
  copyDirectory(src, dest) {
    if (!fs.existsSync(src)) return;
    
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }

  /**
   * Prepare deployment-specific files
   */
  async prepareDeploymentFiles() {
    console.log('📝 Preparing deployment files...');
    
    const distDir = this.config.paths.dist;
    
    // Create deployment manifest
    const manifest = {
      version: this.config.version || '2.0.0',
      environment: this.environment,
      buildTime: new Date().toISOString(),
      files: this.getFileList(distDir)
    };
    
    fs.writeFileSync(
      path.join(distDir, 'deploy-manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    // Create .htaccess for Apache servers (if applicable)
    const htaccess = `
# UiPath Sales Cycle Guide - Apache Configuration
RewriteEngine On

# Security headers
Header always set X-Frame-Options "DENY"
Header always set X-Content-Type-Options "nosniff"
Header always set Referrer-Policy "strict-origin-when-cross-origin"

# Cache control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/html "access plus 1 hour"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/json "access plus 1 day"
</IfModule>

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>
`.trim();
    
    fs.writeFileSync(path.join(distDir, '.htaccess'), htaccess);
    
    console.log('✅ Deployment files prepared');
  }

  /**
   * Get list of all files in directory
   */
  getFileList(dir, fileList = [], baseDir = dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const relativePath = path.relative(baseDir, filePath);
      
      if (fs.statSync(filePath).isDirectory()) {
        this.getFileList(filePath, fileList, baseDir);
      } else {
        fileList.push({
          path: relativePath.replace(/\\/g, '/'),
          size: fs.statSync(filePath).size,
          modified: fs.statSync(filePath).mtime
        });
      }
    });
    
    return fileList;
  }

  /**
   * Validate build output
   */
  async validateBuildOutput() {
    console.log('✅ Validating build output...');
    
    const distDir = this.config.paths.dist;
    
    // Check if main files exist
    const requiredFiles = ['index.html', 'src/app.js'];
    for (const file of requiredFiles) {
      const filePath = path.join(distDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Build validation failed: ${file} not found in dist`);
      }
    }
    
    // Check file sizes (basic sanity check)
    const indexSize = fs.statSync(path.join(distDir, 'index.html')).size;
    if (indexSize < 1000) { // Less than 1KB seems wrong
      throw new Error('Build validation failed: index.html seems too small');
    }
    
    console.log('✅ Build output validation passed');
  }

  /**
   * Deploy to hosting platform
   */
  async deployToHosting() {
    console.log('🌐 Deploying to hosting platform...');
    
    // This is where you'd integrate with your hosting platform's API
    // For now, we'll just log the deployment information
    
    const deployConfig = this.config.deploy.static;
    console.log(`📁 Deployment ready in: ${deployConfig.outputDir}`);
    console.log('🔧 Manual deployment steps:');
    console.log('   1. Upload contents of dist/ folder to your web server');
    console.log('   2. Ensure all files are accessible via HTTP/HTTPS');
    console.log('   3. Test the deployment by visiting your site');
    
    // For GitHub Pages deployment, you might run:
    // git subtree push --prefix dist origin gh-pages
    
    // For Netlify, you might use their CLI:
    // netlify deploy --prod --dir=dist
    
    console.log('✅ Deployment prepared (manual upload required)');
  }

  /**
   * Post-deployment verification
   */
  async postDeploymentVerification() {
    console.log('🔍 Running post-deployment verification...');
    
    // Here you could add checks like:
    // - HTTP status checks for main pages
    // - Performance audits
    // - Security header verification
    // - Functional tests
    
    console.log('ℹ️ Manual verification recommended:');
    console.log('   • Check that the site loads correctly');
    console.log('   • Verify all navigation works');
    console.log('   • Test admin panel functionality (if enabled)');
    console.log('   • Confirm performance metrics are acceptable');
    
    console.log('✅ Deployment ready for verification');
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const environment = process.argv[2] || 'production';
  const deployer = new Deployer(environment);
  deployer.deploy();
}

export default Deployer;