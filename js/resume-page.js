import * as pdfjsLib from "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.min.mjs";
import { apiFetch } from "./api-base.js";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.7.76/build/pdf.worker.min.mjs";

const analyzeBtn = document.getElementById("analyze-resume-btn");
const resumeTextInput = document.getElementById("resume-text");
const analysisResultEl = document.getElementById("resume-result");
const fileInput = document.getElementById("resume-file");

const previewEl = document.getElementById("resume-preview");
const downloadBtn = document.getElementById("resume-download-btn");
const printBtn = document.getElementById("resume-print-btn");
const improveBtn = document.getElementById("resume-improve-btn");
const addExperienceBtn = document.getElementById("add-experience-btn");
const addProjectBtn = document.getElementById("add-project-btn");
const addEducationBtn = document.getElementById("add-education-btn");
const experienceListEl = document.getElementById("experience-list");
const projectListEl = document.getElementById("project-list");
const educationListEl = document.getElementById("education-list");
const builderStatusEl = document.getElementById("resume-builder-status");

const RESUME_BUILDER_STORAGE_KEY = "resumeBuilderData";

const fieldIds = [
  "resume-full-name",
  "resume-role",
  "resume-email",
  "resume-phone",
  "resume-location",
  "resume-linkedin",
  "resume-github",
  "resume-portfolio",
  "resume-summary",
  "resume-skills",
  "resume-certifications"
];

