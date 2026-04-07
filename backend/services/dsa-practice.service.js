import vm from "node:vm";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { askGemini } from "./gemini.service.js";

const execFileAsync = promisify(execFile);
const SUPPORTED_DSA_LANGUAGES = ["javascript", "python", "java", "cpp"];

const DSA_QUESTIONS = [
  {
    id: "amazon-two-sum",
    company: "Amazon",
    title: "Two Sum",
    difficulty: "Easy",
    topic: "Arrays, Hash Map",
    prompt:
      "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`. You may assume exactly one valid answer exists and you may not use the same element twice.",
    constraints: [
      "Use better than O(n^2) if possible.",
      "Return indices, not the values.",
      "Explain why your approach works."
    ],
    entryFunction: "twoSum",
    starterCode: `function twoSum(nums, target) {
  // Write your solution here
}`,
    visibleExamples: [
      {
        label: "Example 1",
        args: [[2, 7, 11, 15], 9],
        expected: [0, 1],
        comparator: "unordered-array"
      },
      {
        label: "Example 2",
        args: [[3, 2, 4], 6],
        expected: [1, 2],
        comparator: "unordered-array"
      }
    ],
    hiddenTests: [
      { args: [[3, 3], 6], expected: [0, 1], comparator: "unordered-array" },
      { args: [[1, 5, 8, 10], 13], expected: [1, 2], comparator: "unordered-array" }
    ],
    expectedSignals: ["hash map", "complement", "one pass", "o(n)", "index"],
    correctAnswer: {
      approach:
        "Use a hash map to store each number you have seen along with its index. For each number, compute the complement `target - nums[i]`. If that complement is already in the map, you have found the pair. Otherwise store the current number and continue.",
      steps: [
        "Initialize an empty map.",
        "Loop through the array once.",
        "For each number, check whether its complement already exists in the map.",
        "If yes, return `[map.get(complement), i]`.",
        "If no, store `nums[i] -> i` in the map."
      ],
      complexity: "Time: O(n), Space: O(n)",
      code: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i += 1) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement), i];
    }
    seen.set(nums[i], i);
  }
  return [];
}`
    }
  },
  {
    id: "microsoft-merge-intervals",
    company: "Microsoft",
    title: "Merge Intervals",
    difficulty: "Medium",
    topic: "Sorting, Intervals",
    prompt:
      "Given an array of intervals where `intervals[i] = [start, end]`, merge all overlapping intervals and return an array of the non-overlapping intervals that cover all the intervals in the input.",
    constraints: [
      "Intervals may arrive unsorted.",
      "Keep the final list minimal.",
      "Explain why sorting is necessary."
    ],
    entryFunction: "merge",
    starterCode: `function merge(intervals) {
  // Write your solution here
}`,
    visibleExamples: [
      {
        label: "Example 1",
        args: [[[1, 3], [2, 6], [8, 10], [15, 18]]],
        expected: [[1, 6], [8, 10], [15, 18]],
        comparator: "deep-equal"
      }
    ],
    hiddenTests: [
      {
        args: [[[1, 4], [4, 5]]],
        expected: [[1, 5]],
        comparator: "deep-equal"
      },
      {
        args: [[[1, 4], [0, 2], [3, 5]]],
        expected: [[0, 5]],
        comparator: "deep-equal"
      }
    ],
    expectedSignals: ["sort", "start", "end", "overlap", "merge", "o(n log n)"],
    correctAnswer: {
      approach:
        "Sort the intervals by start time first. Then iterate through them and compare each interval with the last merged interval. If they overlap, extend the end boundary. Otherwise push a new interval.",
      steps: [
        "Sort intervals using the starting value.",
        "Initialize the result with the first interval.",
        "For each next interval, compare it with the last merged interval.",
        "If it overlaps, update the end with `Math.max(lastEnd, currentEnd)`.",
        "If it does not overlap, push it as a new interval."
      ],
      complexity: "Time: O(n log n), Space: O(n) in the output array",
      code: `function merge(intervals) {
  if (!intervals.length) return [];
  intervals.sort((a, b) => a[0] - b[0]);
  const merged = [intervals[0]];

  for (let i = 1; i < intervals.length; i += 1) {
    const last = merged[merged.length - 1];
    const current = intervals[i];
    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push(current);
    }
  }

  return merged;
}`
    }
  },
  {
    id: "google-longest-substring",
    company: "Google",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    topic: "Sliding Window, Strings",
    prompt:
      "Given a string `s`, find the length of the longest substring without repeating characters.",
    constraints: [
      "The solution should run in linear time.",
      "Track duplicates efficiently.",
      "Explain how the left pointer moves."
    ],
    entryFunction: "lengthOfLongestSubstring",
    starterCode: `function lengthOfLongestSubstring(s) {
  // Write your solution here
}`,
    visibleExamples: [
      { label: "Example 1", args: ["abcabcbb"], expected: 3, comparator: "primitive" },
      { label: "Example 2", args: ["bbbbb"], expected: 1, comparator: "primitive" }
    ],
    hiddenTests: [
      { args: ["pwwkew"], expected: 3, comparator: "primitive" },
      { args: ["dvdf"], expected: 3, comparator: "primitive" }
    ],
    expectedSignals: ["sliding window", "left", "right", "hash map", "last seen", "o(n)"],
    correctAnswer: {
      approach:
        "Use a sliding window with two pointers. Keep the latest index of each character in a hash map. When a repeated character appears within the current window, move the left pointer to one position after the previous occurrence.",
      steps: [
        "Initialize `left = 0`, `maxLen = 0`, and an empty map.",
        "Move the right pointer through the string.",
        "If `s[right]` was seen inside the current window, update `left`.",
        "Update the last seen index of the current character.",
        "Track the maximum window length after each step."
      ],
      complexity: "Time: O(n), Space: O(min(n, charset))",
      code: `function lengthOfLongestSubstring(s) {
  let left = 0;
  let best = 0;
  const lastSeen = new Map();

  for (let right = 0; right < s.length; right += 1) {
    const ch = s[right];
    if (lastSeen.has(ch) && lastSeen.get(ch) >= left) {
      left = lastSeen.get(ch) + 1;
    }
    lastSeen.set(ch, right);
    best = Math.max(best, right - left + 1);
  }

  return best;
}`
    }
  },
  {
    id: "adobe-top-k-frequent",
    company: "Adobe",
    title: "Top K Frequent Elements",
    difficulty: "Medium",
    topic: "Heap, Frequency Map",
    prompt:
      "Given an integer array `nums` and an integer `k`, return the `k` most frequent elements. You may return the answer in any order.",
    constraints: [
      "Avoid sorting the entire array by value frequency if possible.",
      "Explain why a heap or bucket strategy works.",
      "State the time complexity clearly."
    ],
    entryFunction: "topKFrequent",
    starterCode: `function topKFrequent(nums, k) {
  // Write your solution here
}`,
    visibleExamples: [
      {
        label: "Example 1",
        args: [[1, 1, 1, 2, 2, 3], 2],
        expected: [1, 2],
        comparator: "unordered-array"
      }
    ],
    hiddenTests: [
      {
        args: [[1], 1],
        expected: [1],
        comparator: "unordered-array"
      },
      {
        args: [[4, 4, 4, 5, 5, 6, 7, 7, 7, 7], 2],
        expected: [4, 7],
        comparator: "unordered-array"
      }
    ],
    expectedSignals: ["frequency map", "heap", "bucket", "top k", "o(n log k)"],
    correctAnswer: {
      approach:
        "Count each number using a frequency map. Then maintain a min-heap of size `k` based on frequency, or use bucket sort. In interviews, a heap explanation is usually clear and accepted.",
      steps: [
        "Build a frequency map from the array.",
        "Push each `[value, frequency]` entry into a min-heap.",
        "If heap size exceeds `k`, remove the smallest frequency.",
        "Extract the remaining heap elements as the answer."
      ],
      complexity: "Time: O(n log k), Space: O(n)",
      code: `function topKFrequent(nums, k) {
  const freq = new Map();
  for (const num of nums) {
    freq.set(num, (freq.get(num) || 0) + 1);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map(entry => entry[0]);
}`
    }
  },
  {
    id: "walmart-rotated-array",
    company: "Walmart Global Tech",
    title: "Search in Rotated Sorted Array",
    difficulty: "Medium",
    topic: "Binary Search",
    prompt:
      "Suppose an array sorted in ascending order is rotated at some pivot. Given the rotated array and a target value, return the index of the target if it exists, otherwise return `-1`. The algorithm should run in O(log n) time.",
    constraints: [
      "Use binary search logic.",
      "Explain how you determine which half is sorted.",
      "Keep the space complexity O(1)."
    ],
    entryFunction: "search",
    starterCode: `function search(nums, target) {
  // Write your solution here
}`,
    visibleExamples: [
      { label: "Example 1", args: [[4, 5, 6, 7, 0, 1, 2], 0], expected: 4, comparator: "primitive" }
    ],
    hiddenTests: [
      { args: [[4, 5, 6, 7, 0, 1, 2], 3], expected: -1, comparator: "primitive" },
      { args: [[1], 0], expected: -1, comparator: "primitive" }
    ],
    expectedSignals: ["binary search", "sorted half", "left", "right", "mid", "o(log n)"],
    correctAnswer: {
      approach:
        "At each step of binary search, one half of the array must still be sorted. Use that fact to determine whether the target lies in the sorted half. If yes, discard the other half. If no, search the opposite half.",
      steps: [
        "Set `left` and `right` pointers.",
        "Compute `mid` each iteration.",
        "Check whether the left half or right half is sorted.",
        "Decide whether the target falls inside the sorted half.",
        "Adjust pointers and continue until found or exhausted."
      ],
      complexity: "Time: O(log n), Space: O(1)",
      code: `function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;

    if (nums[left] <= nums[mid]) {
      if (nums[left] <= target && target < nums[mid]) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    } else {
      if (nums[mid] < target && target <= nums[right]) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
  }

  return -1;
}`
    }
  },
  {
    id: "servicenow-number-of-islands",
    company: "ServiceNow",
    title: "Number of Islands",
    difficulty: "Medium",
    topic: "Graphs, DFS/BFS",
    prompt:
      "Given an `m x n` grid of `1`s (land) and `0`s (water), return the number of islands. An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
    constraints: [
      "Visit each cell at most once.",
      "Use DFS or BFS.",
      "Explain why mutating or marking visited cells is important."
    ],
    entryFunction: "numIslands",
    starterCode: `function numIslands(grid) {
  // Write your solution here
}`,
    visibleExamples: [
      {
        label: "Example 1",
        args: [[["1", "1", "0", "0", "0"], ["1", "1", "0", "0", "0"], ["0", "0", "1", "0", "0"], ["0", "0", "0", "1", "1"]]],
        expected: 3,
        comparator: "primitive"
      }
    ],
    hiddenTests: [
      {
        args: [[["1", "1", "1"], ["0", "1", "0"], ["1", "1", "1"]]],
        expected: 1,
        comparator: "primitive"
      },
      {
        args: [[["0", "0"], ["0", "0"]]],
        expected: 0,
        comparator: "primitive"
      }
    ],
    expectedSignals: ["dfs", "bfs", "visited", "grid", "four directions", "o(m*n)"],
    correctAnswer: {
      approach:
        "Traverse every cell. Whenever you find unvisited land, increment the island count and run DFS or BFS to mark the whole connected component as visited. Each connected land mass is counted once.",
      steps: [
        "Loop through every grid cell.",
        "When you find `1`, increment the answer.",
        "Run DFS/BFS in four directions and mark visited cells.",
        "Continue scanning until the full grid is covered."
      ],
      complexity: "Time: O(m*n), Space: O(m*n) worst case recursion/queue",
      code: `function numIslands(grid) {
  if (!grid.length) return 0;
  const rows = grid.length;
  const cols = grid[0].length;
  let islands = 0;

  function dfs(r, c) {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== "1") {
      return;
    }
    grid[r][c] = "0";
    dfs(r + 1, c);
    dfs(r - 1, c);
    dfs(r, c + 1);
    dfs(r, c - 1);
  }

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (grid[r][c] === "1") {
        islands += 1;
        dfs(r, c);
      }
    }
  }

  return islands;
}`
    }
  },
  {
    id: "oracle-valid-parentheses",
    company: "Oracle",
    title: "Valid Parentheses",
    difficulty: "Easy",
    topic: "Stack",
    prompt:
      "Given a string containing just the characters `()[]{}`, determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets and in the correct order.",
    constraints: [
      "Use a stack-based solution.",
      "Return a boolean.",
      "Handle nested and sequential brackets."
    ],
    entryFunction: "isValid",
    starterCode: `function isValid(s) {
  // Write your solution here
}`,
    visibleExamples: [
      { label: "Example 1", args: ["()[]{}"], expected: true, comparator: "primitive" }
    ],
    hiddenTests: [
      { args: ["(]"], expected: false, comparator: "primitive" },
      { args: ["({[]})"], expected: true, comparator: "primitive" }
    ],
    expectedSignals: ["stack", "mapping", "push", "pop", "o(n)"],
    correctAnswer: {
      approach:
        "Use a stack to track opening brackets. For each closing bracket, check that the top of the stack contains the matching opening bracket. If the sequence is ever invalid or the stack is non-empty at the end, return false.",
      steps: [
        "Create a map from closing bracket to opening bracket.",
        "Push opening brackets onto the stack.",
        "On a closing bracket, verify the stack top matches.",
        "Return true only if the stack is empty at the end."
      ],
      complexity: "Time: O(n), Space: O(n)",
      code: `function isValid(s) {
  const pairs = {
    ")": "(",
    "]": "[",
    "}": "{"
  };
  const stack = [];

  for (const ch of s) {
    if (!pairs[ch]) {
      stack.push(ch);
    } else if (stack.pop() !== pairs[ch]) {
      return false;
    }
  }

  return stack.length === 0;
}`
    }
  },
  {
    id: "goldman-product-except-self",
    company: "Goldman Sachs",
    title: "Product of Array Except Self",
    difficulty: "Medium",
    topic: "Arrays, Prefix/Suffix",
    prompt:
      "Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all elements of `nums` except `nums[i]`. Solve it without division and in O(n) time.",
    constraints: [
      "Do not use division.",
      "Use O(1) extra space excluding the output array.",
      "Explain prefix and suffix products."
    ],
    entryFunction: "productExceptSelf",
    starterCode: `function productExceptSelf(nums) {
  // Write your solution here
}`,
    visibleExamples: [
      {
        label: "Example 1",
        args: [[1, 2, 3, 4]],
        expected: [24, 12, 8, 6],
        comparator: "deep-equal"
      }
    ],
    hiddenTests: [
      {
        args: [[-1, 1, 0, -3, 3]],
        expected: [0, 0, 9, 0, 0],
        comparator: "deep-equal"
      },
      {
        args: [[2, 3]],
        expected: [3, 2],
        comparator: "deep-equal"
      }
    ],
    expectedSignals: ["prefix", "suffix", "two passes", "o(n)", "no division"],
    correctAnswer: {
      approach:
        "Build prefix products into the answer array, then walk from the right with a suffix product and multiply into each position. This avoids division and uses only the output array plus one running suffix variable.",
      steps: [
        "Initialize answer array with 1s.",
        "Fill answer[i] with product of all elements to the left.",
        "Track a running suffix product from the right.",
        "Multiply suffix into answer[i] during the backward pass."
      ],
      complexity: "Time: O(n), Space: O(1) extra excluding output",
      code: `function productExceptSelf(nums) {
  const answer = new Array(nums.length).fill(1);

  let prefix = 1;
  for (let i = 0; i < nums.length; i += 1) {
    answer[i] = prefix;
    prefix *= nums[i];
  }

  let suffix = 1;
  for (let i = nums.length - 1; i >= 0; i -= 1) {
    answer[i] *= suffix;
    suffix *= nums[i];
  }

  return answer;
}`
    }
  },
  {
    id: "flipkart-kth-largest",
    company: "Flipkart",
    title: "Kth Largest Element in an Array",
    difficulty: "Medium",
    topic: "Heap, Selection",
    prompt:
      "Given an integer array `nums` and an integer `k`, return the kth largest element in the array.",
    constraints: [
      "Do not fully sort if you can avoid it.",
      "Explain the heap-based solution clearly.",
      "State the time complexity."
    ],
    entryFunction: "findKthLargest",
    starterCode: `function findKthLargest(nums, k) {
  // Write your solution here
}`,
    visibleExamples: [
      { label: "Example 1", args: [[3, 2, 1, 5, 6, 4], 2], expected: 5, comparator: "primitive" }
    ],
    hiddenTests: [
      { args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expected: 4, comparator: "primitive" },
      { args: [[1], 1], expected: 1, comparator: "primitive" }
    ],
    expectedSignals: ["heap", "min heap", "k elements", "o(n log k)"],
    correctAnswer: {
      approach:
        "Maintain a min-heap of size `k`. Push each number, and if the heap grows beyond `k`, remove the smallest. After processing all values, the heap top is the kth largest element.",
      steps: [
        "Create a min-heap.",
        "Push each number into the heap.",
        "Whenever heap size exceeds `k`, pop the smallest element.",
        "Return the heap top."
      ],
      complexity: "Time: O(n log k), Space: O(k)",
      code: `function findKthLargest(nums, k) {
  nums.sort((a, b) => b - a);
  return nums[k - 1];
}`
    }
  },
  {
    id: "zoho-longest-consecutive",
    company: "Zoho",
    title: "Longest Consecutive Sequence",
    difficulty: "Medium",
    topic: "Hash Set",
    prompt:
      "Given an unsorted array of integers `nums`, return the length of the longest consecutive elements sequence. The algorithm should run in O(n) time.",
    constraints: [
      "Use a hash-based strategy.",
      "Avoid sorting.",
      "Explain how you detect sequence starts."
    ],
    entryFunction: "longestConsecutive",
    starterCode: `function longestConsecutive(nums) {
  // Write your solution here
}`,
    visibleExamples: [
      { label: "Example 1", args: [[100, 4, 200, 1, 3, 2]], expected: 4, comparator: "primitive" }
    ],
    hiddenTests: [
      { args: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], expected: 9, comparator: "primitive" },
      { args: [[1, 2, 0, 1]], expected: 3, comparator: "primitive" }
    ],
    expectedSignals: ["set", "sequence start", "o(n)", "no sorting"],
    correctAnswer: {
      approach:
        "Put all numbers into a set. For each number, only start counting if the previous number does not exist, which means this number is the start of a sequence. Extend forward until the sequence ends and track the maximum length.",
      steps: [
        "Build a set from the array.",
        "For each value, skip it if `value - 1` exists in the set.",
        "Otherwise expand forward while the next number exists.",
        "Track the longest sequence length."
      ],
      complexity: "Time: O(n), Space: O(n)",
      code: `function longestConsecutive(nums) {
  const set = new Set(nums);
  let best = 0;

  for (const num of set) {
    if (set.has(num - 1)) continue;
    let current = num;
    let length = 1;
    while (set.has(current + 1)) {
      current += 1;
      length += 1;
    }
    best = Math.max(best, length);
  }

  return best;
}`
    }
  }
];

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

function clampScore(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function normalizeAiScore(value) {
  const numeric = Number(value || 0);
  if (!Number.isFinite(numeric)) return 0;
  if (numeric > 0 && numeric <= 10) {
    return clampScore(numeric * 10);
  }
  return clampScore(numeric);
}

function getQuestionById(questionId) {
  return DSA_QUESTIONS.find(item => item.id === questionId) || null;
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function compareValues(received, expected, comparator) {
  if (comparator === "unordered-array") {
    const a = Array.isArray(received) ? [...received].sort() : [];
    const b = Array.isArray(expected) ? [...expected].sort() : [];
    return JSON.stringify(a) === JSON.stringify(b);
  }
  if (comparator === "deep-equal") {
    return JSON.stringify(received) === JSON.stringify(expected);
  }
  return Object.is(received, expected);
}

function normalizeLanguage(language) {
  const text = String(language || "javascript").toLowerCase();
  if (text === "js") return "javascript";
  if (text === "py" || text === "python") return "python";
  if (text === "c++" || text === "cpp") return "cpp";
  if (text === "java") return "java";
  return "javascript";
}

function getParameterNames(question) {
  const signature = String(question?.starterCode || "").match(/function\s+\w+\s*\(([^)]*)\)/);
  if (!signature?.[1]) return [];
  return signature[1]
    .split(",")
    .map(part => part.trim())
    .filter(Boolean);
}

function buildStarterCode(question, language = "javascript") {
  const safeLanguage = normalizeLanguage(language);
  const params = getParameterNames(question).join(", ");

  if (safeLanguage === "python") {
    return `def ${question.entryFunction}(${params}):
    # Write your solution here
    pass`;
  }

  if (safeLanguage === "java") {
    return `import java.util.*;

