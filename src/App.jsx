import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import AddExpense from './components/AddExpense';
import Analytics from './components/Analytics';
import SharingSettings from './components/SharingSettings';
import SharedWithMe from './components/SharedWithMe';
import Profile from './components/Profile';
import ProtectedRoute from './components/ProtectedRoute';

// Layout wrapper for authenticated pages
const AppLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar - Always on left on desktop, hidden on mobile */}
      <Sidebar />
      
      {/* Main Content - Full width on mobile with top padding for header, flex-1 on desktop */}
      <main className="flex-1 flex flex-col overflow-auto">
        {children}
      </main>
    </div>
  );
};

const LoginRoute = () => {
  const { currentUser } = useAuth();
  if (currentUser) {
    return <Navigate to="/" replace />;
  }
  return <Login />;
};

const SignupRoute = () => {
  const { currentUser } = useAuth();
  if (currentUser) {
    return <Navigate to="/" replace />;
  }
  return <Signup />;
};

// Main App Component
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Login Route */}
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/signup" element={<SignupRoute />} />
          
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/add-expense"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <AddExpense />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/sharing"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SharingSettings />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/shared-with-me"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <SharedWithMe />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Profile />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Analytics />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
