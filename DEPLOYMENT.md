# Expense Tracker - Deployment Guide

Complete guide to deploy your multi-user expense tracking application to production.

## 📋 Pre-Deployment Checklist

- [ ] Firebase project created and configured
- [ ] Firestore database initialized
- [ ] Firebase Authentication enabled (Email/Password)
- [ ] Firestore security rules deployed
- [ ] `.env` file created with all Firebase credentials
- [ ] Application tested locally (`npm run dev`)
- [ ] Production build tested (`npm run build && npm run preview`)
- [ ] Admin user account created
- [ ] Sidebar and header display correctly
- [🛠️ Prerequisites

```bash
# Install Node.js (v16 or higher)
Best choice since you're already using Firebase.

#### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

#### Step 2: Authenticate

```bash
firebase login
```

#### Step 3: Initialize Firebase

```bash
firebase init hosting
```

When prompted:
- **Project**: Select your existing Firebase project
- **Public directory**: `dist`
- **Configure SPA**: Yes
- **Automatic builds**: No
- **Overwrite index.html**: No

#### Step 4: Test Locally

```bash
npm run build
npm run preview
```

Visit `http://localhost:4173` to verify production build.

#### Step 5: Deploy

```bash
npm run build
firebase deploy --only hosting
```

Your app will be available at: `https://your-project-id.web.app`

#### Step 6: Add Custom Domain (Optional)

1. Open Firebase Console
2. Go to Hosting
3. Click "Add custom domain"
4. Follow DNS setup instructions
Great performance and easy deployment.

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Deploy

```bash
vercel
```

Answer prompts:
- Scope: Your account
- Project name: `expense-tracker`
- Directory: `./` (current)
- Build command: `npm run build`
- Output directory: `dist`

#### Step 3: Add Environment Variables

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project > Settings > Environment Variables
3. Add all `VITE_FIREBASE_*` variables from `.env.local`
4. Redeploy: `vercel --prod`

---# Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Deploy

```bash
vercel
```

Follow the prompts:
- Set up and deploy: Yes
- Scope: Your account
Easy drag-and-drop or CLI deployment.

#### Method A: Using Netlify CLI

```bash
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --prod
```

#### Method B: Using Netlify UI

1. Go to [Netlify](https://netlify.com)
2. Sign up / Log in
3. Drag and drop `dist` folder
4. Go to Settings > Build & deploy > Environment
5. Add environment variables

Add all `VITE_FIREBASE_*` variables before deploying.

---
```

#### Step 2: Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### Step 3: Deploy

```bash
netlify deploy
```

For production:

```bash
netlify deploy --prod
```

#### Step 4: Add Environment Variables

1. Go to Netlify Dashboard
2. Select your site
3. Go to Site settings > Build & deploy > Environment
4. Add all `VITE_FIREBASE_*` variables

## 🔐 Security Configuration

### Firebase Security Rules

Ensure your Firestore security rules are deployed:

```bash
firebase deploy --only firestore:rules
```

Verify rules in Firebase Console > Firestore Database > Rules

### EnFirestore Security Rules

Deploy security rules:

```bash
firebase deploy --only firestore:rules
```

Current rules configuration allows:
- Users to create/read their own records (`ownerUid` validation)
- Users to access shared records (via `accessEmails` array)
- Proper email-based sharing

Verify in Firebase Console > Firestore > Rules tab.

---

## 👥 Managing Users

### Create First Admin (Firebase Console)

1. Go to Firebase Console > Authentication
2. Click "Add user"
3. Enter email and temporary password
4. Copy the UID
5. Go to Firestore > Create collection `users`
6. Create document with ID = UID:
   ```
   uid: [the UID]
   email: [user email]
   role: "admin"
   displayName: "Your Name"
   viewerEmails: [] (empty array for now)
   createdAt: [current timestamp]
   ```

### User Self-Registration

Users can sign up via `/signup` route. The app automatically:
- Creates Firebase Auth user
- Creates Firestore `users` document
- Sets `role: "viewer"` by default
- Initializes empty `viewerEmails` array

---

## 📱 Sharing Setup

Users can share their expenses:

1. Log in to their account
2. Go to "Sharing" menu
3. Enter email address of person to share with
4. That person can now see shared records under "Shared With Me"

Both users can view shared analytics and dashboards.ush:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: ${{ secrets.FIREBASE_PROJECT_ID }}
```

Add secrets in GitHub repository settings.

## 🧪 Testing Production Build

Before deploying, test locally:

```bash
# Build the project
npm run build

# Preview the build
npm run preview
```

Visit `http://localhost:4173` to test the production build.

## 📱 Mobile Access

For your father to access on mobile:

1. Share the deployed URL (e.g., `https://your-app.web.app`)
2. He can:
   - Access via mobile browser
   - Add to home screen for app-like experience:
     - **iOS**: Safari > Share > Add to Home Screen
     - **Android**: Chrome > Menu > Add to Home Screen

## 🔧 Post-Deployment Tasks

- [ ] Test login for both admin and viewer accounts
- [ ] Verify expense creation and real-time updates
- [ ] Test PDF export functionality
- [ ] Check mobile responsiveness
- [ ] Verify security rules are enforced
- [ ] Set up regular backups (Firebase Console > Firestore > Backups)
- [ ] Configure monitoring and alerts

## ⚡ Performance Optimization

### Enable Caching

Add to `firebase.json`:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}e-Deployment

### Local Testing

```bash
# Start dev server
npm run dev

# Test all features:
# - Signup with test email (e.g., test1@example.com)
# - Add expense/lend/borrow records
# - Check Analytics and Dashboard
# - Test Sharing feature
# - Edit Profile
# - Test on mobile (DevTools > Responsive Design Mode)
```

### Production Build Testing

```bash
npm run build
npm run preview
# Visit http://localhost:4173
# Test all features again
```

---

## 📊 Post-Deployment Tasks

- [ ] Test signup with new email
- [ ] Verify login works
- [ ] Test adding expenses
- [ ] Test analytics charts loading
- [ ] Test PDF export
- [ ] Verify sharing between two users
- [ ] Test mobile layout
- [ ] Check console for errors (F12)
- [ ] Test on different browsers
- [ ] Verify Firestore rules are enforcedrebase.google.com/docs)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)

