import { askAiJson, askGemini } from "./gemini.service.js";

const TECH_QUESTIONS = {
  general: [
    "Explain the event loop in JavaScript.",
    "What is the difference between SQL and NoSQL databases?",
    "How do you design a scalable API?",
    "Explain REST vs GraphQL and when you would use each.",
    "What are common causes of performance bottlenecks in web apps?",
    "Explain how caching works and where you would apply it."
  ],
  dsa: [
    "Explain the time complexity of binary search.",
    "What is the difference between BFS and DFS?",
    "How would you detect a cycle in a linked list?",
    "Explain how a hash table works.",
    "How would you design an LRU cache?",
    "Explain the tradeoffs between arrays and linked lists."
  ],
  "web development": [
    "Explain the difference between SSR and CSR.",
    "How does HTTP/2 improve performance over HTTP/1.1?",
    "What is CORS and how do you handle it?",
    "How do you secure a web application?",
    "What is the role of a CDN?",
    "Explain how cookies and sessions work."
  ],
  cloud: [
    "Explain the difference between IaaS, PaaS, and SaaS.",
    "How do you design for high availability in the cloud?",
    "What is auto-scaling and how does it work?",
    "Explain the difference between horizontal and vertical scaling.",
    "How would you set up logging and monitoring in the cloud?",
    "What is a VPC and why is it important?"
  ],
  "machine learning": [
    "Explain the bias-variance tradeoff.",
    "What is overfitting and how do you prevent it?",
    "Explain the difference between supervised and unsupervised learning.",
    "What is cross-validation and why is it useful?",
    "Explain precision vs recall.",
    "How would you handle imbalanced datasets?"
  ]
};

const HR_QUESTIONS = [
  "Tell me about yourself.",
  "Describe a time you handled a conflict at work.",
  "What are your strengths and weaknesses?",
  "Why do you want this role?",
  "Tell me about a time you failed and what you learned.",
  "How do you prioritize tasks under pressure?",
  "Describe a time you led a team.",
  "Where do you see yourself in two years?"
];

function normalizeDomain(domain) {
  const text = String(domain || "").toLowerCase();
  if (!text) return "general";
  if (text.includes("dsa")) return "dsa";
  if (text.includes("web")) return "web development";
  if (text.includes("cloud")) return "cloud";
  if (text.includes("ml") || text.includes("machine")) return "machine learning";
  return "general";
}

function parseJsonBlock(text, fallback) {
  if (typeof text !== "string") return fallback;
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const block = cleaned.match(/\{[\s\S]*\}/);
    if (!block) return fallback;
    try {
      return JSON.parse(block[0]);
    } catch {
      return fallback;
    }
  }
}

export async function extractNameFromSpeech(transcript) {
  const local = String(transcript || "").trim();
  const common = local.match(
    /\b(?:i am|i'm|my name is|this is)\s+([a-zA-Z]+)\b/i
  );
  if (common?.[1]) {
    const n = common[1];
    return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
  }

  const raw = await askGemini(`
Extract only the person's first name from this sentence.
Return JSON only:
{"name":"string"}
If name is unclear, return {"name":"User"}.
Sentence: ${transcript}
`);

  const parsed = parseJsonBlock(raw, { name: "User" });
  return parsed?.name?.trim?.() || "User";
}

export async function generateInterviewQuestion({
  userName,
  interviewType,
  domain,
  difficulty,
  askedQuestions,
  lastAnswer
}) {
  const type = String(interviewType || "").toLowerCase();
  const isHr = type.includes("hr");
  const normalized = normalizeDomain(domain);
  const parsed = await askAiJson(
    `
You are an expert mock interviewer.
Candidate name: ${userName}.
Interview type: ${isHr ? "HR" : "Technical"}.
Question domain: ${isHr ? "general HR" : normalized}.
Difficulty: ${difficulty || "medium"}.
Question number: ${askedQuestions + 1}.
Previous answer: ${lastAnswer || "None"}.

Write the next interview question.
Rules:
- Ask exactly one question.
- Keep it concise and natural.
- If technical, the question must stay in the selected technical domain.
- If HR, ask only behavioral, teamwork, motivation, communication, leadership, or conflict questions.
- If there was a previous answer, make the next question feel like a realistic follow-up or progression.
- Address the candidate by name once at most.

Schema:
{"question":"string"}
    `,
    null
  );

  if (parsed?.question) {
    return parsed.question;
  }

  if (isHr) {
    const idx = askedQuestions % HR_QUESTIONS.length;
    return `${userName}, ${HR_QUESTIONS[idx]}`;
  }

  const pool = TECH_QUESTIONS[normalized] || TECH_QUESTIONS.general;
  const idx = askedQuestions % pool.length;
  return `${userName}, ${pool[idx]}`;
}
