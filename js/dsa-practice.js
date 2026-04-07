import { apiFetch } from "./api-base.js";

const questionListEl = document.getElementById("dsa-question-list");
const countEl = document.getElementById("dsa-count");
const companyEl = document.getElementById("dsa-company");
const difficultyEl = document.getElementById("dsa-difficulty");
const titleEl = document.getElementById("dsa-title");
const topicEl = document.getElementById("dsa-topic");
const promptEl = document.getElementById("dsa-prompt");
const constraintsEl = document.getElementById("dsa-constraints");
const examplesEl = document.getElementById("dsa-examples");
const hiddenCountEl = document.getElementById("dsa-hidden-count");
const languageSelectEl = document.getElementById("dsa-language");
const languageLabelEl = document.getElementById("dsa-language-label");
const entryFunctionEl = document.getElementById("dsa-entry-function");
const editorHintEl = document.getElementById("dsa-editor-hint");
const answerEl = document.getElementById("dsa-answer");
const statusEl = document.getElementById("dsa-status");
const evaluateBtn = document.getElementById("evaluate-dsa-btn");
const loadStarterBtn = document.getElementById("load-starter-btn");
const clearEditorBtn = document.getElementById("clear-editor-btn");
const resultEl = document.getElementById("dsa-result");
const scoreEl = document.getElementById("dsa-score");
const verdictEl = document.getElementById("dsa-verdict");
const strengthsEl = document.getElementById("dsa-strengths");
const improvementsEl = document.getElementById("dsa-improvements");
const visiblePassEl = document.getElementById("dsa-visible-pass");
const hiddenPassEl = document.getElementById("dsa-hidden-pass");
const runtimeStatusEl = document.getElementById("dsa-runtime-status");
const runtimeErrorEl = document.getElementById("dsa-runtime-error");
const visibleTestsEl = document.getElementById("dsa-visible-tests");
const correctApproachEl = document.getElementById("dsa-correct-approach");
const correctStepsEl = document.getElementById("dsa-correct-steps");
const complexityEl = document.getElementById("dsa-complexity");
const codeEl = document.getElementById("dsa-code");

let questions = [];
let activeQuestionId = "";
let activeLanguage = "javascript";

const languageLabels = {
  javascript: "JavaScript",
  python: "Python",
  java: "Java",
  cpp: "C++"
};

function setStatus(text, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.classList.toggle("focus-pill--error", Boolean(isError));
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatValue(value) {
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function getActiveQuestion() {
  return questions.find(item => item.id === activeQuestionId) || null;
}

function renderList() {
  if (!questionListEl) return;
  questionListEl.innerHTML = "";

  questions.forEach(question => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `dsa-list-item${question.id === activeQuestionId ? " active" : ""}`;
    button.innerHTML = `
      <span class="dsa-list-item__company">${escapeHtml(question.company)}</span>
      <strong>${escapeHtml(question.title)}</strong>
      <span class="dsa-list-item__meta">${escapeHtml(question.topic)} - ${escapeHtml(question.difficulty)}</span>
    `;
    button.addEventListener("click", () => selectQuestion(question.id));
    questionListEl.appendChild(button);
  });
}

function renderExamples(question) {
  if (!examplesEl) return;
  examplesEl.innerHTML = "";

  (question.visibleExamples || []).forEach(example => {
    const card = document.createElement("article");
    card.className = "example-card";
    card.innerHTML = `
      <h4>${escapeHtml(example.label || "Example")}</h4>
      <div class="example-io">
        <span>Input</span>
        <pre>${escapeHtml(formatValue(example.args))}</pre>
      </div>
      <div class="example-io">
        <span>Expected</span>
        <pre>${escapeHtml(formatValue(example.expected))}</pre>
      </div>
    `;
    examplesEl.appendChild(card);
  });
}

function resetResult() {
  resultEl?.classList.add("hidden");
  if (runtimeErrorEl) {
    runtimeErrorEl.textContent = "";
    runtimeErrorEl.classList.add("hidden");
  }
  if (visibleTestsEl) {
    visibleTestsEl.innerHTML = "";
  }
}

function loadStarterCode(question) {
  if (!answerEl || !question) return;
  const starterCode =
    question.starterCodeByLanguage?.[activeLanguage] ||
    question.starterCode ||
    "";
  answerEl.value = starterCode;
  answerEl.focus();
}

function fillQuestion(question) {
  if (!question) return;

  titleEl.textContent = question.title;
  topicEl.textContent = question.topic;
  promptEl.textContent = question.prompt;
  companyEl.textContent = question.company;
  difficultyEl.textContent = question.difficulty;
  hiddenCountEl.textContent = `${Number(question.hiddenTestCount || 0)} hidden tests`;
  entryFunctionEl.textContent = question.entryFunction || "function";
  languageLabelEl.textContent = languageLabels[activeLanguage] || "JavaScript";
  editorHintEl.textContent = `Implement ${question.entryFunction || "the required function"} in ${languageLabels[activeLanguage] || "JavaScript"} and run the evaluation.`;

  constraintsEl.innerHTML = "";
  (question.constraints || []).forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    constraintsEl.appendChild(li);
  });

  renderExamples(question);
  loadStarterCode(question);
  resetResult();
  setStatus(`Selected ${question.company} problem. Edit the starter code and run the tests.`);
}

function selectQuestion(questionId) {
  activeQuestionId = questionId;
  renderList();
  fillQuestion(getActiveQuestion());
}

function renderListItems(listEl, items) {
  if (!listEl) return;
  listEl.innerHTML = "";
  (items || []).forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    listEl.appendChild(li);
  });
}

