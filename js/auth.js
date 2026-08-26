import { auth, provider } from "./firebase.js";
import {
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { apiFetch } from "./api-base.js";

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

if (window.localStorage.getItem("authMode") === "backend" && window.localStorage.getItem("authToken")) {
  window.location.href = "dashboard";
}

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

function storeBackendSession(payload) {
  const user = payload?.user || {};
  if (user.id) {
    window.localStorage.setItem("userId", user.id);
  }
  if (payload?.token) {
    window.localStorage.setItem("authToken", payload.token);
  }
  window.localStorage.setItem("userData", JSON.stringify({
    displayName: user.name || user.email || "User",
    email: user.email || "",
    uid: user.id || ""
  }));
  window.localStorage.setItem("authMode", "backend");
}

function clearBackendSession() {
  window.localStorage.removeItem("userId");
  window.localStorage.removeItem("authToken");
  window.localStorage.removeItem("userData");
  window.localStorage.removeItem("authMode");
}

function storeFirebaseSession(user) {
  if (user?.uid) {
    window.localStorage.setItem("userId", user.uid);
  }
  window.localStorage.setItem("authMode", "firebase");
  window.localStorage.setItem("userData", JSON.stringify({
    displayName: user?.displayName || user?.email || "User",
    email: user?.email || "",
    uid: user?.uid || ""
  }));
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
  if (window.localStorage.getItem("authMode") === "backend") {
    return;
  }
  if (user) {
    storeFirebaseSession(user);
    window.location.href = "dashboard";
  }
});

getRedirectResult(auth).then(result => {
  if (result?.user) {
    clearBackendSession();
    storeFirebaseSession(result.user);
    window.location.href = "dashboard";
  }
}).catch(err => {
  console.error("Google redirect error:", err);
  setMessage(loginMsg, getGoogleErrorMessage(err));
});

function getGoogleErrorMessage(err) {
  switch (err?.code) {
    case "auth/operation-not-allowed":
      return "Google sign-in is disabled in Firebase. Enable the Google provider and try again.";
    case "auth/unauthorized-domain":
      return `This site is not authorized for Google sign-in. Add ${window.location.hostname} to Firebase Authorized domains.`;
    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in window. Allow popups for this site and try again.";
    case "auth/network-request-failed":
      return "Could not reach Google sign-in. Check your internet connection and try again.";
    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled. Try again.";
    default:
      return "Google login failed. You can try email/password instead.";
  }
}

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
    const response = await apiFetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error || "Registration failed.");
    }
    await signOut(auth).catch(() => {});
    storeBackendSession(payload);
    setMessage(registerMsg, "Account created. Redirecting...", "success");
    window.location.href = "dashboard";
  } catch (err) {
    if (String(err.message).includes("exists")) {
      setMessage(registerMsg, "Account already exists. Login instead.");
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
    const response = await apiFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload?.error || "Login failed.");
    }
    await signOut(auth).catch(() => {});
    storeBackendSession(payload);
    window.location.href = "dashboard";
  } catch (err) {
    if (String(err.message).toLowerCase().includes("invalid")) {
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
    await signInWithRedirect(auth, provider);
  } catch (err) {
    console.error("Google login error:", err);
    setMessage(loginMsg, getGoogleErrorMessage(err));
    setBusy(googleButton, false, "Connecting Google...", "Continue with Google");
  }
};

bindUi();
setMode("login");
startHighlightRotation();
