const explicitBase = window.localStorage.getItem("apiBaseUrl") || "";

function getCurrentUserId() {
  return window.localStorage.getItem("userId") || "";
}

function getAuthToken() {
  return window.localStorage.getItem("authToken") || "";
}

function inferApiBase() {
  if (explicitBase) return explicitBase.replace(/\/+$/, "");

  const { protocol, hostname, port } = window.location;
  if (port === "5500") {
    return `${protocol}//${hostname}:5000`;
  }
  return "";
}

const API_BASE = inferApiBase();

export function apiUrl(path) {
  const safePath = String(path || "");
  if (!safePath) return API_BASE || "/";
  if (/^https?:\/\//i.test(safePath)) return safePath;
  const normalized = safePath.startsWith("/") ? safePath : `/${safePath}`;
  return `${API_BASE}${normalized}`;
}

export function apiFetch(path, options = {}) {
  const userId = getCurrentUserId();
  const authToken = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }

  if (userId) {
    headers.set("X-User-Id", userId);
  }

  const config = {
    ...options,
    headers
  };

  return fetch(apiUrl(path), config);
}
