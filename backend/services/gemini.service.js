import OpenAI, { toFile } from "openai";

const OPENAI_TEXT_MODELS = [
  "gpt-4o-mini",
  "gpt-4o",
  "gpt-4.1-mini",
  "gpt-4.1",
  "gpt-5-mini"
];

const OPENAI_AUDIO_MODELS = [
  "gpt-4o-mini-transcribe",
  "gpt-4o-transcribe",
  "whisper-1"
];

const GEMINI_TEXT_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-latest"
];

const GEMINI_AUDIO_MODELS = [
  "gemini-2.5-flash-native-audio-latest",
  "gemini-2.5-flash",
  "gemini-2.0-flash"
];

function getOpenAiClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({
    apiKey,
    maxRetries: 0,
    timeout: 15000
  });
}

function getGeminiApiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    ""
  ).trim();
}

function getStatus(error) {
  return Number(error?.status || error?.code || 0) || 0;
}

function getErrorCode(error) {
  return String(error?.code || error?.error?.code || "").trim();
}

function isOpenAiFallbackStatus(status) {
  return status === 400 || status === 404 || status === 429;
}

function parseGeminiError(payload) {
  return (
    payload?.error?.message ||
    payload?.message ||
    "Gemini request failed"
  );
}

function extractGeminiText(payload) {
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";

  return parts
    .map(part => String(part?.text || "").trim())
    .filter(Boolean)
    .join("\n")
    .trim();
}

async function geminiRequest(model, body) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return {
      ok: false,
      error: "Gemini API key is missing"
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        signal: controller.signal
      }
    );

    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: parseGeminiError(payload)
      };
    }

    return {
      ok: true,
      payload
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error?.name === "AbortError"
          ? "Gemini request timed out"
          : error?.message || "Gemini request failed"
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function askViaOpenAi(prompt) {
  const client = getOpenAiClient();
  if (!client) return { ok: false, error: "OPENAI_API_KEY is missing" };

  for (const model of OPENAI_TEXT_MODELS) {
    try {
      const response = await client.responses.create({
        model,
        input: String(prompt || "")
      });

      if (response?.output_text?.trim()) {
        return {
          ok: true,
          provider: "OpenAI",
          model,
          text: response.output_text.trim()
        };
      }
    } catch (error) {
      if (getErrorCode(error) === "insufficient_quota") {
        return {
          ok: false,
          provider: "OpenAI",
          error: "OPENAI_API_KEY has insufficient quota"
        };
      }

      const status = getStatus(error);
      if (isOpenAiFallbackStatus(status)) {
        continue;
      }

      return {
        ok: false,
        provider: "OpenAI",
        error: error?.message || "OpenAI text request failed"
      };
    }
  }

  return {
    ok: false,
    provider: "OpenAI",
    error: "No compatible OpenAI text model available"
  };
}

function extractJsonBlock(text) {
  if (typeof text !== "string") return null;
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

async function askViaGemini(prompt) {
  for (const model of GEMINI_TEXT_MODELS) {
    const result = await geminiRequest(model, {
      contents: [
        {
          role: "user",
          parts: [{ text: String(prompt || "") }]
        }
      ],
      generationConfig: {
        temperature: 0.4
      }
    });

    if (!result.ok) {
      if (result.status === 400 || result.status === 404 || result.status === 429) {
        continue;
      }

      return {
        ok: false,
        provider: "Gemini",
        error: result.error
      };
    }

    const text = extractGeminiText(result.payload);
    if (text) {
      return {
        ok: true,
        provider: "Gemini",
        model,
        text
      };
    }
  }

  return {
    ok: false,
    provider: "Gemini",
    error: "No compatible Gemini text model available"
  };
}

async function transcribeViaOpenAi({ audioBase64, mimeType = "audio/webm" }) {
  const client = getOpenAiClient();
  if (!client || !audioBase64) {
    return { ok: false, error: "OpenAI transcription unavailable" };
  }

  const bytes = Buffer.from(audioBase64, "base64");
  const extension = mimeType.includes("wav")
    ? "wav"
    : mimeType.includes("mp4")
      ? "mp4"
      : mimeType.includes("ogg")
        ? "ogg"
        : "webm";

  for (const model of OPENAI_AUDIO_MODELS) {
    try {
      const file = await toFile(bytes, `input.${extension}`, { type: mimeType });
      const transcript = await client.audio.transcriptions.create({
        file,
        model
      });

      const text = typeof transcript === "string" ? transcript : transcript?.text;
      if (text?.trim()) {
        return {
          ok: true,
          provider: "OpenAI",
          model,
          text: String(text).trim()
        };
      }
    } catch (error) {
      if (getErrorCode(error) === "insufficient_quota") {
        return {
          ok: false,
          provider: "OpenAI",
          error: "OPENAI_API_KEY has insufficient quota"
        };
      }

      const status = getStatus(error);
      if (isOpenAiFallbackStatus(status)) {
        continue;
      }

      return {
        ok: false,
        provider: "OpenAI",
        error: error?.message || "OpenAI transcription failed"
      };
    }
  }

  return {
    ok: false,
    provider: "OpenAI",
    error: "No compatible OpenAI audio model available"
  };
}

async function transcribeViaGemini({ audioBase64, mimeType = "audio/webm" }) {
  for (const model of GEMINI_AUDIO_MODELS) {
    const result = await geminiRequest(model, {
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                "Transcribe the spoken audio exactly. Return only the transcript text. If there is no speech, return an empty string."
            },
            {
              inlineData: {
                mimeType,
                data: audioBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0
      }
    });

    if (!result.ok) {
      if (result.status === 400 || result.status === 404 || result.status === 429) {
        continue;
      }

      return {
        ok: false,
        provider: "Gemini",
        error: result.error
      };
    }

    const text = extractGeminiText(result.payload);
    if (text) {
      return {
        ok: true,
        provider: "Gemini",
        model,
        text
      };
    }
  }

  return {
    ok: false,
    provider: "Gemini",
    error: "No compatible Gemini audio model available"
  };
}

export async function askGemini(prompt) {
  // Prefer OpenAI first for structured interview and resume flows.
  const openAi = await askViaOpenAi(prompt);
  if (openAi.ok) {
    return openAi.text;
  }

  const gemini = await askViaGemini(prompt);
  if (gemini.ok) {
    return gemini.text;
  }

  return "No response";
}

export async function checkGeminiHealth() {
  const openAi = await askViaOpenAi("Reply with OK");
  if (openAi.ok) {
    return {
      ok: true,
      reason: `AI reachable via ${openAi.provider} ${openAi.model}`
    };
  }

  const gemini = await askViaGemini("Reply with OK");
  if (gemini.ok) {
    return {
      ok: true,
      reason: `AI reachable via ${gemini.provider} ${gemini.model} (OpenAI unavailable)`
    };
  }

  return { ok: false, reason: openAi.error || gemini.error || "No AI provider available" };
}

export async function transcribeAudioWithGemini({
  audioBase64,
  mimeType = "audio/webm"
}) {
  const openAi = await transcribeViaOpenAi({ audioBase64, mimeType });
  if (openAi.ok) {
    return openAi.text;
  }

  const gemini = await transcribeViaGemini({ audioBase64, mimeType });
  if (gemini.ok) {
    return gemini.text;
  }

  return "";
}

export async function askAiJson(prompt, fallback = null) {
  const raw = await askGemini(`${prompt}\nReturn valid JSON only.`);
  return extractJsonBlock(raw) || fallback;
}