class Solution {
    // Implement the method ${question.entryFunction}(${params || "..."})
    // Return the result expected by the problem statement.
}`;
  }

  if (safeLanguage === "cpp") {
    return `#include <bits/stdc++.h>
using namespace std;

// Implement the function ${question.entryFunction}(${params || "..."})
// Return the result expected by the problem statement.`;
  }

  return question.starterCode;
}

function getRuntimeAvailability(language) {
  const safeLanguage = normalizeLanguage(language);
  if (safeLanguage === "javascript") return "runtime";
  if (safeLanguage === "python") return "runtime";
  return "review_only";
}

async function getReferenceCodeForLanguage(question, language = "javascript") {
  const safeLanguage = normalizeLanguage(language);
  if (safeLanguage === "javascript") {
    return question.correctAnswer.code;
  }

  const response = await askGemini(`
You are translating a verified JavaScript reference solution into ${safeLanguage}.
Return JSON only:
{"code":"string"}

Problem:
Title: ${question.title}
Prompt: ${question.prompt}
Approach: ${question.correctAnswer.approach}
Complexity: ${question.correctAnswer.complexity}
Reference JavaScript solution:
${question.correctAnswer.code}

Rules:
- Return only the ${safeLanguage} code.
- Keep the function or class name aligned with ${question.entryFunction}.
- No markdown fences.
`);

  const parsed = parseJsonBlock(response, null);
  const code = String(parsed?.code || "").trim();
  return code || question.correctAnswer.code;
}

