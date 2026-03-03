# Project Structure

```
expense/
│
├── public/
│   └── vite.svg                    # App favicon/logo
│
├── src/
│   ├── components/
│   │   ├── AddExpense.jsx          # Form to add new expenses (admin only)
│   │   ├── Analytics.jsx           # Charts and analytics page
│   │   ├── Dashboard.jsx           # Main dashboard with stats
│   │   ├── Login.jsx               # Login page
│   │   ├── ProtectedRoute.jsx      # Route guard for authentication
│   │   └── Sidebar.jsx             # Navigation sidebar
│   │
│   ├── context/
│   │   └── AuthContext.jsx         # Authentication state management
│   │
│   ├── config/
│   │   └── firebase.js             # Firebase initialization
│   │
│   ├── utils/
│   │   └── pdfExport.js            # PDF generation utility
│   │
│   ├── App.jsx                     # Main app component with routing
│   ├── main.jsx                    # React entry point
│   └── index.css                   # Global styles and Tailwind
│
├── .env                            # Environment variables (create this!)
├── .env.example                    # Example environment file
├── .eslintrc.cjs                   # ESLint configuration
├── .gitignore                      # Git ignore rules
│
├── firebase.json                   # Firebase configuration
├── firestore.indexes.json          # Firestore indexes
├── firestore.rules                 # Firestore security rules
│
├── index.html                      # HTML entry point
├── package.json                    # Dependencies and scripts
├── postcss.config.js               # PostCSS configuration
├── tailwind.config.js              # Tailwind CSS configuration
├── vite.config.js                  # Vite build configuration
│
├── README.md                       # Main documentation
├── SETUP.md                        # Quick setup guide
├── DEPLOYMENT.md                   # Deployment instructions
├── FEATURES.md                     # Feature documentation
├── COMMANDS.md                     # Command reference
└── PROJECT_STRUCTURE.md            # This file
```

## 📁 Directory Details

### `/public`
Static assets served directly. Contains favicon and other public files.

### `/src/components`
React components for UI:
- **AddExpense.jsx**: Expense creation form with validation
- **Analytics.jsx**: Charts (Pie & Bar) and category analysis
- **Dashboard.jsx**: Main view with stats and expense list
- **Login.jsx**: Authentication page
- **ProtectedRoute.jsx**: Authentication guard wrapper
- **Sidebar.jsx**: Navigation menu (responsive)

### `/src/context`
React Context for state management:
- **AuthContext.jsx**: User authentication state and functions

### `/src/config`
Configuration files:
- **firebase.js**: Firebase initialization and service exports

### `/src/utils`
Utility functions:
- **pdfExport.js**: PDF report generation logic

### Root Configuration Files

| File | Purpose |
|------|---------|
| `.env` | Environment variables (you create this) |
| `.env.example` | Template for environment variables |
| `.eslintrc.cjs` | ESLint code quality rules |
| `.gitignore` | Files to ignore in Git |
| `firebase.json` | Firebase project configuration |
| `firestore.rules` | Database security rules |
| `firestore.indexes.json` | Database indexes |
| `index.html` | HTML template |
| `package.json` | Dependencies and scripts |
| `postcss.config.js` | PostCSS plugins (Tailwind) |
| `tailwind.config.js` | Tailwind customization |
| `vite.config.js` | Vite build tool config |

### Documentation Files

| File | Content |
|------|---------|
| `README.md` | Complete project documentation |
| `SETUP.md` | Step-by-step setup guide |
| `DEPLOYMENT.md` | Deployment instructions |
| `FEATURES.md` | Detailed feature list |
| `COMMANDS.md` | Command reference |
| `PROJECT_STRUCTURE.md` | This file |

## 🔄 Data Flow

```
User Input (Login/Add Expense)
        ↓
React Component (Login.jsx/AddExpense.jsx)
        ↓
Firebase Service (firebase.js)
        ↓
Firestore Database
        ↓
Real-time Listener (onSnapshot)
        ↓
Update Component State
        ↓
Re-render UI
```

