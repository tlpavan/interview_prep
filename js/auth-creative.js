// Enhanced Auth.js with creative interactions
import { auth, provider } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const loginMsg = document.getElementById("msg-login");
const registerMsg = document.getElementById("msg-register");
const loginPanel = document.getElementById("panel-login");
const registerPanel = document.getElementById("panel-register");
const loginTab = document.getElementById("tab-login");
const registerTab = document.getElementById("tab-register");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const loginButton = document.getElementById("login-btn");
const registerButton = document.getElementById("register-btn");
const googleButton = document.getElementById("google-login-btn");

function setMessage(el, text, tone = "error") {
  if (!el) return;
  el.textContent = text;
  el.className = "auth-message text-center mt-sm";
  if (text) {
    if (tone === "success") {
      el.style.color = "#00b894";
      el.style.fontWeight = "600";
    } else {
      el.style.color = "#ff8e8e";
    }
  } else {
    el.style.color = "";
    el.className = "auth-message text-center mt-sm";
  }
}

function clearMessages() {
  setMessage(loginMsg, "");
  setMessage(registerMsg, "");
}

function setMode(mode) {
  const showLogin = mode === "login";
  loginPanel?.classList.toggle("active", showLogin);
  registerPanel?.classList.toggle("active", !showLogin);
  loginTab?.classList.toggle("active", showLogin);
  registerTab?.classList.toggle("active", !showLogin);

  // Update title
  const title = document.getElementById("auth-title");
  if (title) {
    title.textContent = showLogin ? "Sign in to your account" : "Create new account";
  }

  clearMessages();
}

function setBusy(button, busy, busyText, defaultText) {
  if (!button) return;
  button.disabled = busy;
  if (busy) {
    button.innerHTML = `<span class="spinner" style="width: 16px; height: 16px; border-width: 2px; display: inline-block; vertical-align: middle; margin-right: 8px;"></span> ${busyText}`;
  } else {
    button.innerHTML = defaultText;
  }
}

function togglePassword(targetId, toggleBtn) {
  const input = document.getElementById(targetId);
  if (!input || !toggleBtn) return;
  const reveal = input.type === "password";
  input.type = reveal ? "text" : "password";
  toggleBtn.textContent = reveal ? "🙈" : "👁️";
}

function bindUi() {
  loginTab?.addEventListener("click", () => setMode("login"));
  registerTab?.addEventListener("click", () => setMode("register"));
  document.getElementById("switch-to-register")?.addEventListener("click", () => setMode("register"));
  document.getElementById("switch-to-login")?.addEventListener("click", () => setMode("login"));

  document.querySelectorAll(".password-toggle").forEach(button => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      togglePassword(button.dataset.target, button);
    });
  });

  loginForm?.addEventListener("submit", event => {
    event.preventDefault();
    window.loginUser();
  });

  registerForm?.addEventListener("submit", event => {
    event.preventDefault();
    window.registerUser();
  });

  googleButton?.addEventListener("click", () => {
    window.googleLogin();
  });
}

onAuthStateChanged(auth, user => {
  if (user) {
    // Store user ID for API requests
    if (user.uid) {
      localStorage.setItem("userId", user.uid);
    }
    window.location.href = "dashboard.html";
  }
});

window.registerUser = async () => {
  clearMessages();

  const name = document.getElementById("username")?.value.trim();
  const email = document.getElementById("regEmail")?.value.trim();
  const password = document.getElementById("regPassword")?.value.trim();

  if (!name || !email || !password) {
    setMessage(registerMsg, "Please fill in all fields ✨");
    return;
  }

  if (password.length < 6) {
    setMessage(registerMsg, "Password must be at least 6 characters 🔐");
    return;
  }

  try {
    setBusy(registerButton, true, "Creating your account...", "Create Account");
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (credential.user && name) {
      await updateProfile(credential.user, { displayName: name });
    }
    setMessage(registerMsg, "🎉 Account created! Redirecting...", "success");
    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 1000);
  } catch (err) {
    console.error("Registration error:", err);
    if (err.code === "auth/email-already-in-use") {
      setMessage(registerMsg, "Account already exists. Try logging in instead! 🔄");
    } else if (err.code === "auth/invalid-email") {
      setMessage(registerMsg, "Please enter a valid email address 📧");
    } else if (err.code === "auth/weak-password") {
      setMessage(registerMsg, "Password is too weak. Use 6+ characters 💪");
    } else if (err.code === "auth/operation-not-allowed") {
      setMessage(registerMsg, "Email signup is currently disabled. Try Google Sign-In.");
    } else {
      setMessage(registerMsg, err.message || "Oops! Something went wrong. Try again.");
    }
  } finally {
    setBusy(registerButton, false, "Creating your account...", "Create Account");
  }
};

window.loginUser = async () => {
  clearMessages();

  const email = document.getElementById("loginEmail")?.value.trim();
  const password = document.getElementById("loginPassword")?.value.trim();

  if (!email || !password) {
    setMessage(loginMsg, "Enter your email and password to continue");
    return;
  }

  try {
    setBusy(loginButton, true, "Signing you in...", "Sign In");
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle redirect
  } catch (err) {
    console.error("Login error:", err);
    if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
      setMessage(loginMsg, "Invalid email or password. Please try again 🔐");
    } else if (err.code === "auth/too-many-requests") {
      setMessage(loginMsg, "Too many attempts. Please wait a moment ⏳");
    } else {
      setMessage(loginMsg, err.message || "Login failed. Please try again");
    }
  } finally {
    setBusy(loginButton, false, "Signing you in...", "Sign In");
  }
};

window.googleLogin = async () => {
  clearMessages();

  try {
    setBusy(googleButton, true, "Connecting to Google...", "Continue with Google");
    await signInWithPopup(auth, provider);
    // onAuthStateChanged will handle redirect
  } catch (err) {
    console.error("Google login error:", err);
    if (err.code === "auth/popup-closed-by-user") {
      setMessage(loginMsg, "Google sign-in was cancelled. Try again! 🔄");
    } else if (err.code === "auth/account-exists-with-different-credential") {
      setMessage(loginMsg, "An account already exists with this email. Try signing in with password.");
    } else {
      setMessage(loginMsg, "Google login failed. You can try email/password instead.");
    }
    setBusy(googleButton, false, "Connecting to Google...", "Continue with Google");
  }
};

bindUi();
setMode("login");

// Add visual feedback on form interaction
document.querySelectorAll('.input-field').forEach(input => {
  input.addEventListener('focus', () => {
    input.parentElement.classList.add('focused');
  });
  input.addEventListener('blur', () => {
    input.parentElement.classList.remove('focused');
  });
});

console.log("🚀 InterviewPrep AI - Enhanced Auth Loaded");