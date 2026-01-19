// Rename this file to firebaseConfig.js and fill in your Firebase credentials

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCLV7MNFILITKQjNvlHgBfO9OsrYu0ZR0I",
  authDomain: "dude-a2469.firebaseapp.com",
  projectId: "dude-a2469",
  storageBucket: "dude-a2469.firebasestorage.app",
  messagingSenderId: "122540821032",
  appId: "1:122540821032:web:14d1532f11447d8432031d",
  measurementId: "G-Y7DMFPV2P1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app