## 🔐 Authentication Flow

```
Login Page → Firebase Auth → Success → Check Firestore for Role → Set Auth Context → Redirect to Dashboard
                          ↓
                        Failure → Show Error
```

## 📊 Component Hierarchy

```
App.jsx
├── Router
│   ├── Login.jsx (public route)
│   └── ProtectedRoute
│       └── AppLayout
│           ├── Sidebar.jsx
│           └── Content
│               ├── Dashboard.jsx
│               ├── AddExpense.jsx (admin only)
│               └── Analytics.jsx
```

## 🗄️ Database Collections

### `users`
```
users/{uid}
  - uid: string
  - email: string
  - role: "admin" | "viewer"
  - createdAt: timestamp
```

### `expenses`
```
expenses/{id}
  - amount: number
  - category: string
  - description: string
  - date: string (YYYY-MM-DD)
  - createdAt: timestamp
  - createdBy: string (user uid)
```

## 🎨 Styling Architecture

```
index.css
  ↓
Tailwind Base Styles (@tailwind base)
  ↓
Custom Component Classes (@layer components)
  ↓
Tailwind Utilities (@tailwind utilities)
  ↓
Component-specific styles (inline with className)
```

## 🔧 Build Process

```
Source Code (src/)
        ↓
Vite Development Server (npm run dev)
        ↓
Hot Module Replacement
        ↓
Browser (localhost:3000)

OR

Source Code (src/)
        ↓
Vite Build (npm run build)
        ↓
Transpile, Bundle, Minify
        ↓
Output (dist/)
        ↓
Deploy to Hosting
```

## 📦 Key Dependencies

### Production
- `react` & `react-dom` - UI framework
- `react-router-dom` - Routing
- `firebase` - Backend services
- `chart.js` & `react-chartjs-2` - Charts
- `jspdf` & `jspdf-autotable` - PDF export
- `date-fns` - Date utilities
- `react-icons` - Icon library

### Development
- `vite` - Build tool
- `tailwindcss` - CSS framework
- `autoprefixer` & `postcss` - CSS processing
- `eslint` - Code linting

## 🚀 Deployment Artifacts

After `npm run build`:

```
dist/
├── assets/
│   ├── index-[hash].js      # Bundled JavaScript
│   ├── index-[hash].css     # Bundled CSS
│   └── [images/fonts]       # Optimized assets
└── index.html               # HTML entry point
```

This `/dist` folder is what you deploy to hosting.

## 🔍 File Sizes (Approximate)

- Total project: ~150 MB (with node_modules)
- node_modules: ~140 MB
- Source code: ~100 KB
- Build output (dist): ~500 KB
- Deployed size: ~200 KB (gzipped)

## 📝 Important Notes

1. **Never commit `.env`** - Contains sensitive Firebase config
2. **Always commit `.env.example`** - Template for others
3. **Deploy `firestore.rules`** - Essential for security
4. **Build before deploy** - Always use production build
5. **Test locally** - Use `npm run preview` before deploying

## 🔗 File Dependencies

```
main.jsx imports App.jsx
App.jsx imports:
  - AuthContext.jsx
  - All component files
  - react-router-dom

Components import:
  - firebase.js (for database operations)
  - AuthContext.jsx (for user state)
  - Utility files as needed

firebase.js imports:
  - Firebase SDK packages
  - Environment variables from .env
```

## 🎯 Quick Navigation

| Need to... | Edit this file |
|-----------|---------------|
| Add/remove categories | `src/components/AddExpense.jsx` |
| Change colors/theme | `tailwind.config.js` |
| Modify security rules | `firestore.rules` |
| Add new page/route | `src/App.jsx` + new component |
| Change Firebase config | `.env` |
| Add dependencies | `package.json` (run npm install) |
| Customize PDF format | `src/utils/pdfExport.js` |
| Modify navigation | `src/components/Sidebar.jsx` |

---

**Keep this structure for maintainability and scalability!**
