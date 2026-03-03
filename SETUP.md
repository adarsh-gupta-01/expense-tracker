# Quick Setup Guide

## 🚀 Getting Started in 5 Minutes

### 1. Install Dependencies (1 min)
```bash
npm install
```

### 2. Firebase Setup (2 min)

#### Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Enter project name, click Continue
4. Disable Google Analytics (or enable if you want)
5. Click "Create project"

#### Enable Authentication
1. In Firebase Console, click "Authentication"
2. Click "Get started"
3. Click "Email/Password"
4. Enable "Email/Password"
5. Click "Save"

#### Enable Firestore
1. Click "Firestore Database"
2. Click "Create database"
3. Select "Start in production mode"
4. Choose location (closest to you)
5. Click "Enable"

#### Get Configuration
1. Click Settings icon (gear) > Project settings
2. Scroll to "Your apps" section
3. Click Web icon (`</>`)
4. Register app name: "Expense Tracker"
5. Copy the config values

### 3. Configure Environment (1 min)

Create `.env` file:
```bash
copy .env.example .env
```

Paste your Firebase config:
```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-app
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc123
```

### 4. Deploy Security Rules (1 min)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init firestore
# Select your project
# Press Enter for default files

# Deploy rules
firebase deploy --only firestore:rules
```

### 5. Create Admin User

#### Option A: Using Firebase Console (Easiest)

1. Run the app:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000

3. In Firebase Console > Authentication > Users:
   - Click "Add user"
   - Email: your-email@example.com
   - Password: your-password
   - Click "Add user"
   - **Copy the UID**

4. In Firebase Console > Firestore Database:
   - Click "Start collection"
   - Collection ID: `users`
   - Click "Next"
   - Document ID: **paste the UID**
   - Add fields:
     ```
     uid: [paste UID]
     email: your-email@example.com
     role: admin
     createdAt: [click "timestamp" type, use current time]
     ```
   - Click "Save"

5. Now you can login with your email and password!

#### Option B: Sign Up Method

1. Temporarily modify security rules in Firebase Console:
   ```javascript
   match /users/{userId} {
     allow create: if request.auth != null;  // Temporary!
   }
   ```

2. Try signing up (will create auth but fail on Firestore)

3. Create user document manually as above

4. **Important**: Restore original rules by deploying:
   ```bash
   firebase deploy --only firestore:rules
   ```

### 6. Create Viewer User (Father's Account)

Repeat the same process but set role to `viewer` instead of `admin`.

---

## ✅ Verification Checklist

- [ ] `npm install` completed successfully
- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore database created
- [ ] `.env` file configured with Firebase config
- [ ] Firestore rules deployed
- [ ] Admin user created (can see "Add Expense" menu)
- [ ] Viewer user created (cannot see "Add Expense" menu)
- [ ] Can add expenses as admin
- [ ] Can view expenses as both users
- [ ] Real-time updates work
- [ ] Charts display correctly
- [ ] PDF export works

---

## 🔧 Common Issues

### "Permission denied" error
- Check security rules are deployed
- Verify user document exists in Firestore with correct role

### "Firebase config is invalid"
- Check all env variables start with `VITE_`
- Restart dev server after changing .env
- Verify values are correct (no quotes in .env)

### Can't see "Add Expense" menu
- Verify user role is "admin" in Firestore
- Check user document UID matches auth UID

### Charts not showing
- Add some expenses first
- Check browser console for errors
- Verify date format is YYYY-MM-DD

---

## 📱 Share with Father

Once deployed:

1. Share the URL (e.g., https://your-app.web.app)
2. Share his viewer credentials
3. Tell him to:
   - Open URL on phone browser
   - Login with credentials
   - (Optional) Add to home screen for app-like experience

---

## 🎯 Next Steps

1. **Deploy to production**: See DEPLOYMENT.md
2. **Add more categories**: Edit `CATEGORIES` in AddExpense.jsx
3. **Customize colors**: Edit tailwind.config.js
4. **Add more charts**: Extend Analytics.jsx
5. **Set up backups**: Firebase Console > Firestore > Backups

---

## 📞 Need Help?

Check these files:
- **README.md** - Full documentation
- **DEPLOYMENT.md** - Deployment guides
- **Firebase Console** - Check for errors

Common commands:
```bash
npm run dev          # Start development
npm run build        # Build for production
npm run preview      # Preview production build
firebase deploy      # Deploy to Firebase
```
