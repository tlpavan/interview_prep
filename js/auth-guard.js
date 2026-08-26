import { auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { apiFetch } from "./api-base.js";

function bindLogout() {
  const btn = document.getElementById("logout-btn");
  if (!btn) return;
  btn.addEventListener("click", async () => {
    const authToken = window.localStorage.getItem("authToken");
    if (authToken) {
      await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    }
    await signOut(auth).catch(() => {});
    window.localStorage.removeItem("userId");
    window.localStorage.removeItem("authToken");
    window.localStorage.removeItem("authMode");
    window.localStorage.removeItem("userData");
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

(async function initAuthGuard() {
  const authToken = window.localStorage.getItem("authToken");
  if (authToken) {
    try {
      const response = await apiFetch("/api/auth/me");
      if (response.ok) {
        const payload = await response.json();
        const user = payload?.user;
        if (user?.id) {
          setProfile({
            displayName: user.name,
            email: user.email,
            uid: user.id
          });
          bindLogout();
          return;
        }
      }
      window.localStorage.removeItem("authToken");
      window.localStorage.removeItem("authMode");
      window.localStorage.removeItem("userId");
      window.localStorage.removeItem("userData");
    } catch {
      // Fall back to Firebase auth if backend session check fails.
    }
  }

  onAuthStateChanged(auth, user => {
    if (!user) {
      window.location.href = "/";
      return;
    }
    setProfile(user);
    bindLogout();
  });
})();
