import { sessionState } from "./session-state.js";
import { apiFetch } from "../api-base.js";

let textInput = null;
let textSubmit = null;
let micButton = null;
let micTestButton = null;
let cachedVoice = null;
let voiceReady = false;
let activeRecognition = null;
let activeRecorder = null;
let activeStream = null;
let activeAudioContext = null;
let activeProcessor = null;
let activeSource = null;
let selectedMicDeviceId = "default";
let micDeviceControlsBound = false;
const debugMic = true;

function getMicSupportSummary() {
  return {
    recognition: Boolean(window.SpeechRecognition || window.webkitSpeechRecognition),
    mediaDevices: Boolean(navigator.mediaDevices?.getUserMedia),
    audioContext: Boolean(window.AudioContext || window.webkitAudioContext),
    recorder: Boolean(window.MediaRecorder)
  };
}

function setMicDiagnostic(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

function setMicSupportState(summary = getMicSupportSummary()) {
  const parts = [
    summary.recognition ? "SpeechRecognition" : "No SpeechRecognition",
    summary.mediaDevices ? "MediaDevices" : "No MediaDevices",
    summary.audioContext ? "WebAudio" : "No WebAudio",
    summary.recorder ? "Recorder" : "No Recorder"
  ];
  setMicDiagnostic("mic-support", parts.join(" | "));
}

function setMicPermissionState(text) {
  setMicDiagnostic("mic-permission", text);
}

function setMicSignalState(text) {
  setMicDiagnostic("mic-signal", text);
}

function setMicPath(text) {
  const el = document.getElementById("mic-path");
  if (el) el.innerText = `Path: ${text}`;
}

function setMicLevel(level) {
  const safe = Math.max(0, Math.min(100, Number(level || 0)));
  const fill = document.getElementById("mic-level-fill");
  const label = document.getElementById("mic-level-text");
  if (fill) fill.style.width = `${safe}%`;
  if (label) label.innerText = `${Math.round(safe)}%`;
}

function setMicTestNote(text) {
  const el = document.getElementById("mic-test-note");
  if (el) el.innerText = text;
}

function getAudioConstraints() {
  const base = {
    channelCount: 1,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  };

  if (selectedMicDeviceId && selectedMicDeviceId !== "default") {
    return {
      ...base,
      deviceId: { exact: selectedMicDeviceId }
    };
  }

  return base;
}

async function loadMicDevices() {
  const select = document.getElementById("mic-device-select");
  if (!select || !navigator.mediaDevices?.enumerateDevices) return;

  const devices = await navigator.mediaDevices.enumerateDevices();
  const inputs = devices.filter(device => device.kind === "audioinput");
  const current = selectedMicDeviceId || "default";

  select.innerHTML = "";
  const defaultOption = document.createElement("option");
  defaultOption.value = "default";
  defaultOption.textContent = "Default microphone";
  select.appendChild(defaultOption);

  inputs.forEach((device, index) => {
    const option = document.createElement("option");
    option.value = device.deviceId;
    option.textContent = device.label || `Microphone ${index + 1}`;
    select.appendChild(option);
  });

  if ([...select.options].some(option => option.value === current)) {
    select.value = current;
  } else {
    select.value = "default";
    selectedMicDeviceId = "default";
  }
}

function ensureMicDeviceControls() {
  const select = document.getElementById("mic-device-select");
  const refreshBtn = document.getElementById("refresh-mic-devices-btn");
  if (!select || micDeviceControlsBound) return;

  micDeviceControlsBound = true;
  select.addEventListener("change", () => {
    selectedMicDeviceId = select.value || "default";
    setMicTestNote(
      selectedMicDeviceId === "default"
        ? "Using the default microphone. Change the device if the browser hears the wrong mic."
        : "Using the selected microphone. SpeechRecognition will be bypassed so the chosen device is used directly."
    );
    setMicPath(selectedMicDeviceId === "default" ? "Idle" : "Selected device");
  });

  refreshBtn?.addEventListener("click", async () => {
    try {
      await ensureMicPermission();
      await loadMicDevices();
      setMicStatus("Microphone list refreshed.");
    } catch (error) {
      setMicStatus(`Could not refresh microphones: ${error.message}`);
    }
  });
}

function setMicStatus(text) {
  const el = document.getElementById("mic-status");
  if (el) el.innerText = text;
}

function addTranscriptLine(text) {
  const wrap = document.getElementById("transcript-log");
  if (!wrap) return;
  const row = document.createElement("div");
  row.className = "transcript-line";
  row.innerText = text;
  wrap.prepend(row);
}

function logSystem(message) {
  if (!debugMic) return;
  addTranscriptLine(`SYSTEM: ${message}`);
}

function ensureInterviewArea(type) {
  const area = document.getElementById("interview-area");
  const title = document.getElementById("interview-title");
  if (area) area.classList.remove("hidden");
  if (title) title.innerText = `${type.toUpperCase()} Interview`;
}

function ensureTextInput() {
  if (textInput && textSubmit && micButton) return { textInput, textSubmit, micButton };

  const area = document.getElementById("interview-area");
  const wrap = document.createElement("div");
  wrap.id = "text-answer-area";
  wrap.className = "text-answer-area";

  const input = document.createElement("textarea");
  input.id = "text-answer-input";
  input.rows = 3;
  input.placeholder = "Type your answer here...";

  const actions = document.createElement("div");
  actions.className = "text-answer-actions";

  const mic = document.createElement("button");
  mic.id = "voice-answer-btn";
  mic.className = "ghost-btn";
  mic.innerText = "Use Mic";

  const btn = document.createElement("button");
  btn.id = "text-answer-submit";
  btn.className = "primary-btn";
  btn.innerText = "Submit";

  actions.appendChild(mic);
  actions.appendChild(btn);
  wrap.appendChild(input);
  wrap.appendChild(actions);

  if (area) {
    const log = document.getElementById("transcript-log");
    if (log) {
      area.insertBefore(wrap, log);
    } else {
      area.appendChild(wrap);
    }
  }

  textInput = input;
  textSubmit = btn;
  micButton = mic;
  return { textInput, textSubmit, micButton };
}

function ensureMicTestButton() {
  if (micTestButton) return micTestButton;
  const area = document.getElementById("interview-action-bar") || document.getElementById("interview-area");
  const btn = document.createElement("button");
  btn.id = "voice-test-btn";
  btn.className = "ghost-btn";
  btn.innerText = "Test Mic";
  if (area) area.appendChild(btn);
  micTestButton = btn;
  return btn;
}

function pickVoice() {
  if (!window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) return null;

  const preferred =
    voices.find(v => /google/i.test(v.name) && /en/i.test(v.lang)) ||
    voices.find(v => /en-us/i.test(v.lang)) ||
    voices.find(v => /en/i.test(v.lang)) ||
    voices[0];

  cachedVoice = preferred;
  voiceReady = true;
  return cachedVoice;
}

if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    voiceReady = false;
    pickVoice();
  };
}