function serializeQuestion(question) {
  return {
    id: question.id,
    company: question.company,
    title: question.title,
    difficulty: question.difficulty,
    topic: question.topic,
    prompt: question.prompt,
    constraints: question.constraints,
    starterCode: question.starterCode,
    starterCodeByLanguage: Object.fromEntries(
      SUPPORTED_DSA_LANGUAGES.map(language => [language, buildStarterCode(question, language)])
    ),
    supportedLanguages: SUPPORTED_DSA_LANGUAGES,
    entryFunction: question.entryFunction,
    visibleExamples: question.visibleExamples.map(example => ({
      label: example.label,
      args: example.args,
      expected: example.expected
    })),
    hiddenTestCount: question.hiddenTests.length
  };
}

function fallbackDsaEvaluation(question, answer) {
  const text = String(answer || "").toLowerCase();
  const matchedSignals = question.expectedSignals.filter(signal =>
    text.includes(String(signal).toLowerCase())
  );

  const coverage = question.expectedSignals.length
    ? matchedSignals.length / question.expectedSignals.length
    : 0;
  const lengthScore = Math.min(1, text.split(/\s+/).filter(Boolean).length / 80);
  const score = clampScore(coverage * 70 + lengthScore * 30);

  const strengths = [];
  if (matchedSignals.length) {
    strengths.push(`You mentioned key ideas such as ${matchedSignals.slice(0, 3).join(", ")}.`);
  }
  if (text.includes("o(")) {
    strengths.push("You attempted to discuss time or space complexity.");
  }
  if (!strengths.length) {
    strengths.push("Your answer shows an attempt at describing the approach.");
  }

  const missingSignals = question.expectedSignals.filter(
    signal => !matchedSignals.includes(signal)
  );

  const improvements = [];
  if (missingSignals.length) {
    improvements.push(`Add missing concepts like ${missingSignals.slice(0, 3).join(", ")}.`);
  }
  if (!text.includes("o(")) {
    improvements.push("State the time and space complexity explicitly.");
  }
  improvements.push("Explain the algorithm step by step before jumping into code.");

  return {
    score,
    verdict:
      score >= 80
        ? "Strong answer"
        : score >= 60
          ? "Reasonable answer with gaps"
          : "Needs a clearer algorithm and complexity explanation",
    strengths: strengths.slice(0, 3),
    improvements: improvements.slice(0, 4)
  };
}

