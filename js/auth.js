import { auth, provider } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
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
const rotatingHighlight = document.getElementById("rotating-highlight");

const highlightWords = [
  "Amazon DSA patterns",
  "TCS aptitude drills",
  "Accenture HR answers",
  "Microsoft problem solving",
  "Google-style mock rounds"
];

function setMessage(el, text, tone = "error") {
  if (!el) return;
  el.textContent = text;
  if (text) {
    el.dataset.tone = tone;
  } else {
    delete el.dataset.tone;
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
  clearMessages();
}

function setBusy(button, busy, busyText, defaultText) {
  if (!button) return;
  button.disabled = busy;
  button.textContent = busy ? busyText : defaultText;
}

function togglePassword(targetId, toggleBtn) {
  const input = document.getElementById(targetId);
  if (!input || !toggleBtn) return;
  const reveal = input.type === "password";
  input.type = reveal ? "text" : "password";
  toggleBtn.textContent = reveal ? "Hide" : "Show";
}

function bindUi() {
  loginTab?.addEventListener("click", () => setMode("login"));
  registerTab?.addEventListener("click", () => setMode("register"));
  document.getElementById("switch-to-register")?.addEventListener("click", () => setMode("register"));
  document.getElementById("switch-to-login")?.addEventListener("click", () => setMode("login"));

  document.querySelectorAll(".password-toggle").forEach(button => {
    button.addEventListener("click", () => {
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

function startHighlightRotation() {
  if (!rotatingHighlight) return;
  let index = 0;
  setInterval(() => {
    index = (index + 1) % highlightWords.length;
    rotatingHighlight.textContent = highlightWords[index];
  }, 2200);
}

onAuthStateChanged(auth, user => {
  if (user) {
    // Store user ID for API requests
    if (user.uid) {
      window.localStorage.setItem("userId", user.uid);
    }
    window.location.href = "dashboard";
  }
});

getRedirectResult(auth).catch(() => {
  setMessage(loginMsg, "Google login failed");
});

window.registerUser = async () => {
  clearMessages();

  const name = document.getElementById("username")?.value.trim();
  const email = document.getElementById("regEmail")?.value.trim();
  const password = document.getElementById("regPassword")?.value.trim();

  if (!name || !email || !password) {
    setMessage(registerMsg, "Fill name, email, and password.");
    return;
  }

  if (password.length < 6) {
    setMessage(registerMsg, "Password must be at least 6 characters.");
    return;
  }

  try {
    setBusy(registerButton, true, "Creating account...", "Create Account");
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (credential.user && name) {
      await updateProfile(credential.user, { displayName: name });
    }
    setMessage(registerMsg, "Account created. Redirecting...", "success");
    window.location.href = "dashboard";
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      setMessage(registerMsg, "Account already exists. Login instead.");
    } else if (err.code === "auth/invalid-email") {
      setMessage(registerMsg, "Invalid email format.");
    } else if (err.code === "auth/operation-not-allowed") {
      setMessage(registerMsg, "Email/password signup is disabled in Firebase settings.");
    } else {
      setMessage(registerMsg, err.message || "Registration failed.");
    }
  } finally {
    setBusy(registerButton, false, "Creating account...", "Create Account");
  }
};

window.loginUser = async () => {
  clearMessages();

  const email = document.getElementById("loginEmail")?.value.trim();
  const password = document.getElementById("loginPassword")?.value.trim();

  if (!email || !password) {
    setMessage(loginMsg, "Enter email and password.");
    return;
  }

  try {
    setBusy(loginButton, true, "Signing in...", "Login");
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard";
  } catch (err) {
    if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
      setMessage(loginMsg, "Invalid email or password.");
    } else {
      setMessage(loginMsg, err.message || "Login failed.");
    }
  } finally {
    setBusy(loginButton, false, "Signing in...", "Login");
  }
};

window.googleLogin = async () => {
  clearMessages();

  try {
    setBusy(googleButton, true, "Connecting Google...", "Continue with Google");
    await signInWithPopup(auth, provider);
    window.location.href = "dashboard";
  } catch {
    try {
      await signInWithRedirect(auth, provider);
    } catch {
      setMessage(loginMsg, "Google login failed.");
      setBusy(googleButton, false, "Connecting Google...", "Continue with Google");
    }
  }
};

bindUi();
setMode("login");
startHighlightRotation();
