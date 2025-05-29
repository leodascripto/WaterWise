// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);