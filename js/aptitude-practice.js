const TOPIC_BANK = {
  percentages: {
    label: "Percentages",
    feedback: {
      strong: "Strong percentage fundamentals. You are answering with the right setup and conversion steps.",
      medium: "Reasonable base. Recheck discount, profit, and percentage-change formulas more carefully.",
      weak: "This topic needs another pass. Slow down on conversion steps and write the formula before solving."
    },
    questions: [
      {
        id: "pct-1",
        company: "TCS",
        prompt: "A shirt marked at Rs. 1200 is sold at a 15% discount. What is the selling price?",
        options: ["Rs. 1020", "Rs. 1080", "Rs. 1140", "Rs. 980"],
        correctIndex: 0,
        explanation: "15% of 1200 is 180. Selling price = 1200 - 180 = 1020."
      },
      {
        id: "pct-2",
        company: "Infosys",
        prompt: "A number increases from 80 to 100. What is the percentage increase?",
        options: ["20%", "22.5%", "25%", "18%"],
        correctIndex: 2,
        explanation: "Increase is 20 on base 80. Percentage increase = (20/80) x 100 = 25%."
      },
      {
        id: "pct-3",
        company: "Wipro",
        prompt: "If 40% of a number is 56, what is the number?",
        options: ["120", "130", "140", "150"],
        correctIndex: 2,
        explanation: "0.4x = 56, so x = 56 / 0.4 = 140."
      },
      {
        id: "pct-4",
        company: "Capgemini",
        prompt: "A student scores 360 out of 450. What is the percentage score?",
        options: ["78%", "80%", "82%", "84%"],
        correctIndex: 1,
        explanation: "(360/450) x 100 = 80%."
      },
      {
        id: "pct-5",
        company: "Accenture",
        prompt: "The price of a laptop drops by 10% and then increases by 10%. Overall effect is:",
        options: ["No change", "1% increase", "1% decrease", "2% decrease"],
        correctIndex: 2,
        explanation: "Successive +10% and -10% lead to a net 1% decrease."
      },
      {
        id: "pct-6",
        company: "Amazon",
        prompt: "What is 12.5% of 640?",
        options: ["70", "75", "80", "85"],
        correctIndex: 2,
        explanation: "12.5% is one-eighth. 640 / 8 = 80."
      },
      {
        id: "pct-7",
        company: "Cognizant",
        prompt: "If A is 25% more than B, then B is how much less than A?",
        options: ["20%", "22%", "25%", "18%"],
        correctIndex: 0,
        explanation: "If B = 100, A = 125. Difference relative to A is 25/125 = 20%."
      },
      {
        id: "pct-8",
        company: "Deloitte",
        prompt: "A company’s revenue increases from 200 lakh to 260 lakh. What is the growth percentage?",
        options: ["20%", "25%", "30%", "35%"],
        correctIndex: 2,
        explanation: "Increase is 60 on base 200. Growth = 30%."
      },
      {
        id: "pct-9",
        company: "HCL",
        prompt: "What percent of 250 is 50?",
        options: ["10%", "15%", "20%", "25%"],
        correctIndex: 2,
        explanation: "(50/250) x 100 = 20%."
      },
      {
        id: "pct-10",
        company: "Tech Mahindra",
        prompt: "A product sold for Rs. 840 after a 20% discount. What was its marked price?",
        options: ["Rs. 1000", "Rs. 1020", "Rs. 1050", "Rs. 1080"],
        correctIndex: 2,
        explanation: "If 80% equals 840, marked price = 840 / 0.8 = 1050."
      }
    ]
  },
  "time-work": {
    label: "Time & Work",
    feedback: {
      strong: "Strong work-rate handling. You are converting people and teams into rates correctly.",
      medium: "You have the basics. Recheck reciprocal conversions and subtraction of work rates.",
      weak: "This topic needs reinforcement. Focus on one-day work, combined rates, and LCM setup."
    },
    questions: [
      {
        id: "tw-1",
        company: "Infosys",
        prompt: "A can finish a job in 12 days and B in 18 days. How many days together?",
        options: ["6.2", "7.2", "8", "9"],
        correctIndex: 1,
        explanation: "Combined rate = 1/12 + 1/18 = 5/36, so time = 36/5 = 7.2 days."
      },
      {
        id: "tw-2",
        company: "TCS",
        prompt: "A can do a job in 10 days. Working alone for 4 days, how much work is left?",
        options: ["50%", "60%", "40%", "70%"],
        correctIndex: 1,
        explanation: "A completes 4/10 of the work, so 6/10 = 60% remains."
      },
      {
        id: "tw-3",
        company: "Wipro",
        prompt: "A is twice as efficient as B. If B finishes a job in 18 days, A finishes it in:",
        options: ["6 days", "9 days", "12 days", "15 days"],
        correctIndex: 1,
        explanation: "Twice efficiency means half the time. 18 / 2 = 9 days."
      },
      {
        id: "tw-4",
        company: "Capgemini",
        prompt: "A can do a piece of work in 15 days and B in 20 days. If both work for 3 days, what fraction remains?",
        options: ["1/2", "7/20", "13/20", "11/20"],
        correctIndex: 2,
        explanation: "Combined rate = 1/15 + 1/20 = 7/60. In 3 days, work done = 7/20, so remaining work = 13/20."
      },
      {
        id: "tw-5",
        company: "Accenture",
        prompt: "A can complete a job in 8 days and B in 24 days. Together they complete it in:",
        options: ["5 days", "6 days", "7 days", "8 days"],
        correctIndex: 1,
        explanation: "Combined rate = 1/8 + 1/24 = 1/6, so they need 6 days."
      },
      {
        id: "tw-6",
        company: "Amazon",
        prompt: "12 workers finish a task in 15 days. How many workers are needed to finish it in 9 days?",
        options: ["18", "20", "22", "24"],
        correctIndex: 1,
        explanation: "Workers x days is constant. 12 x 15 = x x 9, so x = 20."
      },
      {
        id: "tw-7",
        company: "Deloitte",
        prompt: "A completes 1/5 of a job in a day. B completes 1/10 in a day. Working together for 2 days, the unfinished portion is:",
        options: ["1/5", "2/5", "3/5", "4/5"],
        correctIndex: 1,
        explanation: "Together they do 3/10 per day. In 2 days, 6/10 is done. Remaining is 4/10 = 2/5."
      },
      {
        id: "tw-8",
        company: "Cognizant",
        prompt: "A and B together finish a job in 6 days. A alone takes 10 days. B alone takes:",
        options: ["12 days", "14 days", "15 days", "18 days"],
        correctIndex: 2,
        explanation: "1/B = 1/6 - 1/10 = 1/15, so B takes 15 days."
      },
      {
        id: "tw-9",
        company: "HCL",
        prompt: "If 8 men complete a job in 21 days, then 14 men complete the same job in:",
        options: ["10 days", "11 days", "12 days", "13 days"],
        correctIndex: 2,
        explanation: "8 x 21 = 168 man-days. 168 / 14 = 12 days."
      },
      {
        id: "tw-10",
        company: "Tech Mahindra",
        prompt: "A can do a task in 16 days. B is 60% more efficient than A. B alone finishes it in:",
        options: ["10 days", "12 days", "14 days", "15 days"],
        correctIndex: 0,
        explanation: "B's efficiency is 1.6 times A's, so B's time = 16 / 1.6 = 10 days."
      }
    ]
  },
  reasoning: {
    label: "Logical Reasoning",
    feedback: {
      strong: "Strong reasoning accuracy. Your elimination and arrangement reading is stable.",
      medium: "You are close. Slow down and anchor the strongest constraint first.",
      weak: "This topic needs practice. Draw quick layouts and remove ambiguity before testing options."
    },
    questions: [
      {
        id: "lr-1",
        company: "TCS",
        prompt: "If all roses are flowers and some flowers fade quickly, which conclusion is definitely true?",
        options: ["All flowers are roses", "Some roses fade quickly", "All roses are flowers", "No flowers fade quickly"],
        correctIndex: 2,
        explanation: "The first statement directly gives 'All roses are flowers'."
      },
      {
        id: "lr-2",
        company: "Infosys",
        prompt: "In a row of five people, A is left of B and right of C. Which order must be true?",
        options: ["C-A-B", "A-C-B", "B-A-C", "A-B-C"],
        correctIndex: 0,
        explanation: "If A is right of C and left of B, then the sequence is C-A-B."
      },
      {
        id: "lr-3",
        company: "Wipro",
        prompt: "Choose the odd one out: 3, 7, 15, 31, 62",
        options: ["7", "15", "31", "62"],
        correctIndex: 3,
        explanation: "Pattern is 2n + 1: 3, 7, 15, 31, 63. So 62 is the odd one out."
      },
      {
        id: "lr-4",
        company: "Capgemini",
        prompt: "If SOUTH is coded as 12345 and NORTH as 67845, what digit represents H?",
        options: ["4", "5", "7", "8"],
        correctIndex: 1,
        explanation: "H is common at the end of both words, so it maps to 5."
      },
      {
        id: "lr-5",
        company: "Accenture",
        prompt: "P is taller than Q. Q is taller than R. S is taller than P. Who is tallest?",
        options: ["P", "Q", "R", "S"],
        correctIndex: 3,
        explanation: "S > P > Q > R, so S is tallest."
      },
      {
        id: "lr-6",
        company: "Amazon",
        prompt: "Find the next number: 2, 6, 12, 20, 30, ?",
        options: ["36", "40", "42", "44"],
        correctIndex: 2,
        explanation: "Differences are 4, 6, 8, 10. Next difference is 12, so 30 + 12 = 42."
      },
      {
        id: "lr-7",
        company: "Deloitte",
        prompt: "All pens are stationery items. Some stationery items are expensive. Which statement can be true?",
        options: ["Some pens are expensive", "No pens are stationery", "All expensive items are pens", "No stationery is expensive"],
        correctIndex: 0,
        explanation: "It is possible that some pens fall in the expensive stationery subset."
      },
      {
        id: "lr-8",
        company: "Cognizant",
        prompt: "A is facing north. He turns right, then right again. Which direction is he facing now?",
        options: ["North", "South", "East", "West"],
        correctIndex: 1,
        explanation: "North -> East -> South."
      },
      {
        id: "lr-9",
        company: "HCL",
        prompt: "In a family, M is the son of P. P is the daughter of Q. Q is the wife of R. How is M related to R?",
        options: ["Son", "Grandson", "Nephew", "Brother"],
        correctIndex: 1,
        explanation: "P is R's daughter, and M is P's son. So M is R's grandson."
      },
      {
        id: "lr-10",
        company: "Tech Mahindra",
        prompt: "Which option completes the analogy: Book : Read :: Song : ?",
        options: ["Write", "Hear", "Sing", "Dance"],
        correctIndex: 1,
        explanation: "A book is read; a song is heard."
      }
    ]
  }
};

