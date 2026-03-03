# 💰 Expense Tracker

A modern, full-featured expense tracking web app built with React and Firebase. Track spending, split bills with family, visualize analytics, upload profile photos, and export PDF reports — all in a clean, responsive interface.

> **Live Demo**: Deployed on [Vercel](https://vercel.com) with auto-deploy from GitHub

---

## ✨ Features

### 🔐 Authentication
- **Google Sign-In** — One-click login via Google OAuth (no email/password forms)
- **Auto Profile Creation** — New users get a Firestore profile on first sign-in
- **Role-Based Access** — `admin` (full access) and `viewer` (read-only) roles
- **Protected Routes** — Unauthenticated users are redirected to login

### 📊 Dashboard
- Monthly expense overview with real-time Firestore updates
- Today's spending, monthly total, and category-wise breakdown
- Chronological expense list with quick filtering
- Month navigation to browse past records

### ➕ Add Record
- Quick expense entry with amount, category, description, and date
- Expense types: **Personal**, **Lent**, **Borrowed**
- Form validation and instant success feedback
- Categories: Food, Travel, Recharge, Shopping, Other

### 📈 Analytics
- **Pie Chart** — Category-wise spending distribution
- **Bar Chart** — Daily spending trends
- Month selector for historical analysis
- Summary table with detailed breakdown

### 📄 PDF Export
- Generate professional monthly expense reports
- Includes all expense details, category totals, and summary
- Powered by jsPDF + AutoTable

### 👥 Sharing & Collaboration
- **Share Expenses** — Share your expense data with other users by email
- **Shared With Me** — View expenses shared by family/friends
- Real-time sync across all shared users

### 👤 Profile
- **Profile Photo Upload** — Click avatar to upload a photo (compressed & stored in Firestore)
- **Display Name** — Editable name shown across the app
- Email and role info display

### 🧭 Sidebar & Navigation
- **Desktop** — Static sidebar with logo, user avatar, name, email, role, and nav links
- **Mobile** — Hamburger menu with slide-in sidebar
- Profile photo displayed in both mobile header and sidebar
- **Logout Confirmation** — Modal prompt before signing out
- Red hover effect on logout button

### 🎨 UI/UX
- Clean white + gray design with Google-style login button
- Custom brand logo (responsive across all breakpoints)
- Smooth animations and transitions
- Fully responsive — works on mobile, tablet, and desktop
- Inter font for modern typography

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + Vite |
| **Styling** | Tailwind CSS |
| **Auth** | Firebase Authentication (Google OAuth) |
| **Database** | Cloud Firestore (real-time) |
| **Charts** | Chart.js + react-chartjs-2 |
| **PDF** | jsPDF + jspdf-autotable |
| **Icons** | react-icons (Font Awesome) |
| **Routing** | React Router v6 |
| **Dates** | date-fns |
| **Hosting** | Vercel (auto-deploy from GitHub) |

---

## 📁 Project Structure

```
expense/
├── public/
├── src/
│   ├── components/
│   │   ├── Login.jsx          # Google sign-in page
│   │   ├── Dashboard.jsx      # Main dashboard with expense list
│   │   ├── AddExpense.jsx     # Add new expense form
│   │   ├── Analytics.jsx      # Charts and visual insights
│   │   ├── SharingSettings.jsx # Share expenses with others
│   │   ├── SharedWithMe.jsx   # View shared expenses
│   │   ├── Profile.jsx        # Profile photo upload + name edit
│   │   ├── Sidebar.jsx        # Responsive sidebar navigation
│   │   ├── ProtectedRoute.jsx # Auth guard wrapper
│   │   └── logo.png           # Brand logo
│   ├── context/
│   │   └── AuthContext.jsx     # Global auth state + profile management
│   ├── config/
│   │   └── firebase.js         # Firebase initialization
│   └── App.jsx                 # Routes and layout
├── vercel.json                 # SPA rewrite rules for Vercel
├── package.json
└── .env                        # Firebase config (not committed)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- Firebase project with **Authentication** and **Firestore** enabled
- Google sign-in provider enabled in Firebase

### 1. Clone & Install

```bash
git clone https://github.com/adarsh-gupta-01/expense-tracker.git
cd expense-tracker
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) → Create/select project
2. **Authentication** → Sign-in method → Enable **Google** provider
3. **Firestore Database** → Create database in production mode
4. **Authentication** → Settings → **Authorized domains** → Add your deployment domain

### 3. Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Create Admin User

1. Start the dev server: `npm run dev`
2. Sign in with Google
3. Go to Firebase Console → **Firestore** → `users` collection
4. Find your user document (ID = your Auth UID)
5. Set the `role` field to `"admin"`

### 5. Run

```bash
npm run dev        # Development server at http://localhost:5173
npm run build      # Production build
npm run preview    # Preview production build
```

---

## 🌐 Deployment (Vercel)

This project auto-deploys to Vercel on every push to `main`.

### Manual Setup

1. Import the GitHub repo in [Vercel Dashboard](https://vercel.com)
2. Add all `VITE_FIREBASE_*` environment variables in Vercel → Project Settings → Environment Variables
3. Add your Vercel domain to Firebase → Authentication → Settings → **Authorized domains**

The included `vercel.json` handles SPA client-side routing (no 404 on refresh).

---

## 📊 Database Schema

### `users` Collection
```js
{
  uid: string,           // Firebase Auth UID
  email: string,         // User email
  displayName: string,   // Editable display name
  photoURL: string,      // Profile photo (base64 data URL)
  role: "admin" | "user" | "viewer",
  viewerEmails: string[],// Emails this user shares with
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `expenses` Collection
```js
{
  amount: number,
  category: "Food" | "Travel" | "Recharge" | "Shopping" | "Other",
  type: "personal" | "lent" | "borrowed",
  description: string,
  date: string,          // YYYY-MM-DD
  createdAt: timestamp,
  createdBy: string      // User UID
}
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Google sign-in popup closes immediately | Add your domain to Firebase → Auth → Authorized domains |
| 404 on page refresh (Vercel) | Ensure `vercel.json` exists with SPA rewrites |
| Permission denied on Firestore | Check user doc exists in `users` collection with correct `role` |
| Profile photo stuck on "Uploading" | Photo is stored as base64 in Firestore — no Firebase Storage setup needed |
| Build errors | Run `rm -rf node_modules && npm install` then `npm run build` |

---

## 📄 License

Private project — for personal use.

## 👨‍💻 Author

Built by [Adarsh Gupta](https://github.com/adarsh-gupta-01)
