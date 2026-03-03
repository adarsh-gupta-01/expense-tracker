/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
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

  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });

  // Sign in / sign up with Google
  const signInWithGoogle = async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const existingData = userDoc.data();
      const updates = {
        email: user.email || '',
        displayName: (user.displayName || '').trim(),
        updatedAt: serverTimestamp(),
      };
      // Only set Google photoURL if user hasn't uploaded a custom one
      if (!existingData.photoURL && user.photoURL) {
        updates.photoURL = user.photoURL;
      }
      await updateDoc(userRef, updates);
    } else {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || '',
        displayName: (user.displayName || '').trim(),
        photoURL: user.photoURL || '',
        role: 'user',
        viewerEmails: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return userCredential;
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
          photoURL: data.photoURL || '',
          role: normalizeRole(data.role),
          viewerEmails: Array.isArray(data.viewerEmails) ? data.viewerEmails : [],
        };
      }

      // Auto-create profile for old users who may not have a document yet
      const defaultProfile = {
        uid,
        email: email || '',
        displayName: '',
        photoURL: '',
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

  const updateProfilePhoto = async (file) => {
    if (!currentUser || !file) return;

    // Compress and convert to base64 data URL (stored in Firestore directly)
    const dataURL = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 200; // max dimension in px
          let w = img.width, h = img.height;
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    await updateDoc(doc(db, 'users', currentUser.uid), {
      photoURL: dataURL,
      updatedAt: serverTimestamp(),
    });
    await refreshUserProfile();
    return dataURL;
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
    signInWithGoogle,
    logout,
    refreshUserProfile,
    updateProfile,
    updateProfilePhoto,
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
