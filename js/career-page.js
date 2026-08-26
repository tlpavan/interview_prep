import { apiFetch } from "./api-base.js";

const btn = document.getElementById("generate-career-btn");
const skillsInput = document.getElementById("skills-input");
const goalsInput = document.getElementById("goals-input");
const result = document.getElementById("career-result");

btn?.addEventListener("click", async () => {
  const skills = skillsInput?.value?.trim() || "";
  const goals = goalsInput?.value?.trim() || "";

  if (!skills || !goals) {
    result.textContent = "Please enter both skills and goal.";
    return;
  }

  result.textContent = "Generating roadmap...";
  try {
    const skillList = skills
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);

    const res = await apiFetch("/api/career/path", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skills: skillList, goals })
    });
    const data = await res.json();
    if (!res.ok) {
      result.textContent = data?.details || data?.error || "Roadmap generation failed.";
      return;
    }
    result.textContent = data.roadmap || "No roadmap received.";
  } catch (error) {
    result.textContent = `Error: ${error.message}`;
  }
});
