# Expense Tracker

A production-ready web application for personal expense tracking with real-time updates, role-based access control, analytics, and PDF export capabilities.

## 🚀 Features

- **Real-time Updates**: Expenses update instantly across all devices using Firebase Firestore
- **Role-Based Access**: Admin can manage expenses, Viewer can only view
- **Dashboard**: Monthly overview with statistics and breakdowns
- **Analytics**: Visual charts (Pie & Bar) for spending insights
- **PDF Export**: Generate monthly expense reports
- **Mobile Responsive**: Works seamlessly on all devices
- **Secure Authentication**: Firebase Authentication with role management

## 📋 Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **Backend**: Firebase (Firestore + Authentication)
- **PDF Generation**: jsPDF with autotable
- **Routing**: React Router v6
- **Date Handling**: date-fns

## 🛠️ Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Step 1: Clone and Install

```bash
# Navigate to project directory
cd expense

# Install dependencies
npm install
```

### Step 2: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable **Authentication**:
   - Go to Authentication > Sign-in method
   - Enable "Email/Password" provider
4. Enable **Firestore Database**:
   - Go to Firestore Database
   - Create database in production mode
   - Choose a location closest to you

### Step 3: Get Firebase Configuration

1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click on Web icon (`</>`) to create a web app
4. Register your app with a nickname (e.g., "Expense Tracker")
5. Copy the configuration values

### Step 4: Configure Environment Variables

1. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```

2. Edit `.env` file and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### Step 5: Deploy Firestore Security Rules

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init firestore
   ```
   - Select your Firebase project
   - Accept the default `firestore.rules` file
   - Accept the default `firestore.indexes.json` file

4. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

### Step 6: Create Admin User

Since the security rules require an admin to create users, you need to manually create the first admin user:

1. Run the development server:
   ```bash
   npm run dev
   ```

2. Temporarily modify the security rules in Firebase Console to allow user creation:
   ```javascript
   match /users/{userId} {
     allow create: if isAuthenticated(); // Temporarily allow any authenticated user
   }
   ```

3. Sign up through the app (it will fail to create user doc, but will create auth user)

4. Go to Firebase Console > Firestore Database

5. Manually create a document in the `users` collection:
   - Document ID: (your Firebase Auth UID - found in Authentication > Users)
   - Fields:
     ```
     uid: (your Firebase Auth UID)
     email: (your email)
     role: "admin"
     createdAt: (current timestamp)
     ```

6. Restore the original security rules (deploy `firestore.rules` again)

7. Create viewer account for your father:
   - Use the same signup process
   - Manually set role to "viewer" in Firestore

**Alternative Method**: Use Firebase Admin SDK or Cloud Functions to create users programmatically.

## 🚀 Development

Start the development server:

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 📦 Production Build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 🌐 Deployment

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variables in Vercel dashboard:
   - Go to Project Settings > Environment Variables
   - Add all `VITE_FIREBASE_*` variables

### Deploy to Firebase Hosting

1. Install Firebase CLI (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Initialize Firebase Hosting:
   ```bash
   firebase init hosting
   ```
   - Select your project
   - Set `dist` as the public directory
   - Configure as single-page app: Yes
   - Don't overwrite index.html

4. Deploy:
   ```bash
   firebase deploy --only hosting
   ```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 📱 Usage

### Admin User (You)
- Login with admin credentials
- Add new expenses with amount, category, description, and date
- View dashboard with real-time updates
- See analytics with charts
- Download monthly PDF reports
- Delete expenses

### Viewer User (Father)
- Login with viewer credentials
- View all expenses in real-time
- See dashboard statistics
- View analytics and charts
- Download PDF reports
- Cannot add, edit, or delete expenses

## 🔒 Security

- All data is protected by Firestore security rules
- Only authenticated users can access data
- Admins can write, viewers can only read
- Firebase handles authentication securely
- Environment variables keep sensitive config private

## 📊 Database Structure

### Users Collection
```javascript
{
  uid: string,
  email: string,
  role: "admin" | "viewer",
  createdAt: timestamp
}
```

### Expenses Collection
```javascript
{
  amount: number,
  category: "Food" | "Travel" | "Recharge" | "Shopping" | "Other",
  description: string,
  date: string (YYYY-MM-DD),
  createdAt: timestamp,
  createdBy: string (user uid)
}
```

## 🎨 Features Overview

1. **Dashboard**: Monthly total, today's spending, category breakdown, expense list
2. **Add Expense**: Form with validation and success feedback
3. **Analytics**: Pie chart (categories), Bar chart (daily trend), summary table
4. **PDF Export**: Professional monthly reports with all details
5. **Month Filter**: Navigate between months easily
6. **Real-time Sync**: Changes reflect immediately on all devices

## 🐛 Troubleshooting

### Firebase Authentication Errors
- Ensure Email/Password provider is enabled in Firebase Console
- Check that Firebase config in `.env` is correct

### Firestore Permission Denied
- Verify security rules are deployed correctly
- Make sure user document exists in `users` collection with correct role
- Check that user is authenticated

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

### Charts Not Displaying
- Check that expenses exist for the selected month
- Verify Chart.js components are registered correctly

## 📄 License

This project is private and for personal use only.

## 👨‍💻 Author

Built with ❤️ for personal expense tracking

## 🤝 Support

For issues or questions, please check:
1. Firebase Console for authentication/database errors
2. Browser console for JavaScript errors
3. Network tab for API call failures