const tabs = Array.from(document.querySelectorAll(".library-tab"));
const titleEl = document.getElementById("aptitude-topic-title");
const statusEl = document.getElementById("aptitude-status");
const questionListEl = document.getElementById("aptitude-question-list");
const submitBtn = document.getElementById("submit-aptitude-btn");
const scoreEl = document.getElementById("aptitude-score");
const feedbackEl = document.getElementById("aptitude-feedback");
const attemptedEl = document.getElementById("aptitude-attempted");
const correctEl = document.getElementById("aptitude-correct");
const topicPillEl = document.getElementById("aptitude-topic-pill");
const reviewEl = document.getElementById("aptitude-review");

let activeTopic = "percentages";

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getActiveSet() {
  return TOPIC_BANK[activeTopic];
}

function renderQuestions() {
  const set = getActiveSet();
  titleEl.textContent = `${set.label} - 10 questions`;
  topicPillEl.textContent = set.label;
  statusEl.textContent = `${set.label} practice loaded. Answer all 10 questions and submit.`;
  questionListEl.innerHTML = "";
  reviewEl.innerHTML = "";
  feedbackEl.textContent = "Choose the best option for each question, then submit to see marks and explanations.";
  scoreEl.textContent = "0";
  attemptedEl.textContent = "0 / 10";
  correctEl.textContent = "0 / 10";

  set.questions.forEach((question, index) => {
    const card = document.createElement("article");
    card.className = "quiz-card";
    card.innerHTML = `
      <div class="quiz-card__head">
        <div>
          <p class="question-card__company">${escapeHtml(question.company)}</p>
          <h3>Q${index + 1}. ${escapeHtml(question.prompt)}</h3>
        </div>
      </div>
      <div class="quiz-options">
        ${question.options
          .map(
            (option, optionIndex) => `
              <label class="quiz-option">
                <input type="radio" name="${question.id}" value="${optionIndex}" />
                <span>${escapeHtml(option)}</span>
              </label>
            `
          )
          .join("")}
      </div>
    `;
    questionListEl.appendChild(card);
  });
}