async function speak(text) {
  return new Promise(resolve => {
    if (!window.speechSynthesis) return resolve();
    const utter = new SpeechSynthesisUtterance(text);
    if (!voiceReady) pickVoice();
    if (cachedVoice) utter.voice = cachedVoice;
    utter.onend = resolve;
    utter.onerror = resolve;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  });
}

function getRecognition() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return null;
  const rec = new Recognition();
  rec.lang = "en-US";
  rec.interimResults = true;
  rec.continuous = true;
  rec.maxAlternatives = 3;
  return rec;
}

function stopActiveCapture() {
  if (activeRecognition) {
    try {
      activeRecognition.onend = null;
      activeRecognition.onerror = null;
      activeRecognition.stop();
    } catch {}
    activeRecognition = null;
  }
  if (activeRecorder && activeRecorder.state !== "inactive") {
    try {
      activeRecorder.stop();
    } catch {}
  }
  activeRecorder = null;
  if (activeStream) {
    activeStream.getTracks().forEach(track => track.stop());
    activeStream = null;
  }
  if (activeProcessor) {
    try {
      activeProcessor.disconnect();
    } catch {}
    activeProcessor = null;
  }
  if (activeSource) {
    try {
      activeSource.disconnect();
    } catch {}
    activeSource = null;
  }
  if (activeAudioContext) {
    try {
      activeAudioContext.close();
    } catch {}
    activeAudioContext = null;
  }
}

