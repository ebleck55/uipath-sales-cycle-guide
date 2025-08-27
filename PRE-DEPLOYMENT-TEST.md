# 🧪 Pre-Deployment Testing Checklist

Complete this checklist before deploying to ensure everything works properly.

## ✅ Core Functionality Tests

### 🏠 **Main Application Load**
- [ ] Open `index.html` in browser
- [ ] Page loads without errors
- [ ] Timeline displays properly
- [ ] No console errors (F12 → Console)

### 👥 **Persona Functionality** (PRIORITY)
- [ ] Persona tiles visible in "Decision Makers & Personas" section
- [ ] Click first persona tile → expands with detailed content
- [ ] Click second persona tile → expands properly
- [ ] Can expand multiple personas at once
- [ ] Chevron arrows rotate when expanding/collapsing
- [ ] Content includes:
  - [ ] Level badges (👑 C-Suite, 🎯 Executive, etc.)
  - [ ] Influence indicators (✅ Decision Maker, 🤝 Influencer)
  - [ ] "Who They Are" section
  - [ ] "What They Care About" section  
  - [ ] "How UiPath Can Help Them" section
  - [ ] Key Focus Areas (tags)

### 📈 **Timeline Navigation**
- [ ] Timeline visible at top
- [ ] Can click different stages
- [ ] Content updates when switching stages
- [ ] Progress indicator moves correctly

### 🎯 **Industry Switching**
- [ ] Can switch from Banking to Insurance
- [ ] Persona content updates for different industries
- [ ] Timeline content adapts to industry

### ⚙️ **Admin Panel**
- [ ] Click "⚙️ Admin" button in top right
- [ ] Admin panel opens in new tab/window
- [ ] Can view personas list
- [ ] Can view resources
- [ ] No critical errors

### 📱 **Mobile Responsiveness**
- [ ] Resize browser to mobile width (320px)
- [ ] Content stacks properly
- [ ] Persona tiles still clickable
- [ ] Text remains readable
- [ ] Navigation accessible

## 🔍 Browser Compatibility

Test in at least 2 browsers:
- [ ] **Chrome:** All functionality works
- [ ] **Firefox:** All functionality works  
- [ ] **Safari:** All functionality works (if on Mac)
- [ ] **Edge:** All functionality works (if on Windows)

## 🐛 Known Issues Check

### ❌ **Critical Issues** (Must fix before deployment)
- [ ] Personas don't expand when clicked
- [ ] JavaScript errors in console
- [ ] Page doesn't load
- [ ] Admin panel inaccessible

### ⚠️ **Minor Issues** (Can fix after deployment)
- [ ] Styling inconsistencies
- [ ] Slow loading
- [ ] Minor mobile layout issues
- [ ] Content formatting problems

## 📂 File Structure Verification

- [ ] `index.html` in root directory
- [ ] `timeline-app.js` present and linked
- [ ] `js/data.js` present and linked
- [ ] `src/admin/admin.html` accessible
- [ ] `src/data/personas.json` contains rich persona data
- [ ] `css/styles.css` present and linked

## 🚀 Deployment Readiness

- [ ] All critical functionality tested ✅
- [ ] No blocking errors found
- [ ] Documentation files created
- [ ] Ready to share with users

---

## 🎯 Quick Test Script

Open browser console (F12) and run:
```javascript
// Test persona toggle
console.log('Testing persona expansion...');
if (window.TimelineApp && window.TimelineApp.togglePersonaCard) {
  window.TimelineApp.togglePersonaCard(0);
  console.log('✅ Persona toggle function exists');
} else {
  console.error('❌ Persona toggle function missing');
}

// Check for personas data
console.log('Admin personas loaded:', !!window.TimelineApp?.adminPersonas);
```

## 📞 Emergency Contacts

If you find critical issues:
1. **Document the issue** with screenshots
2. **Note browser/device details**
3. **Check console for error messages**
4. **Don't deploy until resolved**

---

**✅ All tests passed? You're ready to deploy!**
**❌ Found issues? Fix them first, then retest.**