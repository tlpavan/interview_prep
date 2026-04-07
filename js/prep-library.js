const QUESTION_BANK = [
  {
    id: "apt-tcs-profit-loss",
    category: "aptitude",
    company: "TCS",
    title: "Profit and loss quick math",
    topic: "Percentages",
    difficulty: "Easy",
    question:
      "A shopkeeper marks an item at Rs. 800 and gives a 10% discount. If the cost price is Rs. 660, what is the profit percentage?",
    answer:
      "Selling price after discount is Rs. 720. Profit is Rs. 60, so profit percentage is (60/660) x 100 = 9.09%.",
    method: [
      "First calculate the effective selling price after discount.",
      "Subtract cost price from selling price to get profit.",
      "Use profit divided by cost price into 100."
    ],
    tags: ["profit", "loss", "discount"]
  },
  {
    id: "apt-infosys-time-work",
    category: "aptitude",
    company: "Infosys",
    title: "Time and work partnership",
    topic: "Time and Work",
    difficulty: "Medium",
    question:
      "A can complete a task in 12 days and B can complete it in 18 days. In how many days will they complete the work together?",
    answer:
      "A's one-day work is 1/12 and B's one-day work is 1/18. Combined work is 5/36 per day, so total time is 36/5 days, or 7.2 days.",
    method: [
      "Convert each person's speed into work per day.",
      "Add the work rates.",
      "Take the reciprocal of the combined rate."
    ],
    tags: ["work-rate", "lcm", "joint-work"]
  },
  {
    id: "apt-accenture-ratio",
    category: "aptitude",
    company: "Accenture",
    title: "Ratio transformation",
    topic: "Ratios",
    difficulty: "Medium",
    question:
      "The ratio of boys to girls in a class is 7:5. If 8 girls join, the ratio becomes 7:6. Find the original number of students.",
    answer:
      "Let original counts be 7x and 5x. After 8 girls join, 7x/(5x+8) = 7/6, so 42x = 35x + 56 and x = 8. Original class size is 12x = 96.",
    method: [
      "Represent the class using ratio variables.",
      "Apply the updated ratio after the change.",
      "Solve for the common multiplier."
    ],
    tags: ["ratios", "linear-equation"]
  },
  {
    id: "apt-capgemini-speed-distance",
    category: "aptitude",
    company: "Capgemini",
    title: "Speed and distance correction",
    topic: "Time, Speed, Distance",
    difficulty: "Medium",
    question:
      "A train running at 54 km/h crosses a platform in 30 seconds. If the train length is 150 m, find the platform length.",
    answer:
      "54 km/h is 15 m/s. In 30 seconds, the train covers 450 m. Platform length is 450 - 150 = 300 m.",
    method: [
      "Convert km/h to m/s using 5/18.",
      "Multiply speed by time to get total distance covered.",
      "Subtract train length to isolate platform length."
    ],
    tags: ["train", "distance", "unit-conversion"]
  },
  {
    id: "apt-wipro-logic-seating",
    category: "aptitude",
    company: "Wipro",
    title: "Circular seating logic",
    topic: "Logical Reasoning",
    difficulty: "Hard",
    question:
      "Eight people are seated around a circle facing the center. P is second to the left of Q, R is third to the right of Q, and S is between P and R. What is the first step to solve it fast?",
    answer:
      "Fix Q at one position first. Place P second to Q's left and R third to Q's right. Only after fixing those anchors should you test the valid place for S between P and R.",
    method: [
      "Anchor one person to remove rotation ambiguity.",
      "Place strict left-right constraints first.",
      "Use elimination for the remaining positions."
    ],
    tags: ["reasoning", "seating", "arrangement"]
  },
  {
    id: "apt-amazon-di",
    category: "aptitude",
    company: "Amazon",
    title: "Data interpretation shortcut",
    topic: "Data Interpretation",
    difficulty: "Medium",
    question:
      "A table shows revenues of four products as 120, 180, 150, and 210 units. What is the percentage increase from the average of the first two products to the average of the last two products?",
    answer:
      "Average of first two is 150. Average of last two is 180. Increase is 30, so percentage increase is (30/150) x 100 = 20%.",
    method: [
      "Compute both averages first.",
      "Find the difference between the averages.",
      "Divide the increase by the original average."
    ],
    tags: ["di", "average", "percentage"]
  },
  {
    id: "dsa-amazon-sliding-window",
    category: "dsa",
    company: "Amazon",
    title: "Longest substring without repeating characters",
    topic: "Sliding Window",
    difficulty: "Medium",
    question:
      "Given a string, return the length of the longest substring without repeating characters.",
    answer:
      "Use a sliding window with a map of last seen indices. Expand the right pointer, and when a character repeats inside the current window, move the left pointer to one position after its last seen index. Track the maximum window length.",
    method: [
      "Keep `left` pointer and a hash map of last positions.",
      "Update `left = max(left, lastSeen[ch] + 1)` on repetition.",
      "Time complexity is O(n), space complexity is O(min(n, charset))."
    ],
    tags: ["hashmap", "window", "strings"]
  },
  {
    id: "dsa-microsoft-lru",
    category: "dsa",
    company: "Microsoft",
    title: "Design an LRU cache",
    topic: "System Design + Data Structures",
    difficulty: "Hard",
    question:
      "Design a cache that supports `get` and `put` in O(1) and evicts the least recently used key when capacity is full.",
    answer:
      "Combine a hash map with a doubly linked list. The map gives O(1) access to a node, and the linked list keeps most recently used items at the front and least recently used at the back. On every `get` or `put`, move the node to the front. Evict from the tail when full.",
    method: [
      "Hash map stores key to linked-list node.",
      "Doubly linked list maintains recency order.",
      "All operations stay O(1) because no traversal is needed."
    ],
    tags: ["cache", "dll", "design"]
  },
  {
    id: "dsa-google-merge-intervals",
    category: "dsa",
    company: "Google",
    title: "Merge overlapping intervals",
    topic: "Intervals",
    difficulty: "Medium",
    question:
      "Given a list of intervals, merge all overlapping intervals and return the compressed list.",
    answer:
      "Sort intervals by start time. Initialize the merged list with the first interval. For every next interval, if its start is within the current merged interval, update the end using the max end. Otherwise push a new interval.",
    method: [
      "Sorting creates a left-to-right sweep.",
      "Compare the current interval with the last merged interval.",
      "Time complexity is O(n log n) from sorting."
    ],
    tags: ["sorting", "intervals", "arrays"]
  },
  {
    id: "dsa-adobe-top-k",
    category: "dsa",
    company: "Adobe",
    title: "Top K frequent elements",
    topic: "Heap",
    difficulty: "Medium",
    question:
      "Return the `k` most frequent elements from an integer array.",
    answer:
      "First build a frequency map. Then either use a min-heap of size `k` or bucket sort by frequency. For interviews, the heap solution is easy to explain: push `(frequency, value)` and pop when heap size exceeds `k`.",
    method: [
      "Count frequencies with a hash map.",
      "Maintain only the top `k` items in a min-heap.",
      "Time complexity is O(n log k)."
    ],
    tags: ["heap", "frequency", "hashmap"]
  },
  {
    id: "dsa-walmart-binary-search",
    category: "dsa",
    company: "Walmart Global Tech",
    title: "Search in rotated sorted array",
    topic: "Binary Search",
    difficulty: "Medium",
    question:
      "Find a target value in a rotated sorted array in O(log n).",
    answer:
      "Run binary search while checking which half is sorted. If the left half is sorted and the target lies inside it, move `right`; otherwise move `left`. If the right half is sorted, do the symmetric check there.",
    method: [
      "Every step identifies one sorted half.",
      "Use target range checks to discard half the array.",
      "Time complexity is O(log n), space O(1)."
    ],
    tags: ["binary-search", "rotated-array"]
  },
  {
    id: "dsa-servicenow-graph",
    category: "dsa",
    company: "ServiceNow",
    title: "Shortest path in an unweighted graph",
    topic: "Graphs",
    difficulty: "Medium",
    question:
      "How do you find the minimum number of edges from a source node to every other node in an unweighted graph?",
    answer:
      "Use breadth-first search. BFS explores nodes level by level, so the first time a node is visited is via the shortest path in terms of edge count. Store distance as `distance[neighbor] = distance[current] + 1`.",
    method: [
      "Initialize queue with the source node.",
      "Mark visited nodes to avoid cycles and repeated work.",
      "BFS guarantees shortest path in unweighted graphs."
    ],
    tags: ["bfs", "graph", "shortest-path"]
  },
  {
    id: "hr-accenture-intro",
    category: "hr",
    company: "Accenture",
    title: "Tell me about yourself",
    topic: "Introduction",
    difficulty: "Easy",
    question:
      "Tell me about yourself in a way that fits a technical role.",
    answer:
      "Start with your current identity, move to relevant skills or project work, then close with why that experience makes you a fit for the target role. Keep it under 90 seconds and focus on evidence, not autobiography.",
    method: [
      "Present: current study/work profile.",
      "Past: strongest project, internship, or achievement.",
      "Future: why this company and role are the next logical step."
    ],
    tags: ["self-intro", "structure", "first-impression"]
  },
  {
    id: "hr-amazon-failure",
    category: "hr",
    company: "Amazon",
    title: "Describe a failure",
    topic: "Behavioral",
    difficulty: "Medium",
    question:
      "Tell me about a time you failed and what you learned from it.",
    answer:
      "Use the STAR method. Pick a real failure with measurable impact, explain your ownership clearly, show what you changed after it, and end with a better later outcome. The key is accountability plus a visible process change.",
    method: [
      "Situation and task in one or two lines.",
      "Action: what you did and where the gap was.",
      "Result and learning: what changed because of that experience."
    ],
    tags: ["star", "ownership", "learning"]
  },
  {
    id: "hr-infosys-strengths",
    category: "hr",
    company: "Infosys",
    title: "Strengths and weaknesses",
    topic: "Self-awareness",
    difficulty: "Medium",
    question:
      "What are your strengths and weaknesses?",
    answer:
      "Choose one strength with proof and one weakness that is real but manageable. For example, a strength can be structured problem solving with a project example. A weakness can be taking too long to finalize early versions, followed by the system you now use to time-box decisions.",
    method: [
      "Strength must include an example.",
      "Weakness must include an improvement plan.",
      "Avoid fake weaknesses such as 'I work too hard'."
    ],
    tags: ["self-awareness", "behavioral"]
  },
  {
    id: "hr-microsoft-conflict",
    category: "hr",
    company: "Microsoft",
    title: "Conflict with a teammate",
    topic: "Collaboration",
    difficulty: "Medium",
    question:
      "Describe a time you had a disagreement with a teammate during a project.",
    answer:
      "Frame the disagreement around decisions, not personalities. Explain the shared goal, the trade-off you disagreed on, how you aligned using data or a small experiment, and how the final outcome improved the project.",
    method: [
      "Keep the tone professional and calm.",
      "Show that you listened before pushing your own view.",
      "End with collaboration and outcome, not who 'won'."
    ],
    tags: ["teamwork", "conflict", "communication"]
  },
  {
    id: "hr-capgemini-why-role",
    category: "hr",
    company: "Capgemini",
    title: "Why this role and company",
    topic: "Motivation",
    difficulty: "Easy",
    question:
      "Why do you want this role, and why this company?",
    answer:
      "Tie together three things: what the company is known for, what the role will let you practice, and what you already bring. A strong answer sounds like a fit analysis, not generic praise.",
    method: [
      "Mention one concrete company reason such as delivery scale, product domain, or engineering culture.",
      "Mention one role reason tied to your skills.",
      "Finish with the value you can add from day one."
    ],
    tags: ["motivation", "role-fit"]
  },
  {
    id: "hr-deloitte-pressure",
    category: "hr",
    company: "Deloitte",
    title: "Working under pressure",
    topic: "Execution",
    difficulty: "Medium",
    question:
      "How do you prioritize when multiple deadlines hit at the same time?",
    answer:
      "Explain that you first separate urgent from important, confirm dependencies, and communicate early if a deadline risk appears. Use one example where you re-prioritized based on business impact and still delivered the most critical piece on time.",
    method: [
      "Clarify impact and dependency first.",
      "Break work into must-do, should-do, and later buckets.",
      "Communicate risks before they become surprises."
    ],
    tags: ["prioritization", "pressure", "ownership"]
  }
];