function scoreFeedback(topic, score) {
  if (score >= 8) return topic.feedback.strong;
  if (score >= 5) return topic.feedback.medium;
  return topic.feedback.weak;
}

function renderReview(results, score, attempted) {
  const set = getActiveSet();
  reviewEl.innerHTML = "";

  results.forEach((result, index) => {
    const card = document.createElement("article");
    card.className = "test-item";
    card.innerHTML = `
      <div class="test-item__head">
        <strong>Q${index + 1} - ${escapeHtml(result.company)}</strong>
        <span class="test-badge ${result.correct ? "test-badge--pass" : "test-badge--fail"}">
          ${result.correct ? "Correct" : "Wrong"}
        </span>
      </div>
      <p class="dsa-verdict">${escapeHtml(result.prompt)}</p>
      <div class="test-io-grid">
        <div class="test-io">
          <span>Your answer</span>
          <pre>${escapeHtml(result.selected || "Not attempted")}</pre>
        </div>
        <div class="test-io">
          <span>Correct answer</span>
          <pre>${escapeHtml(result.correctAnswer)}</pre>
        </div>
      </div>
      <p class="muted">${escapeHtml(result.explanation)}</p>
    `;
    reviewEl.appendChild(card);
  });

  scoreEl.textContent = String(score * 10);
  attemptedEl.textContent = `${attempted} / 10`;
  correctEl.textContent = `${score} / 10`;
  feedbackEl.textContent = scoreFeedback(set, score);
}

function submitTopic() {
  const set = getActiveSet();
  const results = set.questions.map(question => {
    const selected = document.querySelector(`input[name="${question.id}"]:checked`);
    const selectedIndex = selected ? Number(selected.value) : -1;
    return {
      company: question.company,
      prompt: question.prompt,
      selected: selectedIndex >= 0 ? question.options[selectedIndex] : "",
      correctAnswer: question.options[question.correctIndex],
      correct: selectedIndex === question.correctIndex,
      attempted: selectedIndex >= 0,
      explanation: question.explanation
    };
  });

  const score = results.filter(item => item.correct).length;
  const attempted = results.filter(item => item.attempted).length;
  statusEl.textContent = `${set.label} submitted. Review your score and explanations below.`;
  renderReview(results, score, attempted);
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    activeTopic = tab.dataset.topic;
    tabs.forEach(item => item.classList.toggle("active", item === tab));
    renderQuestions();
  });
});

submitBtn?.addEventListener("click", submitTopic);

renderQuestions();