async function ensureMicPermission() {
  console.log("🔍 [DEBUG] ensureMicPermission() called");
  setMicPermissionState("Checking...");

  if (!navigator.mediaDevices?.getUserMedia) {
    console.error("❌ [DEBUG] getUserMedia NOT supported");
    setMicPermissionState("Unsupported");
    throw new Error("Microphone API not supported in this browser.");
  }

  // Check permission state
  if (navigator.permissions?.query) {
    try {
      const status = await navigator.permissions.query({ name: "microphone" });
      console.log(`📋 [DEBUG] Permission state: ${status.state}`);
      setMicPermissionState(status.state);
      if (status.state === "denied") {
        throw new Error("Microphone permission denied. Please allow microphone access in browser settings.");
      }
    } catch (err) {
      console.warn(`⚠️ [DEBUG] Permission query failed:`, err);
      setMicPermissionState("Unknown");
    }
  }

  // Try to get media stream
  try {
    console.log("🎤 [DEBUG] Requesting microphone access...");
    const constraints = getAudioConstraints();
    console.log("📝 [DEBUG] Audio constraints:", constraints);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: constraints });
    console.log("✅ [DEBUG] Microphone access granted!", stream);

    // Log track info
    const audioTracks = stream.getAudioTracks();
    console.log(`🎵 [DEBUG] Got ${audioTracks.length} audio track(s)`);

    if (audioTracks.length > 0) {
      const track = audioTracks[0];
      console.log(`🎵 [DEBUG] Track: ${track.label}`);
      console.log(`🎵 [DEBUG] Enabled: ${track.enabled}, Muted: ${track.muted}`);
      if (track.getSettings) {
        console.log(`🎵 [DEBUG] Settings:`, track.getSettings());
      }
    }

    // Stop stream
    stream.getTracks().forEach(track => {
      console.log(`🛑 [DEBUG] Stopping track: ${track.label}`);
      track.stop();
    });

    setMicPermissionState("Granted");
    console.log("✅ [DEBUG] Permission check complete - GRANTED");

    // Refresh device list
    try {
      await loadMicDevices();
      const select = document.getElementById("mic-device-select");
      if (select) {
        console.log(`📱 [DEBUG] Loaded ${select.options.length} microphone(s)`);
        console.log(`📱 [DEBUG] Selected: ${select.value || 'default'}`);
      }
    } catch (e) {
      console.warn(`⚠️ [DEBUG] Device refresh failed:`, e);
    }

    return true;
  } catch (error) {
    console.error("❌ [DEBUG] Microphone access FAILED:", error);
    console.error("❌ [DEBUG] Error name:", error.name);
    console.error("❌ [DEBUG] Error message:", error.message);

    setMicPermissionState("Denied");

    // Give specific guidance
    let userMessage = error.message;

    if (error.name === 'NotAllowedError' || error.message.includes('permission')) {
      userMessage = "🚫 Microphone permission denied. Click the padlock icon 🔒 in address bar → Site settings → Microphone → Allow, then refresh page.";
    } else if (error.name === 'NotFoundError' || error.message.includes('device')) {
      userMessage = "🔍 No microphone found. Make sure your mic is connected and working in Windows Sound settings.";
    } else if (error.name === 'NotReadableError' || error.message.includes('busy')) {
      userMessage = "⏳ Microphone is busy. Close Zoom, Teams, Discord, or any app using the mic, then refresh and try again.";
    } else if (error.name === 'OverconstrainedError') {
      userMessage = "⚠️ Your microphone doesn't meet the requested constraints. The system will try fallback methods.";
      setMicPermissionState("Partial");
      return false;
    }

    throw new Error(userMessage);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureBySpeechApi(attempt = 1) {
  return new Promise((resolve, reject) => {
    const recognition = getRecognition();
    if (!recognition) {
      reject(new Error("Speech recognition is not supported in this browser."));
      return;
    }

    activeRecognition = recognition;
    let transcript = "";
    const startedAt = Date.now();
    let timeout = null;
    let silenceTimeout = null;

    const clearTimers = () => {
      clearTimeout(timeout);
      clearTimeout(silenceTimeout);
    };

    const stopSoon = () => {
      clearTimeout(silenceTimeout);
      silenceTimeout = setTimeout(() => {
        try {
          recognition.stop();
        } catch {}
      }, 1400);
    };

    recognition.onstart = () => {
      setMicPath("SpeechRecognition");
      setMicStatus("🎤 Listening... Speak now");
      logSystem("SpeechRecognition started");
      timeout = setTimeout(() => {
        try {
          recognition.stop();
        } catch {}
      }, 18000);
    };

    recognition.onaudiostart = () => {
      setMicStatus("🎤 Mic active. Speak now.");
      setMicSignalState("Audio stream active");
      logSystem("SpeechRecognition audio start");
    };

    recognition.onspeechstart = () => {
      setMicStatus("🎤 Speech detected... Keep talking");
      setMicSignalState("Voice detected ✓");
      logSystem("SpeechRecognition speech start");
    };

    recognition.onspeechend = () => {
      setMicStatus("Processing your speech...");
      logSystem("SpeechRecognition speech end");
      // Don't stop immediately on interim results, wait a bit
      if (transcript && settled) {
        stopSoon();
      }
    };

    recognition.onresult = event => {
      if (!event.results?.length) return;
      const parts = [];
      const isFinal = event.results[event.results.length - 1].isFinal;

      for (let i = 0; i < event.results.length; i += 1) {
        const piece = event.results[i]?.[0]?.transcript?.trim() || "";
        if (piece) parts.push(piece);
      }
      const merged = parts.join(" ").replace(/\s+/g, " ").trim();
      if (merged) {
        transcript = merged;
        const status = isFinal ? "Final: " : "Partial: ";
        setMicSignalState(isFinal ? "Transcript captured ✓" : "Hearing...");
        setMicStatus(`${isFinal ? "✓" : "..."} Heard: "${merged}"`);
        logSystem(`SpeechRecognition ${isFinal ? 'final' : 'partial'}: ${merged}`);

        // Stop soon if final result
        if (isFinal) {
          settled = true;
          stopSoon();
        }
      }
    };

    recognition.onerror = event => {
      clearTimers();
      activeRecognition = null;
      const err = event?.error || "Voice input failed";
      let errorMsg = err;
      if (err === "no-speech") {
        errorMsg = "No speech detected. Start speaking right after the mic icon appears.";
      }
      if (err === "network") errorMsg = "Speech network error. Check internet and try again.";
      if (err === "not-allowed") errorMsg = "Microphone permission denied in browser/site settings.";
      logSystem(`SpeechRecognition error: ${errorMsg}`);
      reject(new Error(errorMsg));
    };

    recognition.onend = () => {
      clearTimers();
      activeRecognition = null;
      if (!transcript) {
        logSystem("SpeechRecognition ended with no transcript");
        reject(new Error("No speech captured. Please try again or type."));
        return;
      }
      logSystem(`SpeechRecognition final: ${transcript}`);
      resolve({
        transcript,
        voiceMetrics: {
          durationMs: Date.now() - startedAt,
          avgVolume: 0,
          maxVolume: 0
        }
      });
    };

    try {
      recognition.start();
    } catch (error) {
      activeRecognition = null;
      logSystem(`SpeechRecognition start error: ${error?.message || "unknown"}`);
      reject(new Error(error?.message || "Could not start microphone."));
    }
  }).catch(async error => {
    const message = error?.message?.toLowerCase?.() || "";
    if (attempt < 3 && (message.includes("no speech") || message.includes("no speech captured"))) {
      logSystem("SpeechRecognition retrying after no speech");
      await sleep(700);
      return captureBySpeechApi(attempt + 1);
    }
    throw error;
  });
}

function pickMimeType() {
  const choices = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus"
  ];
  return choices.find(type => window.MediaRecorder?.isTypeSupported?.(type)) || "";
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || "");
      const base64 = result.split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Failed to read recorded audio"));
    reader.readAsDataURL(blob);
  });
}

