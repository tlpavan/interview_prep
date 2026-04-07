import { apiFetch } from "../api-base.js";

let vapi = null;
let vapiReady = false;
let vapiError = "";
let transcriptQueue = [];
let waitingResolver = null;
let assistantConfig = null;

function getVapiConstructor() {
  return (
    window.Vapi ||
    window?.vapi?.Vapi ||
    window?.VapiSDK ||
    null
  );
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = Array.from(document.querySelectorAll("script")).find(
      s => s.src === src
    );
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

async function loadVapiSdk() {
  if (getVapiConstructor()) return getVapiConstructor();

  const candidates = [
    "https://cdn.jsdelivr.net/npm/@vapi-ai/web/dist/vapi.min.js",
    "https://unpkg.com/@vapi-ai/web/dist/vapi.min.js",
    "https://cdn.jsdelivr.net/npm/@vapi-ai/web/dist/index.umd.js"
  ];

  for (const src of candidates) {
    try {
      await loadScript(src);
      const ctor = getVapiConstructor();
      if (ctor) return ctor;
    } catch {
      // try next source
    }
  }

  throw new Error("Vapi web SDK could not be loaded");
}

function extractUserTranscript(message) {
  if (!message) return "";
  if (typeof message === "string") return message.trim();

  if (
    message.type === "transcript" &&
    message.role === "user" &&
    typeof message.transcript === "string"
  ) {
    return message.transcript.trim();
  }

  if (
    message.type === "transcript" &&
    message.transcriptType === "final" &&
    typeof message.transcript === "string"
  ) {
    return message.transcript.trim();
  }

  if (
    message.type === "conversation-update" &&
    message.role === "user" &&
    typeof message.text === "string"
  ) {
    return message.text.trim();
  }

  return "";
}

function pushTranscript(text) {
  const clean = String(text || "").trim();
  if (!clean) return;
  transcriptQueue.push(clean);
  if (waitingResolver) {
    const resolve = waitingResolver;
    waitingResolver = null;
    const next = transcriptQueue.shift();
    resolve(next);
  }
}

export function getVapiState() {
  return {
    ready: vapiReady,
    error: vapiError
  };
}

export async function initVapi() {
  if (vapiReady && vapi) return true;

  try {
    const res = await apiFetch("/api/interview/voice-config");
    const config = await res.json();
    if (!res.ok || !config?.apiKey) {
      throw new Error("Vapi key missing from backend config");
    }

    assistantConfig = config.assistant || {};
    const VapiCtor = await loadVapiSdk();
    vapi = new VapiCtor(config.apiKey);

    if (typeof vapi.on === "function") {
      vapi.on("message", msg => {
        const text = extractUserTranscript(msg);
        if (text) pushTranscript(text);
      });
      vapi.on("error", err => {
        vapiError = err?.message || "Vapi runtime error";
      });
    }

    if (typeof vapi.start === "function") {
      await vapi.start(assistantConfig);
    }

    vapiReady = true;
    vapiError = "";
    transcriptQueue = [];
    return true;
  } catch (error) {
    vapiReady = false;
    vapi = null;
    vapiError = error?.message || "Vapi init failed";
    return false;
  }
}

export async function speakWithVapi(text) {
  if (!vapiReady || !vapi) return false;
  try {
    if (typeof vapi.say === "function") {
      await vapi.say(String(text || ""));
      return true;
    }
    if (typeof vapi.send === "function") {
      await vapi.send({
        type: "add-message",
        message: {
          role: "assistant",
          content: String(text || "")
        }
      });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function listenWithVapi(timeoutMs = 20000) {
  if (!vapiReady || !vapi) {
    throw new Error("Vapi is not ready");
  }

  if (transcriptQueue.length) {
    return transcriptQueue.shift();
  }

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (waitingResolver) waitingResolver = null;
      reject(new Error("No voice captured from Vapi"));
    }, timeoutMs);

    waitingResolver = value => {
      clearTimeout(timer);
      resolve(value);
    };
  });
}

export async function stopVapi() {
  if (!vapi) return;
  try {
    if (typeof vapi.stop === "function") {
      await vapi.stop();
    }
  } catch {
    // ignore stop failure
  } finally {
    vapi = null;
    vapiReady = false;
    transcriptQueue = [];
    waitingResolver = null;
  }
}
