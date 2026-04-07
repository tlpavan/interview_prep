export function getVapiConfig() {
  return {
    apiKey: process.env.VAPI_API_KEY,
    assistant: {
      voice: "jessica",
      model: "gpt-4o-mini",
      firstMessage:
        "Hello, let's start your mock interview. Introduce yourself."
    }
  };
}
