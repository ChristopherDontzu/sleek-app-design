// Firebase Web SDK config — apiKey este publicabil; securitatea se face prin Firestore Security Rules.
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDm_44yDOQL6F2mwz6uvsqINQLuvXpfby0",
  authDomain: "moldingo-892a7.firebaseapp.com",
  databaseURL:
    "https://moldingo-892a7-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "moldingo-892a7",
  storageBucket: "moldingo-892a7.firebasestorage.app",
  messagingSenderId: "1003962000466",
  appId: "1:1003962000466:web:c4f92dd2f281cd829b6b8b",
  measurementId: "G-DWK2N9L52L",
};

export const firebaseApp: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(firebaseApp);
export const db: Firestore = getFirestore(firebaseApp);
export const googleProvider = new GoogleAuthProvider();
