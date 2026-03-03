# Commands Reference

Quick reference for all important commands.

## 📦 Installation

```bash
# Install all dependencies
npm install

# Or using yarn
yarn install
```

## 🛠️ Development

```bash
# Start development server (http://localhost:3000)
npm run dev

# Start with specific port
npm run dev -- --port 3001

# Start and open browser automatically
npm run dev -- --open
```

## 🏗️ Build

```bash
# Build for production
npm run build

# Build and preview
npm run build && npm run preview

# Preview production build (after build)
npm run preview
```

## 🔥 Firebase Commands

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init

# Deploy everything
firebase deploy

# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# Deploy only Firestore indexes
firebase deploy --only firestore:indexes

# View deployed site
firebase open hosting:site
```

## 🧹 Cleaning

```bash
# Remove node_modules
rm -rf node_modules
# Or on Windows
rmdir /s /q node_modules

# Remove build directory
rm -rf dist

# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

## 🔍 Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint errors automatically
npm run lint -- --fix
```

## 📊 Firebase Emulators (Optional)

```bash
# Start Firebase emulators
firebase emulators:start

# Start specific emulators
firebase emulators:start --only firestore,auth
```

## 🚀 Deployment

### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to preview
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Firebase Hosting
```bash
# Build and deploy
npm run build
firebase deploy --only hosting

# Single command
npm run build && firebase deploy --only hosting
```

## 🔧 Troubleshooting

```bash
# Clear all caches and reinstall
rm -rf node_modules dist .vite package-lock.json
npm install

# Check npm version
npm --version

# Check Node version
node --version

# Update npm
npm install -g npm@latest

# Check for outdated packages
npm outdated

# Update packages
npm update
```

## 📝 Git Commands

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote
git remote add origin https://github.com/username/expense-tracker.git

# Push to GitHub
git push -u origin main

# Create .gitignore (already created)
# Ensure .env is in .gitignore!
```

## 🔐 Environment Setup

```bash
# Copy example env file
copy .env.example .env
# Or on Mac/Linux
cp .env.example .env

# Edit .env file
notepad .env
# Or
code .env
```

## 📱 Testing

```bash
# Run on local network (access from phone)
npm run dev -- --host

# This will show URLs like:
# Local:   http://localhost:3000
# Network: http://192.168.1.x:3000
# Use the Network URL on your phone
```

## 🔄 Update Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update package-name

# Update all packages
npm update

# Update to latest (breaking changes possible)
npx npm-check-updates -u
npm install
```

## 📊 Analyze Bundle Size

```bash
# Build with bundle analysis
npm run build -- --mode production

# Install bundle analyzer
npm install -D rollup-plugin-visualizer

# Add to vite.config.js and rebuild
```

## 🎨 Tailwind

```bash
# Regenerate Tailwind config
npx tailwindcss init -p

# Watch Tailwind changes (already handled by Vite)
```

## 🗄️ Firestore Management

### Using Firebase Console:
- Go to https://console.firebase.google.com
- Select your project
- Navigate to Firestore Database

### Backup Firestore (Manual):
```bash
# Export all data
gcloud firestore export gs://[BUCKET_NAME]

# Import data
gcloud firestore import gs://[BUCKET_NAME]/[EXPORT_FILE]
```

## 📖 Documentation

```bash
# Generate documentation (if using JSDoc)
npm install -D jsdoc
npx jsdoc src -r -d docs
```

## 🎯 Quick Tasks

### Add New Category:
1. Open `src/components/AddExpense.jsx`
2. Find `CATEGORIES` array
3. Add new category name
4. Save and rebuild

### Change Colors:
1. Open `tailwind.config.js`
2. Modify colors in `theme.extend.colors`
3. Save (Vite auto-reloads)

### Add New Route:
1. Create component in `src/components/`
2. Open `src/App.jsx`
3. Add route in `<Routes>` section
4. Add navigation link in `src/components/Sidebar.jsx`

## 🔒 Security Audit

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Force fix (may cause breaking changes)
npm audit fix --force
```

## 💾 Database Queries (Firebase Console)

```javascript
// In Firebase Console > Firestore > Start a query

// Get all expenses for a month
expenses.where('date', '>=', '2026-03-01')
        .where('date', '<=', '2026-03-31')
        .orderBy('date', 'desc')

// Get all admin users
users.where('role', '==', 'admin')

// Delete all expenses (be careful!)
// Use Firebase Console UI or batch delete in code
```

## 📞 Help

```bash
# Vite help
npm run dev -- --help

# Firebase help
firebase --help
firebase deploy --help

# npm help
npm help
npm help install
```

## ⚡ Pro Tips

```bash
# Use aliases for common commands (add to package.json scripts)
# Already included:
# "dev" = vite dev server
# "build" = production build
# "preview" = preview build

# Create custom script:
# "deploy": "npm run build && firebase deploy --only hosting"
# Then run: npm run deploy
```

## 🎓 Learn More

- **React**: https://react.dev
- **Vite**: https://vitejs.dev
- **Tailwind**: https://tailwindcss.com
- **Firebase**: https://firebase.google.com/docs
- **Chart.js**: https://www.chartjs.org
- **React Router**: https://reactrouter.com

---

**Note**: Replace `npm` with `yarn` or `pnpm` if using those package managers.

**Windows Users**: Use PowerShell or CMD with appropriate commands (e.g., `rmdir /s /q` instead of `rm -rf`)
