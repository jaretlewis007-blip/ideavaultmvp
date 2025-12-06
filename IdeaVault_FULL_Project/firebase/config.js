import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDRXGqbJvyKHHF3YXvSApmv-6EYkxYT4Xk",
  authDomain: "ideavault-2f837.firebaseapp.com",
  projectId: "ideavault-2f837",
  storageBucket: "ideavault-2f837.firebasestorage.app",
  messagingSenderId: "621604502995",
  appId: "1:621604502995:web:54b14ddbb3219de677c326"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