function downsampleBuffer(buffer, sampleRate, targetRate) {
  if (targetRate === sampleRate) return buffer;
  const ratio = sampleRate / targetRate;
  const newLength = Math.round(buffer.length / ratio);
  const result = new Float32Array(newLength);
  let offsetResult = 0;
  let offsetBuffer = 0;
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * ratio);
    let sum = 0;
    let count = 0;
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i += 1) {
      sum += buffer[i];
      count += 1;
    }
    result[offsetResult] = count > 0 ? sum / count : 0;
    offsetResult += 1;
    offsetBuffer = nextOffsetBuffer;
  }
  return result;
}

function measureRms(samples) {
  if (!samples?.length) return 0;
  let total = 0;
  for (let i = 0; i < samples.length; i += 1) {
    total += samples[i] * samples[i];
  }
  return Math.sqrt(total / samples.length);
}

async function runLiveMicProbe(durationMs = 2500) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Microphone API not supported in this browser.");
  }

  setMicPath("Live audio probe");
  setMicSignalState("Listening for audio");
  setMicTestNote("Speak while the level bar is moving. This confirms whether the browser sees your voice.");

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: getAudioConstraints()
  });

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    stream.getTracks().forEach(track => track.stop());
    throw new Error("AudioContext not supported in this browser.");
  }

  const ctx = new AudioCtx();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  const data = new Float32Array(analyser.fftSize);
  source.connect(analyser);

  let maxLevel = 0;
  let detectedSpeech = false;
  const threshold = 0.02; // Raw RMS threshold (0.02 is quiet speech)

  await new Promise(resolve => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      analyser.getFloatTimeDomainData(data);
      const rms = measureRms(data);
      const level = Math.min(100, Number((rms * 220).toFixed(2)));
      maxLevel = Math.max(maxLevel, level);
      setMicLevel(level);
      // Use RMS threshold (more accurate than percentage for detection)
      if (rms >= threshold) {
        detectedSpeech = true;
        setMicSignalState(`Voice detected (${Math.round(level)}%)`);
      }
      if (Date.now() - startedAt >= durationMs) {
        clearInterval(timer);
        resolve();
      }
    }, 90);
  });

  source.disconnect();
  analyser.disconnect();
  stream.getTracks().forEach(track => track.stop());
  await ctx.close();

  setMicLevel(maxLevel);
  setMicSignalState(
    detectedSpeech ? `Voice detected (${Math.round(maxLevel)}%)` : "No voice detected"
  );

  return {
    detectedSpeech,
    maxLevel: Math.round(maxLevel)
  };
}

