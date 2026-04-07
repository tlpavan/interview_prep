import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAih8lHfInqCjiTr1QYOJsiPy0y459t72E",
  authDomain: "interview-prep-ai-3e040.firebaseapp.com",
  projectId: "interview-prep-ai-3e040",
  storageBucket: "interview-prep-ai-3e040.appspot.com",
  messagingSenderId: "191805048330",
  appId: "1:191805048330:web:22264e9637b8bd8228c1f3"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
