/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Create Auth Context
const AuthContext = createContext({});

// eslint-disable-next-line react-refresh/only-export-components
// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sign up new user
  const signup = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: (displayName || '').trim(),
      role: 'user',
      viewerEmails: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return userCredential;
  };

  // Sign in existing user
  const login = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
  };

  // Sign out user
  const logout = async () => {
    return await signOut(auth);
  };

  const normalizeRole = (role) => {
    if (typeof role !== 'string') return 'user';
    const normalized = role.trim().toLowerCase();
    return normalized || 'user';
  };

  // Fetch user profile from Firestore
  const fetchUserProfile = useCallback(async (uid, email) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid,
          email: data.email || email || '',
          displayName: data.displayName || '',
          role: normalizeRole(data.role),
          viewerEmails: Array.isArray(data.viewerEmails) ? data.viewerEmails : [],
        };
      }

      // Auto-create profile for old users who may not have a document yet
      const defaultProfile = {
        uid,
        email: email || '',
        displayName: '',
        role: 'user',
        viewerEmails: [],
      };
      await setDoc(doc(db, 'users', uid), {
        ...defaultProfile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });
      return defaultProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  const refreshUserProfile = async () => {
    if (!currentUser) return;
    const profile = await fetchUserProfile(currentUser.uid, currentUser.email);
    setUserProfile(profile);
    setUserRole(profile?.role || null);
  };

  const updateProfile = async (updates) => {
    if (!currentUser) return;
    const safeDisplayName = typeof updates?.displayName === 'string' ? updates.displayName.trim() : '';
    await updateDoc(doc(db, 'users', currentUser.uid), {
      displayName: safeDisplayName,
      updatedAt: serverTimestamp(),
    });
    await refreshUserProfile();
  };

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setRoleLoaded(false);
      
      if (user) {
        // Fetch and set user role/profile
        const profile = await fetchUserProfile(user.uid, user.email);
        setUserProfile(profile);
        setUserRole(profile?.role || null);
        setRoleLoaded(true);
      } else {
        setUserProfile(null);
        setUserRole(null);
        setRoleLoaded(true);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [fetchUserProfile]);

  const value = {
    currentUser,
    userRole,
    userProfile,
    signup,
    login,
    logout,
    refreshUserProfile,
    updateProfile,
    roleLoaded,
    isAdmin: userRole === 'admin' || userRole === 'user',
    isViewer: userRole === 'viewer'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