function encodeWavFromPcm(pcmData, sampleRate) {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmData.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i += 1) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < pcmData.length; i += 1) {
    let sample = Math.max(-1, Math.min(1, pcmData[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }

  return buffer;
}

async function captureByWebAudio(durationMs = 3000, targetSampleRate = 16000) {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Microphone API not supported in this browser.");
  }

  const stream = await navigator.mediaDevices.getUserMedia({
    audio: getAudioConstraints()
  });
  activeStream = stream;
  setMicPath("WebAudio fallback");
  setMicSignalState("Listening for speech");
  logSystem("WebAudio fallback started");

  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    throw new Error("AudioContext not supported.");
  }

  const ctx = new AudioCtx();
  activeAudioContext = ctx;
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  const sourceSampleRate = ctx.sampleRate;
  const source = ctx.createMediaStreamSource(stream);
  activeSource = source;
  const processor = ctx.createScriptProcessor(4096, 1, 1);
  activeProcessor = processor;
  const samples = [];
  let sawSpeech = false;
  let speechStartedAt = 0;
  let lastSpeechAt = 0;
  let volumeTotal = 0;
  let volumeCount = 0;
  let maxVolume = 0;
  const speechThreshold = 0.015;

  const gain = ctx.createGain();
  gain.gain.value = 0;

  processor.onaudioprocess = event => {
    const input = event.inputBuffer.getChannelData(0);
    const copy = new Float32Array(input);
    samples.push(copy);
    const rms = measureRms(copy);
    const scaled = Number((rms * 100).toFixed(2));
    setMicLevel(Math.min(100, scaled * 2.4));
    volumeTotal += scaled;
    volumeCount += 1;
    maxVolume = Math.max(maxVolume, scaled);
    if (rms > speechThreshold) {
      if (!sawSpeech) {
        speechStartedAt = Date.now();
        setMicStatus("Speech detected. Keep talking.");
        setMicSignalState("Voice detected");
        logSystem("WebAudio detected speech");
      }
      sawSpeech = true;
      lastSpeechAt = Date.now();
    }
  };

  source.connect(processor);
  processor.connect(gain);
  gain.connect(ctx.destination);

  setMicStatus("Recording... Speak clearly. Capture stops after you finish.");

  await new Promise(resolve => {
    const startedAt = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const silentFor = Date.now() - lastSpeechAt;
      if (sawSpeech && silentFor > 1300) {
        clearInterval(timer);
        resolve();
        return;
      }
      if (elapsed >= durationMs) {
        clearInterval(timer);
        resolve();
      }
    }, 150);
  });
  stopActiveCapture();

  if (!samples.length) {
    throw new Error("No audio captured. Check mic permissions.");
  }
  if (!sawSpeech) {
    throw new Error("No speech detected in recorded audio.");
  }

  const length = samples.reduce((sum, arr) => sum + arr.length, 0);
  const merged = new Float32Array(length);
  let offset = 0;
  samples.forEach(arr => {
    merged.set(arr, offset);
    offset += arr.length;
  });

  const downsampled = downsampleBuffer(merged, sourceSampleRate, targetSampleRate);
  const wavBuffer = encodeWavFromPcm(downsampled, targetSampleRate);
  const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
  const audioBase64 = await blobToBase64(wavBlob);

  let result = null;
  try {
    result = await postJson("/api/interview/transcribe", {
      audioBase64,
      mimeType: "audio/wav"
    });
  } catch (error) {
    logSystem(`WebAudio transcription error: ${error.message}`);
    throw error;
  }
  if (!result?.transcript) {
    logSystem("WebAudio transcription returned empty text");
    throw new Error("No transcript from recorded audio.");
  }
  logSystem(`WebAudio transcript: ${result.transcript}`);

  return {
    transcript: result.transcript.trim(),
    voiceMetrics: {
      durationMs: Math.max(durationMs, Date.now() - speechStartedAt),
      avgVolume: volumeCount ? Number((volumeTotal / volumeCount).toFixed(2)) : 0,
      maxVolume: Number(maxVolume.toFixed(2))
    }
  };
}

