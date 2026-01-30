import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA_H9deIyI31zU4HKCsNrObooNb6KJC4zM",
    authDomain: "svoidashboard.firebaseapp.com",
    projectId: "svoidashboard",
    storageBucket: "svoidashboard.firebasestorage.app",
    messagingSenderId: "183281660397",
    appId: "1:183281660397:web:784af25694ad65c03637e4",
    measurementId: "G-S3QVFF7G81"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
