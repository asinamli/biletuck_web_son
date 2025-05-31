import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from 'firebase/auth';


const firebaseConfig = {
    apiKey: "AIzaSyCzKvkeOwQj5p-RRraEk-_ViXlLdsyVZ84",
    authDomain: "biletuck.firebaseapp.com",
    projectId: "biletuck",
    storageBucket: "biletuck.firebasestorage.app",
    messagingSenderId: "508461081926",
    appId: "1:508461081926:web:1ff545898e0f50f3b2b147",
    measurementId: "G-QQXBFTLCM2"
  };

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase auth instance
const auth = getAuth(app);

// Google provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Firebase Authentication fonksiyonları
export const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (error: any) {
      console.error('Google ile giriş hatası:', error);
      throw error;
    }
  };

export const loginWithEmailAndPassword = async (email: string, password: string) => {
  try {
    // Email ve şifre formatını kontrol et
    if (!email || !password) {
      throw new Error('Email ve şifre gereklidir');
    }

    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Geçersiz email formatı');
    }

    // Firebase ile giriş yap
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    if (!result.user) {
      throw new Error('Kullanıcı bilgileri alınamadı');
    }

    return result;
  } catch (error: any) {
    console.error('Email ile giriş hatası:', error);
    
    // Hata mesajlarını özelleştir
    if (error.code === 'auth/invalid-credential') {
      throw new Error('Email veya şifre hatalı');
    } else if (error.code === 'auth/user-not-found') {
      throw new Error('Kullanıcı bulunamadı');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Hatalı şifre');
    }
    
    throw error;
  }
};

  export const registerWithEmailAndPassword = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error: any) {
      console.error('Kayıt hatası:', error);
      throw error;
    }
  };

  export const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error: any) {
      console.error('Şifre sıfırlama hatası:', error);
      throw error;
    }
  };
  
  
  export const logoutUser = async () => {
    try {
      await signOut(auth);
      return true;
    } catch (error: any) {
      console.error('Çıkış hatası:', error);
      throw error;
    }
  };
  
  export { auth };