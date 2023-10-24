// firebase.ts
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"

const firebaseConfig = {
  apiKey: "AIzaSyDMO0Qrk7QtkVt7zJCf3OqsLzrxadKOvCc",
  authDomain: "charging-402405.firebaseapp.com",
  projectId: "charging-402405",
  storageBucket: "charging-402405.appspot.com",
  messagingSenderId: "368022146565",
  appId: "1:368022146565:web:d8b0dce4f51a28ab38d66c",
  measurementId: "G-5SYT1PVBEB",
}

const app = initializeApp(firebaseConfig)
const firestore = getFirestore(app)
const analytics = getAnalytics(app)

export { firestore, analytics }