const categoryLabels = {
  aptitude: "Aptitude",
  dsa: "Technical DSA",
  hr: "Technical HR"
};

const grid = document.getElementById("library-grid");
const searchInput = document.getElementById("library-search");
const companySelect = document.getElementById("library-company-filter");
const statusEl = document.getElementById("library-status");
const totalCountEl = document.getElementById("library-total-count");
const companyCountEl = document.getElementById("library-company-count");
const tabs = Array.from(document.querySelectorAll(".library-tab"));

let activeCategory = "aptitude";

document.querySelectorAll(".dashboard-action").forEach(button => {
  button.addEventListener("click", () => {
    const target = button.dataset.target;
    if (target) window.location.href = target;
  });
});

function uniqueCompanies() {
  return [...new Set(QUESTION_BANK.map(item => item.company))].sort();
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createCard(item) {
  const article = document.createElement("article");
  article.className = "question-card";

  const tags = item.tags.map(tag => `<span class="question-tag">${escapeHtml(tag)}</span>`).join("");
  const method = item.method.map(step => `<li>${escapeHtml(step)}</li>`).join("");

  article.innerHTML = `
    <div class="question-card__top">
      <div>
        <p class="question-card__company">${escapeHtml(item.company)}</p>
        <h3>${escapeHtml(item.title)}</h3>
      </div>
      <span class="question-card__difficulty">${escapeHtml(item.difficulty)}</span>
    </div>
    <p class="question-card__meta">${escapeHtml(item.topic)} - ${escapeHtml(categoryLabels[item.category])}</p>
    <p class="question-card__question">${escapeHtml(item.question)}</p>
    <div class="question-tag-row">${tags}</div>
    <details class="question-answer">
      <summary>Show answer</summary>
      <p>${escapeHtml(item.answer)}</p>
      <div class="question-answer__label">How to approach it</div>
      <ul>${method}</ul>
    </details>
  `;

  return article;
}

function filteredQuestions() {
  const search = String(searchInput?.value || "").trim().toLowerCase();
  const company = String(companySelect?.value || "all");

  return QUESTION_BANK.filter(item => {
    if (item.category !== activeCategory) return false;
    if (company !== "all" && item.company !== company) return false;
    if (!search) return true;

    const haystack = [
      item.company,
      item.title,
      item.topic,
      item.question,
      item.answer,
      ...(item.tags || [])
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(search);
  });
}

function render() {
  if (!grid) return;

  const results = filteredQuestions();
  grid.innerHTML = "";

  if (!results.length) {
    grid.innerHTML = `
      <div class="spotlight-empty">
        <h3>No questions match this filter</h3>
        <p>Try another company, another category, or a broader search term.</p>
      </div>
    `;
  } else {
    results.forEach(item => {
      grid.appendChild(createCard(item));
    });
  }

  if (statusEl) {
    statusEl.textContent = `${categoryLabels[activeCategory]}: ${results.length} practice cards ready`;
  }
}

function initCompanies() {
  if (!companySelect) return;
  uniqueCompanies().forEach(company => {
    const option = document.createElement("option");
    option.value = company;
    option.textContent = company;
    companySelect.appendChild(option);
  });
}

function initStats() {
  if (totalCountEl) totalCountEl.textContent = String(QUESTION_BANK.length);
  if (companyCountEl) companyCountEl.textContent = String(uniqueCompanies().length);
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    activeCategory = tab.dataset.category || "aptitude";
    tabs.forEach(item => item.classList.toggle("active", item === tab));
    render();
  });
});

searchInput?.addEventListener("input", render);
companySelect?.addEventListener("change", render);

initCompanies();
initStats();
render();
