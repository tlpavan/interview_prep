import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

function bindLogout() {
  const btn = document.getElementById("logout-btn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    await signOut(auth);
    window.localStorage.removeItem("userId");
    window.location.href = "/";
  });
}

function setProfile(user) {
  const nameEl = document.getElementById("profile-name");
  const avatarEl = document.getElementById("user-avatar");

  if (nameEl) {
    nameEl.innerText = user.displayName || user.email || "User";
  }
  if (avatarEl) {
    const name = user.displayName || user.email || "User";
    avatarEl.textContent = name.charAt(0).toUpperCase();
  }

  // Store user data for creative dashboard
  localStorage.setItem("userData", JSON.stringify({
    displayName: user.displayName,
    email: user.email,
    uid: user.uid
  }));
}

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "/";
    return;
  }
  setProfile(user);
  bindLogout();
});
