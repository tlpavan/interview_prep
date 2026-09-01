function getConfiguredBase() {
  const queryBase = new URLSearchParams(window.location.search).get("apiBase");
  const metaBase = document.querySelector('meta[name="api-base-url"]')?.content;
  const configuredBase =
    queryBase ||
    window.__INTERVIEW_PREP_API_BASE__ ||
    metaBase ||
    window.localStorage.getItem("apiBaseUrl") ||
    "";

  if (queryBase) {
    window.localStorage.setItem("apiBaseUrl", queryBase);
  }

  return String(configuredBase).trim().replace(/\/+$/, "");
}

function getCurrentUserId() {
  return window.localStorage.getItem("userId") || "";
}

function getAuthToken() {
  return window.localStorage.getItem("authToken") || "";
}

function inferApiBase() {
  const configuredBase = getConfiguredBase();
  if (configuredBase) return configuredBase;

  const { protocol, hostname, port } = window.location;
  if (["3000", "5500", "8080"].includes(port)) {
    return `${protocol}//${hostname}:5000`;
  }

  if (hostname.endsWith("github.io")) {
    return "";
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