function encodeWav(audioBuffer) {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const numSamples = audioBuffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset, str) => {
    for (let i = 0; i < str.length; i += 1) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  const channels = [];
  for (let ch = 0; ch < numChannels; ch += 1) {
    channels.push(audioBuffer.getChannelData(ch));
  }

  let offset = 44;
  for (let i = 0; i < numSamples; i += 1) {
    for (let ch = 0; ch < numChannels; ch += 1) {
      let sample = channels[ch][i];
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return buffer;
}

async function blobToWavBase64(blob) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) throw new Error("AudioContext not supported.");
  const ctx = new AudioCtx();
  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  const wavBuffer = encodeWav(audioBuffer);
  await ctx.close();
  const wavBlob = new Blob([wavBuffer], { type: "audio/wav" });
  const base64 = await blobToBase64(wavBlob);
  return { base64, mimeType: "audio/wav" };
}

async function captureByRecorder(durationMs = 7000) {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    throw new Error("Audio recorder is not supported in this browser.");
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: getAudioConstraints() });
  activeStream = stream;
  setMicPath("MediaRecorder fallback");
  setMicSignalState("Recording fallback active");
  const mimeType = pickMimeType();
  const recorder = mimeType
    ? new MediaRecorder(stream, { mimeType, audioBitsPerSecond: 32000 })
    : new MediaRecorder(stream, { audioBitsPerSecond: 32000 });
  activeRecorder = recorder;
  logSystem(`Recorder fallback started (${mimeType || "default"})`);

  const chunks = [];
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    recorder.ondataavailable = e => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    recorder.onerror = () => {
      stopActiveCapture();
      logSystem("Recorder error during capture");
      reject(new Error("Recorder error while capturing audio."));
    };

    recorder.onstop = async () => {
      try {
        stopActiveCapture();
        if (!chunks.length) {
          throw new Error("No recorder audio captured.");
        }
        const blob = new Blob(chunks, {
          type: recorder.mimeType || "audio/webm"
        });
        let audioBase64 = "";
        let mimeType = recorder.mimeType || "audio/webm";
        try {
          const wav = await blobToWavBase64(blob);
          audioBase64 = wav.base64;
          mimeType = wav.mimeType;
        } catch {
          audioBase64 = await blobToBase64(blob);
        }
        logSystem(`Recorder captured ${chunks.length} chunks`);
        let result = null;
        try {
          result = await postJson("/api/interview/transcribe", {
            audioBase64,
            mimeType
          });
        } catch (error) {
          logSystem(`Recorder transcription error: ${error.message}`);
          throw error;
        }
        if (!result?.transcript) {
          logSystem("Recorder transcription returned empty text");
          throw new Error("No transcript from recorded audio.");
        }
        logSystem(`Recorder transcript: ${result.transcript}`);
        resolve({
          transcript: result.transcript.trim(),
          voiceMetrics: {
            durationMs: Date.now() - startedAt,
            avgVolume: 0,
            maxVolume: 0
          }
        });
      } catch (error) {
        reject(error);
      }
    };

    recorder.start();
    setMicStatus(`Recording ${Math.round(durationMs / 1000)} seconds... Speak now.`);
    setTimeout(() => {
      if (recorder.state !== "inactive") recorder.stop();
    }, durationMs);
  });
}

async function captureWithMic() {
  await ensureMicPermission();
  if (window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
  await sleep(250);
  if (selectedMicDeviceId && selectedMicDeviceId !== "default") {
    try {
      logSystem("Using selected input device via WebAudio capture");
      return await captureByWebAudio(8000);
    } catch (webAudioError) {
      logSystem(`Selected-device WebAudio failed: ${webAudioError.message}`);
      logSystem("Falling back to selected-device MediaRecorder capture");
      return await captureByRecorder(8000);
    }
  }
  const recognition = getRecognition();
  if (recognition) {
    try {
      logSystem("Using SpeechRecognition");
      return await captureBySpeechApi(1);
    } catch (error) {
      logSystem(`SpeechRecognition failed: ${error.message}`);
      try {
        logSystem("Falling back to WebAudio capture");
        return await captureByWebAudio(8000);
      } catch (webAudioError) {
        logSystem(`WebAudio failed: ${webAudioError.message}`);
        logSystem("Falling back to MediaRecorder capture");
        return await captureByRecorder(8000);
      }
    }
  }

  try {
    logSystem("SpeechRecognition unavailable, using WebAudio capture");
    return await captureByWebAudio(8000);
  } catch (webAudioError) {
    logSystem(`WebAudio failed: ${webAudioError.message}`);
    logSystem("WebAudio failed, using MediaRecorder capture");
    return await captureByRecorder(8000);
  }
}

async function listenWithChoice(fieldName) {
  const { textInput: input, textSubmit: submit, micButton: mic } = ensureTextInput();
  input.placeholder = `Type ${fieldName} here...`;
  input.value = "";
  setMicStatus(`Use the mic or type ${fieldName} and press Submit.`);

  return new Promise(resolve => {
    let settled = false;

    const finish = result => {
      if (settled) return;
      settled = true;
      stopActiveCapture();
      submit.onclick = null;
      input.onkeydown = null;
      mic.onclick = null;
      mic.disabled = false;
      mic.innerText = "Use Mic";
      resolve(result);
    };

    const submitText = () => {
      const value = input.value.trim();
      if (!value) {
        setMicStatus(`Please type ${fieldName} before submitting.`);
        return;
      }
      finish({ transcript: value, voiceMetrics: null });
    };

    submit.onclick = submitText;
    input.onkeydown = event => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        submitText();
      }
    };

    mic.onclick = async () => {
      mic.disabled = true;
      mic.innerText = "Listening...";
      logSystem("Mic button clicked");
      try {
        const result = await captureWithMic();
        finish(result);
      } catch (error) {
        mic.disabled = false;
        mic.innerText = "Use Mic";
        setMicStatus(`Mic failed: ${error.message}. You can type instead.`);
        logSystem(`Mic capture failed: ${error.message}`);
      }
    };
  });
}