function getField(id) {
  return document.getElementById(id);
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function slugify(text) {
  return String(text || "resume")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "resume";
}

function splitCommaList(text) {
  return String(text || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

function splitLineList(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map(item => item.trim())
    .filter(Boolean);
}

function readRepeatableItems(container) {
  return [...container.querySelectorAll(".repeatable-item")].map(item => {
    const payload = {};
    item.querySelectorAll("[data-field]").forEach(field => {
      payload[field.dataset.field] = field.value.trim();
    });
    return payload;
  });
}

function getResumeData() {
  return {
    fullName: getField("resume-full-name")?.value.trim() || "Your Name",
    role: getField("resume-role")?.value.trim() || "Target Role",
    email: getField("resume-email")?.value.trim() || "",
    phone: getField("resume-phone")?.value.trim() || "",
    location: getField("resume-location")?.value.trim() || "",
    linkedin: getField("resume-linkedin")?.value.trim() || "",
    github: getField("resume-github")?.value.trim() || "",
    portfolio: getField("resume-portfolio")?.value.trim() || "",
    summary: getField("resume-summary")?.value.trim() || "Add a short, impact-focused professional summary.",
    skills: splitCommaList(getField("resume-skills")?.value || ""),
    certifications: splitLineList(getField("resume-certifications")?.value || ""),
    experience: readRepeatableItems(experienceListEl)
      .map(item => ({
        ...item,
        bullets: splitLineList(item.bullets)
      }))
      .filter(item => item.role || item.company || item.bullets.length),
    projects: readRepeatableItems(projectListEl)
      .map(item => ({
        ...item,
        bullets: splitLineList(item.bullets)
      }))
      .filter(item => item.name || item.stack || item.bullets.length),
    education: readRepeatableItems(educationListEl).filter(
      item => item.degree || item.school || item.details
    )
  };
}

function buildAnalyzerTextFromBuilder(data = getResumeData()) {
  const lines = [
    data.fullName,
    data.role,
    data.email,
    data.phone,
    data.location,
    data.summary,
    data.skills.length ? `Skills: ${data.skills.join(", ")}` : "",
    data.certifications.length ? `Certifications: ${data.certifications.join(", ")}` : ""
  ];

  data.experience.forEach(item => {
    lines.push(`Experience: ${item.role || ""} at ${item.company || ""} ${item.dates || ""} ${item.location || ""}`.trim());
    item.bullets.forEach(bullet => lines.push(bullet));
  });

  data.projects.forEach(item => {
    lines.push(`Project: ${item.name || ""} ${item.stack || ""} ${item.link || ""}`.trim());
    item.bullets.forEach(bullet => lines.push(bullet));
  });

  data.education.forEach(item => {
    lines.push(`Education: ${item.degree || ""} ${item.school || ""} ${item.dates || ""} ${item.details || ""}`.trim());
  });

  return lines.filter(Boolean).join("\n");
}

function contactLink(label, value) {
  const normalized = normalizeUrl(value);
  if (!normalized) return "";
  return `<a href="${escapeHtml(normalized)}">${escapeHtml(label)}</a>`;
}

function renderExperience(items) {
  if (!items.length) return "";
  return `
    <section class="ats-resume__section">
      <h2>Experience</h2>
      ${items
        .map(
          item => `
            <article class="ats-entry">
              <div class="ats-entry__head">
                <div>
                  <strong>${escapeHtml(item.role || "Role")}</strong>
                  <span>${escapeHtml(item.company || "")}</span>
                </div>
                <div class="ats-entry__meta">
                  <span>${escapeHtml(item.dates || "")}</span>
                  <span>${escapeHtml(item.location || "")}</span>
                </div>
              </div>
              ${
                item.bullets.length
                  ? `<ul>${item.bullets.map(point => `<li>${escapeHtml(point)}</li>`).join("")}</ul>`
                  : ""
              }
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function renderProjects(items) {
  if (!items.length) return "";
  return `
    <section class="ats-resume__section">
      <h2>Projects</h2>
      ${items
        .map(
          item => `
            <article class="ats-entry">
              <div class="ats-entry__head">
                <div>
                  <strong>${escapeHtml(item.name || "Project")}</strong>
                  <span>${escapeHtml(item.stack || "")}</span>
                </div>
                <div class="ats-entry__meta">
                  ${item.link ? `<span>${escapeHtml(item.link)}</span>` : ""}
                </div>
              </div>
              ${
                item.bullets.length
                  ? `<ul>${item.bullets.map(point => `<li>${escapeHtml(point)}</li>`).join("")}</ul>`
                  : ""
              }
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function renderEducation(items) {
  if (!items.length) return "";
  return `
    <section class="ats-resume__section">
      <h2>Education</h2>
      ${items
        .map(
          item => `
            <article class="ats-entry">
              <div class="ats-entry__head">
                <div>
                  <strong>${escapeHtml(item.degree || "Degree")}</strong>
                  <span>${escapeHtml(item.school || "")}</span>
                </div>
                <div class="ats-entry__meta">
                  <span>${escapeHtml(item.dates || "")}</span>
                  <span>${escapeHtml(item.details || "")}</span>
                </div>
              </div>
            </article>
          `
        )
        .join("")}
    </section>
  `;
}

function buildResumeMarkup(data) {
  const contactItems = [
    data.email && `<span>${escapeHtml(data.email)}</span>`,
    data.phone && `<span>${escapeHtml(data.phone)}</span>`,
    data.location && `<span>${escapeHtml(data.location)}</span>`,
    contactLink("LinkedIn", data.linkedin),
    contactLink("GitHub", data.github),
    contactLink("Portfolio", data.portfolio)
  ].filter(Boolean);

  return `
    <article class="ats-resume">
      <header class="ats-resume__header">
        <h1>${escapeHtml(data.fullName)}</h1>
        <p class="ats-resume__role">${escapeHtml(data.role)}</p>
        <div class="ats-resume__contact">${contactItems.join("<span class=\"dot\">|</span>")}</div>
      </header>

      <section class="ats-resume__section">
        <h2>Summary</h2>
        <p>${escapeHtml(data.summary)}</p>
      </section>

      ${
        data.skills.length
          ? `
            <section class="ats-resume__section">
              <h2>Skills</h2>
              <div class="ats-skills">
                ${data.skills.map(skill => `<span>${escapeHtml(skill)}</span>`).join("")}
              </div>
            </section>
          `
          : ""
      }

      ${renderExperience(data.experience)}
      ${renderProjects(data.projects)}
      ${renderEducation(data.education)}

      ${
        data.certifications.length
          ? `
            <section class="ats-resume__section">
              <h2>Certifications</h2>
              <ul>${data.certifications.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
            </section>
          `
          : ""
      }
    </article>
  `;
}

function getResumeDocumentCss() {
  return `
    body { margin: 0; padding: 40px; font-family: Calibri, Arial, sans-serif; color: #111827; background: #ffffff; }
    .ats-resume { max-width: 850px; margin: 0 auto; }
    .ats-resume__header { border-bottom: 2px solid #d1d5db; padding-bottom: 14px; margin-bottom: 20px; }
    .ats-resume__header h1 { margin: 0; font-size: 30px; }
    .ats-resume__role { margin: 8px 0 0; font-size: 16px; color: #374151; font-weight: 700; }
    .ats-resume__contact { margin-top: 12px; font-size: 13px; color: #4b5563; line-height: 1.7; }
    .ats-resume__contact a { color: #111827; text-decoration: none; }
    .dot { margin: 0 8px; color: #9ca3af; }
    .ats-resume__section { margin-top: 18px; }
    .ats-resume__section h2 { margin: 0 0 8px; font-size: 15px; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #d1d5db; padding-bottom: 6px; }
    .ats-resume__section p, .ats-resume__section li, .ats-entry span { font-size: 13px; line-height: 1.6; }
    .ats-entry { margin-top: 12px; }
    .ats-entry__head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
    .ats-entry__head strong { display: block; font-size: 14px; }
    .ats-entry__head span { display: block; color: #4b5563; }
    .ats-entry__meta { text-align: right; min-width: 180px; }
    .ats-resume ul { margin: 8px 0 0; padding-left: 18px; }
    .ats-skills { display: flex; flex-wrap: wrap; gap: 8px; }
    .ats-skills span { padding: 4px 10px; border: 1px solid #d1d5db; border-radius: 999px; font-size: 12px; }
  `;
}

function buildResumeDocument(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>${escapeHtml(data.fullName)} Resume</title>
      <style>${getResumeDocumentCss()}</style>
    </head>
    <body>
      ${buildResumeMarkup(data)}
    </body>
    </html>
  `;
}

function renderResumePreview() {
  const data = getResumeData();
  previewEl.innerHTML = buildResumeMarkup(data);
  window.localStorage.setItem(RESUME_BUILDER_STORAGE_KEY, JSON.stringify(data));
}

function setBuilderStatus(text) {
  if (builderStatusEl) builderStatusEl.textContent = text;
}

function wireRepeatableItem(item) {
  item.querySelectorAll("input, textarea").forEach(field => {
    field.addEventListener("input", renderResumePreview);
  });
  item.querySelector("[data-remove-item]")?.addEventListener("click", () => {
    item.remove();
    renderResumePreview();
  });
}

function addRepeatableItem(section, values = {}) {
  const template = document.getElementById(`${section}-item-template`);
  const target =
    section === "experience"
      ? experienceListEl
      : section === "project"
        ? projectListEl
        : educationListEl;

  if (!template || !target) return;
  const fragment = template.content.cloneNode(true);
  const item = fragment.querySelector(".repeatable-item");
  item.querySelectorAll("[data-field]").forEach(field => {
    field.value = values[field.dataset.field] || "";
  });
  wireRepeatableItem(item);
  target.appendChild(item);
}

function populateBuilder(data = {}) {
  fieldIds.forEach(id => {
    const field = getField(id);
    if (!field) return;
    const key = id.replace(/^resume-/, "").replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
    const value = data[key];
    field.value = Array.isArray(value) ? value.join("\n") : value || "";
  });

  if (getField("resume-skills")) {
    getField("resume-skills").value = Array.isArray(data.skills) ? data.skills.join(", ") : (data.skills || "");
  }
  if (getField("resume-certifications")) {
    getField("resume-certifications").value = Array.isArray(data.certifications)
      ? data.certifications.join("\n")
      : (data.certifications || "");
  }

  experienceListEl.innerHTML = "";
  projectListEl.innerHTML = "";
  educationListEl.innerHTML = "";

  (data.experience || []).forEach(item => addRepeatableItem("experience", {
    ...item,
    bullets: Array.isArray(item.bullets) ? item.bullets.join("\n") : item.bullets || ""
  }));
  (data.projects || []).forEach(item => addRepeatableItem("project", {
    ...item,
    bullets: Array.isArray(item.bullets) ? item.bullets.join("\n") : item.bullets || ""
  }));
  (data.education || []).forEach(item => addRepeatableItem("education", item));

  renderResumePreview();
}

function downloadResumeDocument() {
  const data = getResumeData();
  const html = buildResumeDocument(data);
  const blob = new Blob([html], { type: "application/msword" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `${slugify(data.fullName)}-ats-resume.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

function printResumeDocument() {
  const data = getResumeData();
  const win = window.open("", "_blank", "width=960,height=900");
  if (!win) return;
  win.document.open();
  win.document.write(buildResumeDocument(data));
  win.document.close();
  win.focus();
  win.print();
}

function seedBuilder() {
  if (!experienceListEl?.children.length) {
    addRepeatableItem("experience", {
      role: "Software Developer Intern",
      company: "Example Company",
      dates: "Jan 2025 - Present",
      location: "Bengaluru",
      bullets: "Built internal dashboard features used by 500+ users.\nReduced API response time by 28% through caching and query optimization."
    });
  }
  if (!projectListEl?.children.length) {
    addRepeatableItem("project", {
      name: "Interview Prep Platform",
      stack: "JavaScript, Node.js, Firebase",
      link: "github.com/yourname/interview-prep",
      bullets: "Implemented AI-led technical and HR interview flows.\nAdded dashboard analytics, DSA practice, and ATS resume tooling."
    });
  }
  if (!educationListEl?.children.length) {
    addRepeatableItem("education", {
      degree: "B.Tech in Computer Science",
      school: "Example University",
      dates: "2021 - 2025",
      details: "CGPA 8.6/10"
    });
  }
}

function renderAnalysis(analysis) {
  if (!analysis || typeof analysis !== "object") {
    analysisResultEl.textContent = "No analysis received.";
    return;
  }

  const missing = (analysis.missingKeywords || []).map(k => `- ${k}`).join("\n") || "- None";
  const suggestions = (analysis.suggestions || []).map(s => `- ${s}`).join("\n") || "- None";

  analysisResultEl.textContent = [
    `ATS Score: ${analysis.atsScore ?? 0}/100`,
    "",
    `Technical Strength: ${analysis.technicalStrength || "N/A"}`,
    `Communication Strength: ${analysis.communicationStrength || "N/A"}`,
    "",
    "Missing Keywords:",
    missing,
    "",
    "Suggestions:",
    suggestions
  ].join("\n");
}

async function extractTextFromPdf(file) {
  const bytes = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: bytes }).promise;
  const parts = [];
  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const line = content.items.map(item => item.str).join(" ");
    parts.push(line);
  }
  return parts.join("\n");
}

async function analyzeResume() {
  let resumeText = resumeTextInput?.value?.trim() || "";
  if (!resumeText) {
    resumeText = buildAnalyzerTextFromBuilder();
    if (resumeTextInput) {
      resumeTextInput.value = resumeText;
    }
  }
  if (!resumeText) {
    analysisResultEl.textContent = "Please upload a PDF or paste resume text first.";
    return;
  }

  analysisResultEl.textContent = "Analyzing...";
  try {
    const res = await apiFetch("/api/resume/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resumeText })
    });
    const data = await res.json();
    if (!res.ok) {
      const detailText = Array.isArray(data?.details) ? data.details.join("\n") : (data?.details || "");
      analysisResultEl.textContent = detailText || data?.error || "Resume analysis failed.";
      return;
    }
    renderAnalysis(data.analysis);
  } catch (error) {
    analysisResultEl.textContent = `Error: ${error.message}`;
  }
}

async function improveResumeBuilder() {
  const payload = getResumeData();
  setBuilderStatus("Improving resume content with AI...");
  if (improveBtn) improveBtn.disabled = true;

  try {
    const res = await apiFetch("/api/resume/improve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      setBuilderStatus(data?.details || data?.error || "AI improvement failed.");
      return;
    }

    const improved = data.improved || {};
    if (getField("resume-summary") && improved.summary) {
      getField("resume-summary").value = improved.summary;
    }
    if (getField("resume-skills") && Array.isArray(improved.skills)) {
      getField("resume-skills").value = improved.skills.join(", ");
    }

    if (Array.isArray(improved.experience) && improved.experience.length) {
      experienceListEl.innerHTML = "";
      improved.experience.forEach(item => addRepeatableItem("experience", {
        ...item,
        bullets: Array.isArray(item.bullets) ? item.bullets.join("\n") : ""
      }));
    }

    if (Array.isArray(improved.projects) && improved.projects.length) {
      projectListEl.innerHTML = "";
      improved.projects.forEach(item => addRepeatableItem("project", {
        ...item,
        bullets: Array.isArray(item.bullets) ? item.bullets.join("\n") : ""
      }));
    }

    renderResumePreview();
    setBuilderStatus("AI improvements applied to the builder.");
  } catch (error) {
    setBuilderStatus(`Error: ${error.message}`);
  } finally {
    if (improveBtn) improveBtn.disabled = false;
  }
}

function loadSavedBuilder() {
  try {
    const raw = window.localStorage.getItem(RESUME_BUILDER_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    populateBuilder(parsed);
    setBuilderStatus("Loaded your last saved resume builder draft.");
    return true;
  } catch {
    return false;
  }
}

fileInput?.addEventListener("change", async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    analysisResultEl.textContent = "Please upload a PDF file.";
    return;
  }

  try {
    analysisResultEl.textContent = "Extracting text from PDF...";
    const text = await extractTextFromPdf(file);
    resumeTextInput.value = text;
    analysisResultEl.textContent = text.trim().length >= 20
      ? "PDF text extracted. Click Analyze Resume."
      : "The PDF text looks short, but you can still analyze it now. Add more text if the result is weak.";
  } catch (error) {
    analysisResultEl.textContent = `Failed to read PDF: ${error.message}`;
  }
});

analyzeBtn?.addEventListener("click", analyzeResume);
downloadBtn?.addEventListener("click", downloadResumeDocument);
printBtn?.addEventListener("click", printResumeDocument);
improveBtn?.addEventListener("click", improveResumeBuilder);
addExperienceBtn?.addEventListener("click", () => addRepeatableItem("experience"));
addProjectBtn?.addEventListener("click", () => addRepeatableItem("project"));
addEducationBtn?.addEventListener("click", () => addRepeatableItem("education"));

fieldIds.forEach(id => {
  getField(id)?.addEventListener("input", renderResumePreview);
});

if (!loadSavedBuilder()) {
  seedBuilder();
  renderResumePreview();
}
