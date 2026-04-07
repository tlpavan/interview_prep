/**
 * Scoring Service
 * Provides detailed scoring metrics for interviews
 */

import { askGemini } from "./gemini.service.js";

/**
 * Calculate average of numbers with optional rounding
 */
function average(numbers, round = true) {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + Number(num || 0), 0);
  const avg = sum / numbers.length;
  return round ? Math.round(avg) : avg;
}

/**
 * Analyze speech patterns for confidence indicators
 * Based on word choice, sentence structure, and filler words
 */
export async function calculateConfidenceScore(transcript) {
  if (!transcript) return 50;

  const text = transcript.toLowerCase();
  const words = text.split(/\s+/).length;

  // Positive indicators
  const confidentPhrases = [
    "i believe", "in my experience", "i'm confident", "definitely",
    "certainly", "clearly", "obviously", "absolutely", "without doubt"
  ];

  // Negative indicators (filler words, hesitations)
  const hesitantPhrases = [
    "um", "uh", "er", "maybe", "possibly", "i guess", "sort of",
    "kind of", "i think", "perhaps", "not sure", "might", "could be"
  ];

  const positiveCount = confidentPhrases.filter(phrase => text.includes(phrase)).length;
  const negativeCount = hesitantPhrases.filter(phrase => text.includes(phrase)).length;
  const fillerCount = (text.match(/\b(um|uh|er)\b/g) || []).length;

  // Calculate base score
  let score = 70; // Starting point

  if (positiveCount > 0) score += positiveCount * 5;
  if (negativeCount > 0) score -= negativeCount * 4;
  if (fillerCount > 0) score -= fillerCount * 3;

  // Sentence length variation (more variation = more confident)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 1) {
    const lengths = sentences.map(s => s.trim().split(/\s+/).length);
    const variance = Math.max(...lengths) - Math.min(...lengths);
    if (variance > 10) score += 5; // Good variation
    if (variance < 3) score -= 5; // Too repetitive
  }

  // Word count vs sentence count (complexity)
  const avgWordsPerSentence = words / (sentences.length || 1);
  if (avgWordsPerSentence > 15 && avgWordsPerSentence < 30) {
    score += 5; // Good complexity
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Evaluate technical accuracy of an answer
 * Uses Gemini to assess technical correctness
 */
export async function calculateTechnicalScore(question, answer, domain = "general") {
  if (!answer || answer.trim().length < 10) return 0;

  // Use Gemini to evaluate technical accuracy
  const prompt = `
Evaluate the technical accuracy of this answer on a scale of 0-100.

Question: ${question}
Answer: ${answer}
Domain: ${domain}

Consider:
- Correctness of technical content
- Depth of explanation
- Use of appropriate terminology
- Problem-solving approach (if applicable)
- Accuracy of examples or references

Respond with JSON only:
{
  "score": number (0-100),
  "strengths": ["string"],
  "weaknesses": ["string"],
  "accuracy": "high|medium|low"
}
`.trim();

  try {
    const response = await askGemini(prompt, {
      temperature: 0.2, // Low temperature for consistent scoring
      maxTokens: 500
    });

    // Parse response
    const cleaned = response
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      if (typeof parsed.score === 'number') {
        return {
          score: Math.max(0, Math.min(100, parsed.score)),
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
          weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
          accuracy: parsed.accuracy || 'medium'
        };
      }
    } catch (e) {
      console.error("Failed to parse technical score:", e);
    }
  } catch (error) {
    console.error("Gemini technical scoring failed:", error);
  }

  // Fallback: basic heuristic scoring
  const wordCount = answer.split(/\s+/).length;
  const hasCode = /`[^`]+`|```[\s\S]*?```/.test(answer);
  const hasTechnicalTerms = /(algorithm|complexity|time|space|function|variable|class|object|method|database|query|api|server|client|async|await|promise|http|https|tcp|ip|dns|load\s?balancer|cache|redis|mongodb|postgres|mysql|docker|kubernetes|aws|azure|gcp)/i.test(answer);

  let score = 30; // base

  if (wordCount > 50) score += 20;
  if (wordCount > 100) score += 10;
  if (hasCode) score += 15;
  if (hasTechnicalTerms) score += 15;

  if (score > 80) score = 75; // Cap fallback score

  return {
    score,
    strengths: [],
    weaknesses: ["Automated fallback scoring - full evaluation requires Gemini"],
    accuracy: 'medium'
  };
}

/**
 * Evaluate communication quality
 * Analyzes clarity, structure, and articulation
 */
export function calculateCommunicationScore(transcript) {
  if (!transcript) return 50;

  const text = transcript.trim();
  const words = text.split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  let score = 70; // Starting point

  // Too short = lacking detail
  if (words.length < 30) score -= 20;
  else if (words.length > 300) score -= 5; // Too long, rambling

  // Structure check
  const hasIntro = /^(my name is|hello|hi|hi there)/i.test(text);
  const hasConclusion = /(in conclusion|to summarize|overall|in summary|that's why)/i.test(text);

  if (hasIntro) score += 5;
  if (hasConclusion) score += 5;

  // Filler words penalty
  const fillerWords = ['um', 'uh', 'er', 'like', 'you know', 'i mean', 'basically', 'actually'];
  const fillerCount = fillerWords.reduce((count, word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    return count + (text.match(regex) || []).length;
  }, 0);

  score -= Math.min(fillerCount * 2, 15);

  // Repetition check
  const wordFrequency = {};
  words.forEach(word => {
    const w = word.toLowerCase().replace(/[^a-z]/g, '');
    if (w.length > 3) {
      wordFrequency[w] = (wordFrequency[w] || 0) + 1;
    }
  });

  const repeatedWords = Object.values(wordFrequency).filter(count => count > 3).length;
  if (repeatedWords > 3) score -= 10;

  // Question mark count (engagement)
  const questionMarks = (text.match(/\?/g) || []).length;
  if (questionMarks >= 1) score += 3; // Good to ask clarifying questions

  // Vocabulary diversity
  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, '')));
  const diversity = uniqueWords.size / words.length;
  if (diversity > 0.7) score += 5;
  if (diversity < 0.4) score -= 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * Generate actionable suggestions based on scores and answers
 */
export function generateSuggestions(scores, domain = "general") {
  const suggestions = [];

  // Confidence suggestions
  if (scores.confidence < 60) {
    suggestions.push("Practice speaking more slowly and deliberately. Reduce filler words like 'um', 'uh', 'like'.");
    suggestions.push("Start with strong opening statements to establish confidence.");
  } else if (scores.confidence < 80) {
    suggestions.push("Work on projecting more confidence through definitive language.");
  }

  // Technical suggestions
  if (scores.technical < 50) {
    suggestions.push("Review core concepts in your domain. Focus on fundamentals.");
    suggestions.push("Practice explaining technical concepts clearly and concisely.");
    suggestions.push("Use real examples from your projects to demonstrate understanding.");
  } else if (scores.technical < 75) {
    suggestions.push("Deepen your knowledge in advanced topics relevant to your field.");
    suggestions.push("Practice solving problems under time pressure.");
  } else if (scores.technical < 90) {
    suggestions.push("Consider teaching or mentoring others to solidify expertise.");
  }

  // Communication suggestions
  if (scores.communication < 60) {
    suggestions.push("Structure your answers: Introduction → Main points → Conclusion.");
    suggestions.push("Practice the STAR method (Situation, Task, Action, Result) for behavioral questions.");
    suggestions.push("Record yourself speaking and listen for clarity and pacing.");
  } else if (scores.communication < 80) {
    suggestions.push("Work on making your explanations more engaging and relatable.");
  }

  // Vocabulary suggestions
  if (scores.vocabulary < 60) {
    suggestions.push("Expand your technical vocabulary using industry-standard terms.");
    suggestions.push("Read more technical articles and documentation in your field.");
  }

  // Domain-specific suggestions
  if (domain.includes("technical")) {
    suggestions.push("Practice whiteboard coding and explaining your thought process aloud.");
    suggestions.push("Focus on time and space complexity analysis for algorithms.");
  } else if (domain.includes("hr") || domain.includes("behavioral")) {
    suggestions.push("Prepare stories using the STAR method for common behavioral questions.");
    suggestions.push("Research the company thoroughly and align your answers with their values.");
  }

  // Compute overall score to assess excellence
  const overall = calculateOverallScore(scores);

  // Add excellence message if overall is high (>=85), even if there are other suggestions
  if (overall >= 85) {
    suggestions.unshift("Excellent performance! 🎉");
    suggestions.push("Consider tackling more challenging questions or mentoring others.");
  } else if (suggestions.length === 0) {
    suggestions.push("Good effort! Continue practicing to improve further.");
    suggestions.push("Focus on the areas above to boost your performance.");
  }

  return suggestions;
}

/**
 * Calculate overall interview score
 * Weighted average of all components
 */
export function calculateOverallScore(scores) {
  const weights = {
    confidence: 0.20,
    vocabulary: 0.15,
    technical: 0.40,
    communication: 0.25
  };

  let weightedSum = 0;
  let totalWeight = 0;

  for (const [key, weight] of Object.entries(weights)) {
    const score = Number(scores[key]) || 0;
    weightedSum += score * weight;
    totalWeight += weight;
  }

  return Math.round(weightedSum / totalWeight);
}

/**
 * Analyze multiple interview answers and generate comprehensive feedback
 */
export function generateInterviewFeedback(answers, domain = "technical") {
  // Extract scores from individual answers (if available)
  const technicalScores = answers
    .map(a => a.technicalScore)
    .filter(s => typeof s === 'number');

  const confidenceScores = answers
    .map(a => a.confidenceScore)
    .filter(s => typeof s === 'number');

  const avgTechnical = average(technicalScores);
  const avgConfidence = average(confidenceScores);

  // Generate composite scores
  const scores = {
    technical: avgTechnical || Math.floor(Math.random() * 30) + 50, // Placeholder if no individual scores
    confidence: avgConfidence || 65,
    vocabulary: Math.round(avgTechnical * 0.9) || 60,
    communication: Math.round((avgConfidence + avgTechnical) / 2) || 60
  };

  const overall = calculateOverallScore(scores);

  return {
    scores,
    overall,
    suggestions: generateSuggestions(scores, domain)
  };
}