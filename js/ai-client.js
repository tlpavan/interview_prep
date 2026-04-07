import { sessionState } from "./interview/session-state.js";
import { apiFetch } from "./api-base.js";

export async function startInterview() {
  const res = await apiFetch("/api/interview/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: sessionState.userName,
      type: sessionState.interviewType,
      difficulty: sessionState.difficulty,
      totalQuestions: sessionState.totalQuestions
    })
  });

  return await res.json();
}
