# 🚀 Hardened Edition Deployment Guide

## 📍 **Current Setup**

You now have **two separate deployments**:

### **Production Site (Main Branch)**
- **URL**: `https://ebleck55.github.io/uipath-sales-cycle-guide/`
- **Branch**: `main`
- **File**: `index.html` (original version)
- **Status**: ✅ **Safe & Unchanged**

### **Beta Site (Hardened Branch)**  
- **URL**: `https://ebleck55.github.io/uipath-sales-cycle-guide/` (when deployed from hardened branch)
- **Branch**: `hardened`
- **File**: `index.html` (hardened version)
- **Status**: 🚧 **Ready for Testing**

## 🔧 **How to Deploy Hardened Version for Testing**

### **Option 1: GitHub Pages Branch Setting (Recommended)**

1. **Go to Repository Settings**:
   - Visit: `https://github.com/ebleck55/uipath-sales-cycle-guide/settings/pages`

2. **Change Source Branch**:
   - Under "Build and deployment"
   - Change "Branch" from `main` to `hardened`
   - Keep "/ (root)" selected
   - Click "Save"

3. **Access Your Beta Site**:
   - Wait 2-3 minutes for deployment
   - Visit: `https://ebleck55.github.io/uipath-sales-cycle-guide/`
   - You'll see the hardened version with "Beta" in the title

### **Option 2: Create Separate Repository (Alternative)**

If you prefer completely separate deployments:

1. **Create new repository**: `uipath-sales-guide-hardened`
2. **Push hardened branch** to new repo
3. **Enable GitHub Pages** on new repo
4. **Get separate URL**: `https://ebleck55.github.io/uipath-sales-guide-hardened/`

## 🔄 **Switching Between Versions**

### **To Test Hardened Version**:
```bash
# In GitHub repo settings, set Pages branch to: hardened
```

### **To Revert to Original**:
```bash
# In GitHub repo settings, set Pages branch back to: main
```

## ✅ **Safety Guarantees**

- ✅ **Original site preserved** in main branch
- ✅ **No data loss risk** - all versions are in git history  
- ✅ **Easy rollback** - just change branch setting
- ✅ **Side-by-side comparison** possible

## 🧪 **Testing Checklist**

Once hardened version is deployed, test:

- [ ] **Security**: No console errors related to CSP
- [ ] **Functionality**: All original features work
- [ ] **Performance**: Page loads quickly
- [ ] **Mobile**: Responsive design works
- [ ] **AI Features**: API key configuration works
- [ ] **Export**: Copy notes functionality works
- [ ] **Clear**: Clear all functionality works
- [ ] **No Persistence**: Data doesn't persist on refresh

## 📞 **Next Steps**

1. **Deploy using Option 1** (change GitHub Pages branch)
2. **Test thoroughly** using the checklist above
3. **If satisfied**: Keep hardened version live
4. **If issues found**: Revert to main branch, report issues
5. **When ready**: Merge hardened improvements to main

## 🆘 **Emergency Rollback**

If anything goes wrong:
1. Go to repo settings → Pages
2. Change branch back to `main`  
3. Original site restored in ~2 minutes

**Your original site is 100% safe! 🛡️**