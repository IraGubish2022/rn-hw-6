import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDrnfNtBTF98F4NDcYuI6LzqNjhFvLUXSc",
  authDomain: "native-homework6.firebaseapp.com",
  projectId: "native-homework6",
  storageBucket: "native-homework6.appspot.com",
  messagingSenderId: "401065342792",
  appId: "1:401065342792:web:5a007b6046a1453ef8e57d",
  measurementId: "G-CXZNTGY3LP"
  };
  
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);