async function postJson(url, payload) {
  const res = await apiFetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.details || data?.error || "Request failed");
  return data;
}

function normalizeDifficulty(raw) {
  const text = String(raw || "").toLowerCase();
  if (text.includes("hard")) return "hard";
  if (text.includes("easy")) return "easy";
  return "medium";
}

function parseQuestionCount(raw) {
  const words = {
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10
  };
  const text = String(raw || "");
  const number = text.match(/\d+/);
  if (number) return Math.min(20, Math.max(1, Number(number[0])));
  const lower = text.toLowerCase();
  const word = Object.keys(words).find(w => lower.includes(w));
  return word ? words[word] : 5;
}

async function askAndCaptureQuestion(lastAnswer) {
  const q = await postJson("/api/interview/next-question", {
    userName: sessionState.userName,
    interviewType: sessionState.interviewType,
    domain: sessionState.domain,
    difficulty: sessionState.difficulty,
    askedQuestions: sessionState.askedQuestions,
    lastAnswer
  });

  const question = q.question || `Tell me about yourself, ${sessionState.userName}.`;
  addTranscriptLine(`AI: ${question}`);
  await speak(question);
  await speak(`${sessionState.userName}, answer now.`);

  const capture = await listenWithChoice("answer");
  addTranscriptLine(`${sessionState.userName}: ${capture.transcript}`);
  return {
    question,
    answer: capture.transcript,
    voiceMetrics: capture.voiceMetrics || null
  };
}

function showFeedback(data) {
  document.getElementById("feedback-area")?.classList.remove("hidden");
  const confidence = document.getElementById("confidenceChart");
  const vocabulary = document.getElementById("vocabularyChart");
  const technical = document.getElementById("technicalChart");
  if (confidence) confidence.style.width = `${data.confidence || 0}%`;
  if (vocabulary) vocabulary.style.width = `${data.vocabulary || 0}%`;
  if (technical) technical.style.width = `${data.technical || 0}%`;

  const ul = document.getElementById("suggestions");
  if (!ul) return;
  ul.innerHTML = "";
  (data.suggestions || []).forEach(item => {
    const li = document.createElement("li");
    li.innerText = item;
    ul.appendChild(li);
  });
}

