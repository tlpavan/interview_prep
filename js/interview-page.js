import { beginInterview, attachMicTest } from "./interview/interview-flow.js";

const type = document.body.dataset.interviewType || "technical";
const startBtn =
  document.getElementById("start-voice-btn") ||
  document.getElementById("start-interview-btn");

if (startBtn) {
  attachMicTest();
  startBtn.addEventListener("click", () => {
    startBtn.disabled = true;
    beginInterview(type).finally(() => {
      startBtn.disabled = false;
    });
  });
}
