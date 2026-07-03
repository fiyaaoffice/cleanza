import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAWgz2EzT8d40Xm0DcCkuGOazUbfdVE1sI",
  authDomain: "gen-lang-client-0916532602.firebaseapp.com",
  projectId: "gen-lang-client-0916532602",
  storageBucket: "gen-lang-client-0916532602.firebasestorage.app",
  messagingSenderId: "748864516108",
  appId: "1:748864516108:web:b3a22139bcf75e36fcbe29"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Google Sign-In helper
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Firebase Google Sign-In Error:", error);
    throw error;
  }
};

// Logout helper
export const logOutFirebase = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase Sign-Out Error:", error);
    throw error;
  }
};