function renderVisibleTests(testResults) {
  if (!visibleTestsEl) return;
  visibleTestsEl.innerHTML = "";

  (testResults?.visible || []).forEach((test, index) => {
    const article = document.createElement("article");
    article.className = "test-item";
    const stateClass = test.passed ? "test-badge--pass" : "test-badge--fail";
    const stateText = test.passed ? "Pass" : "Fail";
    article.innerHTML = `
      <div class="test-item__head">
        <strong>${escapeHtml(test.label || `Visible test ${index + 1}`)}</strong>
        <span class="test-badge ${stateClass}">${stateText}</span>
      </div>
      <div class="test-io-grid">
        <div class="test-io">
          <span>Expected</span>
          <pre>${escapeHtml(formatValue(test.expected))}</pre>
        </div>
        <div class="test-io">
          <span>Received</span>
          <pre>${escapeHtml(formatValue(test.received))}</pre>
        </div>
      </div>
    `;
    visibleTestsEl.appendChild(article);
  });
}

function renderResult(payload) {
  const { evaluation, testResults, correctAnswer } = payload || {};

  scoreEl.textContent = String(Math.max(0, Math.min(100, Number(evaluation?.score || 0))));
  verdictEl.textContent = evaluation?.verdict || "Evaluation ready.";
  renderListItems(strengthsEl, evaluation?.strengths || []);
  renderListItems(improvementsEl, evaluation?.improvements || []);

  visiblePassEl.textContent = `${Number(testResults?.passedVisible || 0)} / ${Number(testResults?.totalVisible || 0)}`;
  hiddenPassEl.textContent = `${Number(testResults?.passedHidden || 0)} / ${Number(testResults?.totalHidden || 0)}`;
  runtimeStatusEl.textContent =
    testResults?.executionMode === "review_only"
      ? "AI review only"
      : testResults?.runtimeError
        ? "Runtime error"
        : "No runtime error";

  if (testResults?.runtimeError || testResults?.reviewNote) {
    runtimeErrorEl.textContent = testResults.runtimeError || testResults.reviewNote;
    runtimeErrorEl.classList.remove("hidden");
  } else {
    runtimeErrorEl.textContent = "";
    runtimeErrorEl.classList.add("hidden");
  }
  renderVisibleTests(testResults);

  correctApproachEl.textContent = correctAnswer?.approach || "";
  correctStepsEl.innerHTML = "";
  (correctAnswer?.steps || []).forEach(step => {
    const li = document.createElement("li");
    li.textContent = step;
    correctStepsEl.appendChild(li);
  });

  complexityEl.textContent = correctAnswer?.complexity || "-";
  codeEl.textContent = correctAnswer?.code || "";
  resultEl.classList.remove("hidden");
}

async function loadQuestions() {
  const res = await apiFetch("/api/interview/dsa-practice/questions");
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.details || data?.error || "Failed to load DSA questions");
  }

  questions = Array.isArray(data?.questions) ? data.questions : [];
  if (countEl) countEl.textContent = String(questions.length);
  if (!questions.length) {
    setStatus("No DSA questions available right now.", true);
    return;
  }

  activeQuestionId = questions[0].id;
  renderList();
  fillQuestion(questions[0]);
}

async function evaluateAnswer() {
  const answer = String(answerEl?.value || "").trim();
  if (!activeQuestionId) {
    setStatus("Select a question first.", true);
    return;
  }
  if (!answer) {
    setStatus(`Write your ${languageLabels[activeLanguage] || "selected"} solution before evaluation.`, true);
    return;
  }

  evaluateBtn.disabled = true;
  evaluateBtn.textContent = "Running...";
  setStatus("Running visible and hidden tests, then scoring your solution.");

  try {
    const res = await apiFetch("/api/interview/dsa-practice/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: activeQuestionId,
        answer,
        language: activeLanguage
      })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.details || data?.error || "Failed to evaluate answer");
    }

    renderResult(data);
    setStatus("Evaluation complete. Review the failed cases and reference solution.");
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    evaluateBtn.disabled = false;
    evaluateBtn.textContent = "Run tests + evaluate";
  }
}

function handleTabKey(event) {
  if (event.key !== "Tab") return;
  event.preventDefault();
  const start = answerEl.selectionStart;
  const end = answerEl.selectionEnd;
  answerEl.value = `${answerEl.value.slice(0, start)}  ${answerEl.value.slice(end)}`;
  answerEl.selectionStart = answerEl.selectionEnd = start + 2;
}

evaluateBtn?.addEventListener("click", () => {
  evaluateAnswer();
});

loadStarterBtn?.addEventListener("click", () => {
  loadStarterCode(getActiveQuestion());
  setStatus("Starter code restored for the selected question.");
});

languageSelectEl?.addEventListener("change", () => {
  activeLanguage = languageSelectEl.value || "javascript";
  const question = getActiveQuestion();
  if (!question) return;
  languageLabelEl.textContent = languageLabels[activeLanguage] || "JavaScript";
  loadStarterCode(question);
  editorHintEl.textContent = `Implement ${question.entryFunction || "the required function"} in ${languageLabels[activeLanguage] || "JavaScript"} and run the evaluation.`;
  setStatus(
    activeLanguage === "java" || activeLanguage === "cpp"
      ? `${languageLabels[activeLanguage]} is enabled with AI review. Python and JavaScript also run automated tests locally.`
      : `${languageLabels[activeLanguage]} is enabled with automated tests.`
  );
});

clearEditorBtn?.addEventListener("click", () => {
  if (!answerEl) return;
  answerEl.value = "";
  answerEl.focus();
  setStatus("Editor cleared. You can paste a fresh solution now.");
});

answerEl?.addEventListener("keydown", handleTabKey);

loadQuestions().catch(error => {
  setStatus(error.message, true);
});