## ✅ Quick Deploy  (Firebase)

Create/update `firebase.json`:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|png|jpg|jpeg|gif|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000,immutable"
          }
        ]
      },
      {
        "source": "/index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=3600"
          }
        ]
      }
    ]
  }
}
```

---

## 📞 Accessing as End User

Share this URL with your father/viewer:

```
https://your-app-domain.web.app
```

He can:
- **Desktop**: Open URL in any browser
- **Mobile**: Open in browser or add to home screen
  - **iOS**: Safari > Share > Add to Home Screen
  - **Android**: Chrome > Menu > Add to Home Screen

---
---

## 📈 Monitoring

### Firebase Console Monitoring

- **Firestore**: Check read/write counts, database size
- **Authentication**: Monitor active users, sign-up trends
- **Hosting**: Check bandwidth, traffic

### Enable Analytics (Optional)

```bash
firebase deploy --only analytics
```

---

## 🔄 Continuous Deployment (Optional)

### GitHub Actions Auto-Deploy

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          projectId: ${{ secrets.FIREBASE_PROJECT_ID }}
```

Add secrets to GitHub repo Settings > Secrets.

---

## 📚 Useful Links

- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)

---

## ✅ Quick Deploy Checklist

**Firebase Hosting (Recommended):**
```bash
firebase login
firebase init hosting
npm run build
firebase deploy --only hosting
```

**Vercel:**
```bash
npm install -g vercel
vercel --prod
```

**Netlify:**
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod
```

---

**Last Updated**: March 3, 2026
**App Version**: 1.0.0 (Multi-user with sharing)
**Stack**: React 18 + Vite + Firebase + Tailwind CSS
- Check Network tab in DevTools
- Verify Firebase connection
- Check Firestore read/write operations
- Enable browser cache (verify `firebase.json` headers)

### Sharing Not Working

- Verify viewer email is valid
- Check `accessEmails` array in Firestore record
- Verify security rules are deployed: `firebase deploy --only firestore:rules`
- Check Firestore rules in Console > Firestore > Rules tab