export async function beginInterview(type) {
  try {
    const isHrRound = String(type || "").toLowerCase().includes("hr");
    ensureInterviewArea(type);
    addTranscriptLine("Mic + text enabled. Interviewer will ask questions.");
    setMicStatus("Mic and text input ready.");
    setMicTestNote("You can test the mic first. The level bar should move while you speak.");
    ensureTextInput();

    sessionState.interviewType = type;
    sessionState.userName = null;
    sessionState.domain = null;
    sessionState.difficulty = null;
    sessionState.totalQuestions = 0;
    sessionState.askedQuestions = 0;

    await speak("Hello. Please say or type your name.");
    const rawName = await listenWithChoice("your name");
    const nameData = await postJson("/api/interview/extract-name", { transcript: rawName.transcript });
    sessionState.userName = nameData.name || "User";
    addTranscriptLine(`Name detected: ${sessionState.userName}`);
    await speak(`Hello ${sessionState.userName}. Welcome to your interview session.`);

    if (isHrRound) {
      sessionState.domain = "general";
      addTranscriptLine("Domain: general HR round");
    } else {
      await speak("Say or type your technical domain like DSA, web development, cloud, machine learning, or backend.");
      const rawDomain = await listenWithChoice("domain");
      sessionState.domain = rawDomain.transcript || "general";
      addTranscriptLine(`Domain: ${sessionState.domain}`);
    }

    await speak(`Hi ${sessionState.userName}. Say or type the difficulty.`);
    const rawDifficulty = await listenWithChoice("difficulty");
    sessionState.difficulty = normalizeDifficulty(rawDifficulty.transcript);
    addTranscriptLine(`Difficulty: ${sessionState.difficulty}`);

    await speak("Say or type the number of questions.");
    const rawCount = await listenWithChoice("question count");
    sessionState.totalQuestions = parseQuestionCount(rawCount.transcript);
    addTranscriptLine(`Question count: ${sessionState.totalQuestions}`);
    addTranscriptLine(
      `Setup complete: ${sessionState.userName} | ${sessionState.domain || "general"} | ${sessionState.difficulty} | ${sessionState.totalQuestions} questions`
    );

    const answers = [];
    let lastAnswer = "";
    for (let i = 0; i < sessionState.totalQuestions; i += 1) {
      setMicStatus(`Question ${i + 1}/${sessionState.totalQuestions}`);
      const pair = await askAndCaptureQuestion(lastAnswer);
      answers.push(pair);
      lastAnswer = pair.answer;
      sessionState.askedQuestions = i + 1;
    }

    setMicStatus("Generating final feedback...");
    const feedback = await postJson("/api/interview/start", {
      name: sessionState.userName,
      type: sessionState.interviewType,
      domain: sessionState.domain,
      difficulty: sessionState.difficulty,
      totalQuestions: sessionState.totalQuestions,
      answers
    });

    showFeedback(feedback);
    await speak(`Great work ${sessionState.userName}. Feedback is ready.`);
    setMicStatus("Interview completed.");
  } catch (error) {
    setMicStatus(`Interview flow error: ${error.message}`);
    addTranscriptLine(`Error: ${error.message}`);
  }
}

export async function runMicTest() {
  try {
    setMicSupportState();
    setMicLevel(0);
    setMicPath("Diagnostics");
    setMicSignalState("Testing");
    setMicStatus("Running mic diagnostics...");
    addTranscriptLine("SYSTEM: Mic diagnostics started");
    await ensureMicPermission();
    const probe = await runLiveMicProbe(2600);
    if (!probe.detectedSpeech) {
      setMicStatus(
        "Mic test failed: browser permission is granted but no voice signal was detected. Check the selected input device and system mic level."
      );
      setMicTestNote(
        "The browser did not see a voice signal. Check browser site settings, Windows input device, and whether another app is holding the mic."
      );
      addTranscriptLine("SYSTEM: Live probe detected no voice signal");
      return;
    }

    setMicStatus("Voice signal detected. Testing speech capture...");
    setMicTestNote("Voice signal detected. Now checking whether speech capture returns text.");
    const result = await captureWithMic();
    setMicSignalState(
      `Transcript OK (${Math.round(result?.voiceMetrics?.maxVolume || probe.maxLevel || 0)}%)`
    );
    setMicStatus(`Mic test success: ${result.transcript}`);
    addTranscriptLine(`Mic test: ${result.transcript}`);
    setMicTestNote("Mic is working. You can start the interview now.");
  } catch (error) {
    setMicSignalState("Capture failed");
    setMicStatus(`Mic test failed: ${error.message}`);
    addTranscriptLine(`Mic test failed: ${error.message}`);
    setMicTestNote(
      "If the level bar moved but transcription failed, the browser heard you but the speech capture path still failed. Use text temporarily or try Chrome/Edge."
    );
  }
}

export function attachMicTest() {
  ensureTextInput();
  ensureMicDeviceControls();
  const btn = ensureMicTestButton();
  const support = getMicSupportSummary();
  loadMicDevices().catch(() => {});
  setMicSupportState(support);
  setMicPermissionState("Unknown");
  setMicSignalState("Not tested");
  setMicPath("Idle");
  setMicLevel(0);
  logSystem(
    `Mic support - speechRecognition:${support.recognition} mediaDevices:${support.mediaDevices} audioContext:${support.audioContext} recorder:${support.recorder}`
  );
  setMicStatus(
    support.recognition
      ? "Mic ready. Best results on Chrome or Edge."
      : "Mic fallback ready. Browser speech recognition is unavailable, so recorded audio fallback will be used."
  );
  setMicTestNote(
    support.recognition
      ? "SpeechRecognition is available. Test Mic will first confirm live signal and then transcript capture."
      : "SpeechRecognition is unavailable. The mic test will use browser audio capture and transcription fallback."
  );
  btn.onclick = () => runMicTest();
}
