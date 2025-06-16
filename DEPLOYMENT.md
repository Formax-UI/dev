# 🚀 Formax UI - Deployment Guide

## The Issue You're Experiencing

Vercel is trying to build the **library** instead of the **documentation website**. The error "No Output Directory named 'public' found" occurs because Vercel expects a static website but your root project builds an npm library.

## ✅ **Quick Fix Solutions**

### **Option 1: Use the Build Script (Recommended)**

I've created a `build-docs.js` script that handles this automatically:

```bash
# Test locally first
node build-docs.js

# Commit and push the changes
git add .
git commit -m "Add documentation build script"
git push
```

The `vercel.json` is configured to use this script.

### **Option 2: Deploy docs folder separately**

Create a separate Vercel project for just the docs:

1. **In Vercel Dashboard:**
   - Create new project
   - Import from Git: `your-repo/docs` folder only
   - Framework preset: **Next.js**

2. **Or use Vercel CLI:**
   ```bash
   cd docs
   vercel --prod
   ```

### **Option 3: Manual build and deploy**

```bash
# Navigate to docs and build
cd docs
npm install
npm run build

# Copy build output to root public folder
cd ..
cp -r docs/out public

# Commit and deploy
git add public
git commit -m "Add built documentation"
git push
```

## 🔧 **Project Structure Fix**

Your current structure:
```
formax-ui/           (← Vercel is building this)
├── src/             (Library source)
├── docs/            (Documentation website)
├── package.json     (Library config)
└── vercel.json      (Deployment config)
```

What Vercel needs:
```
formax-ui/
├── public/          (Static website files)
└── vercel.json      (Points to public folder)
```

## 📝 **Updated Files**

I've updated these files to fix the deployment:

- ✅ `vercel.json` - Points to documentation build
- ✅ `build-docs.js` - Automated build script  
- ✅ `package.json` - Updated build commands
- ✅ `docs/next.config.js` - Static export configuration

## 🚨 **Alternative: Deploy Documentation Separately**

**Best Practice:** Deploy docs as a separate project:

1. **Create new GitHub repo:** `formax-ui-docs`
2. **Copy docs folder content** to new repo
3. **Deploy to Vercel** as Next.js project
4. **Update main repo README** with docs URL

This separates library development from documentation hosting.

## 🔄 **Current Deployment Status**

Your deployment failed because:
- ❌ Vercel built the library (`rollup -c`)
- ❌ No `public` folder was created  
- ❌ Static export wasn't configured

After applying these fixes:
- ✅ Vercel will build the documentation site
- ✅ `public` folder will contain static HTML/CSS/JS
- ✅ Documentation will be accessible at your domain

## 🚀 **Next Steps**

1. **Test the build script locally:**
   ```bash
   node build-docs.js
   ```

2. **If successful, commit and push:**
   ```bash
   git add .
   git commit -m "Fix Vercel deployment configuration"
   git push
   ```

3. **Redeploy on Vercel** - it should work now!

## 🆘 **If Still Having Issues**

Try this debug approach:

```bash
# Check docs build works
cd docs
npm install
npm run build
ls -la out/  # Should see HTML files

# Check root build script
cd ..
node build-docs.js
ls -la public/  # Should see copied files
```

The documentation should then deploy successfully! 🎉 