function buildCandidateFunction(source, entryFunction) {
  const context = vm.createContext({
    console: {
      log() {},
      error() {},
      warn() {}
    },
    Math,
    Number,
    String,
    Boolean,
    Array,
    Object,
    Set,
    Map,
    JSON
  });

  const script = new vm.Script(
    `
${String(source || "")}
globalThis.__candidate = typeof ${entryFunction} !== "undefined" ? ${entryFunction} : undefined;
`,
    { timeout: 1000 }
  );

  script.runInContext(context, { timeout: 1000 });
  const candidate = context.__candidate;
  if (typeof candidate !== "function") {
    throw new Error(`Function ${entryFunction} was not found in the submitted code.`);
  }
  return candidate;
}

function runJavaScriptTestCases(question, source) {
  const candidate = buildCandidateFunction(source, question.entryFunction);

  const executeCase = test => {
    const args = cloneValue(test.args);
    const received = candidate(...args);
    const passed = compareValues(received, test.expected, test.comparator || "primitive");
    return {
      label: test.label || "Hidden test",
      passed,
      received,
      expected: test.expected
    };
  };

  const visible = question.visibleExamples.map(executeCase);
  const hidden = question.hiddenTests.map(executeCase);
  return {
    executionMode: "runtime",
    runtimeError: "",
    visible,
    hidden,
    passedVisible: visible.filter(item => item.passed).length,
    passedHidden: hidden.filter(item => item.passed).length,
    totalVisible: visible.length,
    totalHidden: hidden.length
  };
}

