import React, { createContext, useContext, useEffect, useState } from 'react';
// import { auth } from '../config/firebase.config';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  getAuth,
  User,
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';


// Firebase config - Replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyAf0iSGpvKmCGHxutyvBsw4dvNXt-kCzaQ",
  authDomain: "waterwise-app-29b7d.firebaseapp.com",
  projectId: "waterwise-app-29b7d",
  storageBucket: "waterwise-app-29b7d.firebasestorage.app",
  messagingSenderId: "500572611978",
  appId: "1:500572611978:web:161a1b588c96c127319473",
  measurementId: "G-F701ZNJ0FB"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}