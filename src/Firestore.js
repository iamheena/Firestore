import { initializeApp } from "firebase/app"
import { getFirestore } from 'firebase/firestore'
const firebaseApp = initializeApp({
  apiKey: "AIzaSyB020GOiVsudMMsHQFRQDdVAuKUzD4E5Fw",
  authDomain: "fir-810bf.firebaseapp.com",
  projectId: "fir-810bf",
  storageBucket: "fir-810bf.appspot.com",
  messagingSenderId: "807657282194",
  appId: "1:807657282194:web:35692af90138549ad3644b",
  measurementId: "G-E2KPWFMFFW"
});

const db = getFirestore();
  
export default db;