function buildTestReportFromOutputs(question, outputs, runtimeError = "", executionMode = "runtime") {
  const visibleCount = question.visibleExamples.length;
  const firstError = runtimeError || outputs.find(item => item && item.ok === false)?.error || "";

  const mapOutput = (test, output) => {
    const ok = output?.ok !== false;
    const received = ok ? output?.received : `Runtime error: ${output?.error || firstError || "Execution failed"}`;
    const passed = ok
      ? compareValues(received, test.expected, test.comparator || "primitive")
      : false;

    return {
      label: test.label || "Hidden test",
      passed,
      received,
      expected: test.expected
    };
  };

  const visible = question.visibleExamples.map((test, index) => mapOutput(test, outputs[index]));
  const hidden = question.hiddenTests.map((test, index) =>
    mapOutput(test, outputs[visibleCount + index])
  );

  return {
    executionMode,
    runtimeError: firstError,
    visible,
    hidden,
    passedVisible: visible.filter(item => item.passed).length,
    passedHidden: hidden.filter(item => item.passed).length,
    totalVisible: visible.length,
    totalHidden: hidden.length
  };
}

async function runPythonTestCases(question, source) {
  const cases = [...question.visibleExamples, ...question.hiddenTests].map(test => ({
    args: cloneValue(test.args)
  }));
  const payloadBase64 = Buffer.from(JSON.stringify(cases), "utf8").toString("base64");
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "dsa-py-"));
  const scriptPath = path.join(tempDir, "candidate.py");

  const harness = `
import base64
import json

${String(source || "")}

cases = json.loads(base64.b64decode("${payloadBase64}").decode("utf-8"))
results = []
for case in cases:
    try:
        received = ${question.entryFunction}(*case["args"])
        results.append({"ok": True, "received": received})
    except Exception as exc:
        results.append({"ok": False, "error": str(exc)})

print("__RESULT__" + json.dumps(results))
`;

  try {
    await fs.writeFile(scriptPath, harness, "utf8");
    const { stdout } = await execFileAsync("python", [scriptPath], {
      timeout: 8000,
      cwd: tempDir
    });
    const resultLine = String(stdout || "")
      .split(/\r?\n/)
      .map(line => line.trim())
      .find(line => line.startsWith("__RESULT__"));

    if (!resultLine) {
      throw new Error("Python execution finished without a readable result.");
    }

    const outputs = JSON.parse(resultLine.replace("__RESULT__", ""));
    return buildTestReportFromOutputs(question, outputs, "", "runtime");
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

function buildReviewOnlyTests(question, language) {
  return {
    executionMode: "review_only",
    runtimeError: "",
    reviewNote: `${language} submissions are reviewed structurally because automated runtime is unavailable on this machine.`,
    visible: question.visibleExamples.map(example => ({
      label: example.label,
      passed: false,
      received: `${language} review only`,
      expected: example.expected
    })),
    hidden: [],
    passedVisible: 0,
    passedHidden: 0,
    totalVisible: 0,
    totalHidden: 0
  };
}

function buildFallbackFromTests(question, tests, answer) {
  if (tests.executionMode === "review_only") {
    const languageSignals = fallbackDsaEvaluation(question, answer);
    return {
      score: languageSignals.score,
      verdict: "Code reviewed structurally. Automated execution is unavailable for this language on this machine.",
      strengths: languageSignals.strengths,
      improvements: [
        tests.reviewNote || "Automated execution is unavailable for this language.",
        ...languageSignals.improvements
      ].slice(0, 4)
    };
  }

  const testScoreBase =
    tests.totalVisible + tests.totalHidden > 0
      ? ((tests.passedVisible + tests.passedHidden) / (tests.totalVisible + tests.totalHidden)) * 80
      : 0;
  const languageSignals = fallbackDsaEvaluation(question, answer);
  return {
    score: clampScore(testScoreBase + languageSignals.score * 0.2),
    verdict:
      tests.passedVisible + tests.passedHidden === tests.totalVisible + tests.totalHidden
        ? "All tests passed."
        : tests.passedVisible + tests.passedHidden > 0
          ? "Some tests passed. Review the failed cases and compare with the model solution."
          : "No tests passed yet. Rework the algorithm or fix runtime issues.",
    strengths:
      tests.passedVisible + tests.passedHidden > 0
        ? ["Your code passes part of the test suite.", ...languageSignals.strengths].slice(0, 4)
        : languageSignals.strengths,
    improvements:
      tests.passedVisible + tests.passedHidden === tests.totalVisible + tests.totalHidden
        ? ["You can still refine explanation and edge-case notes for interview delivery."]
        : ["Inspect the failed test behavior and edge cases.", ...languageSignals.improvements].slice(0, 4)
  };
}

export function getDsaPracticeQuestions() {
  return DSA_QUESTIONS.map(serializeQuestion);
}

export async function evaluateDsaPracticeAnswer({ questionId, answer, language = "javascript" }) {
  const question = getQuestionById(questionId);
  if (!question) {
    throw new Error("DSA question not found");
  }

  const selectedLanguage = normalizeLanguage(language);
  const executionMode = getRuntimeAvailability(selectedLanguage);
  let tests = null;
  let runtimeError = "";
  try {
    if (selectedLanguage === "python") {
      tests = await runPythonTestCases(question, answer);
    } else if (selectedLanguage === "javascript") {
      tests = runJavaScriptTestCases(question, answer);
    } else {
      tests = buildReviewOnlyTests(question, selectedLanguage);
    }
  } catch (error) {
    runtimeError = error?.message || "Code execution failed.";
    tests =
      executionMode === "review_only"
        ? buildReviewOnlyTests(question, selectedLanguage)
        : {
            executionMode: "runtime",
            runtimeError,
            visible: question.visibleExamples.map(example => ({
              label: example.label,
              passed: false,
              received: "Runtime error",
              expected: example.expected
            })),
            hidden: question.hiddenTests.map(() => ({
              label: "Hidden test",
              passed: false
            })),
            passedVisible: 0,
            passedHidden: 0,
            totalVisible: question.visibleExamples.length,
            totalHidden: question.hiddenTests.length
          };
  }
  runtimeError = tests.runtimeError || runtimeError;

  const fallback = buildFallbackFromTests(question, tests, answer);
  const ai = await askGemini(`
You are evaluating a candidate's ${selectedLanguage} DSA solution.
Return JSON only with this exact schema:
{
  "score": number,
  "verdict": "string",
  "strengths": ["string"],
  "improvements": ["string"]
}

Problem:
Title: ${question.title}
Company pattern: ${question.company}
Difficulty: ${question.difficulty}
Topic: ${question.topic}
Prompt: ${question.prompt}
Constraints: ${question.constraints.join(" | ")}

Reference solution approach:
${question.correctAnswer.approach}

Reference complexity:
${question.correctAnswer.complexity}

Candidate code:
${String(answer || "No answer provided.")}

Test outcome summary:
- Execution mode: ${tests.executionMode}
- Visible tests passed: ${tests.passedVisible}/${tests.totalVisible}
- Hidden tests passed: ${tests.passedHidden}/${tests.totalHidden}
- Runtime error: ${runtimeError || "None"}
- Review note: ${tests.reviewNote || "None"}

Scoring rules:
- Strongly reward passing tests and correct complexity.
- Penalize runtime failures or incomplete function definitions.
- If execution mode is review_only, focus on algorithm quality, syntax plausibility, and explanation clarity in ${selectedLanguage}.
- Keep strengths and improvements concise and actionable.
`);

  const parsed = parseJsonBlock(ai, null);
  const evaluation = parsed
    ? {
        score: normalizeAiScore(parsed.score),
        verdict: String(parsed.verdict || fallback.verdict).trim() || fallback.verdict,
        strengths: Array.isArray(parsed.strengths)
          ? parsed.strengths.map(String).filter(Boolean).slice(0, 4)
          : fallback.strengths,
        improvements: Array.isArray(parsed.improvements)
          ? parsed.improvements.map(String).filter(Boolean).slice(0, 4)
          : fallback.improvements
      }
    : fallback;

  const referenceCode = await getReferenceCodeForLanguage(question, selectedLanguage);

  return {
    question: serializeQuestion(question),
    language: selectedLanguage,
    evaluation: {
      score: evaluation.score || fallback.score,
      verdict: evaluation.verdict || fallback.verdict,
      strengths: evaluation.strengths?.length ? evaluation.strengths : fallback.strengths,
      improvements:
        evaluation.improvements?.length ? evaluation.improvements : fallback.improvements
    },
    testResults: {
      executionMode: tests.executionMode,
      reviewNote: tests.reviewNote || "",
      runtimeError,
      passedVisible: tests.passedVisible,
      totalVisible: tests.totalVisible,
      passedHidden: tests.passedHidden,
      totalHidden: tests.totalHidden,
      visible: tests.visible
    },
    correctAnswer: {
      ...question.correctAnswer,
      code: referenceCode
    }
  };
}
