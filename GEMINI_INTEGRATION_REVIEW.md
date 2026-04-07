# Gemini AI Integration Review & Fix

## Executive Summary

**Gemini is correctly integrated as the brain** of the InterviewPrep AI system. It handles:
- ✅ Interview question generation (Technical & HR)
- ✅ Answer evaluation & scoring
- ✅ Voice transcription
- ✅ Resume analysis
- ✅ Career roadmap generation

**Critical Issue Found:** The API key is **leaked and flagged by Google**, causing Gemini requests to fail. System **falls back to OpenAI**, so the website still works, but with degraded AI quality.

**Fix Applied:** Reordered AI priority so **Gemini is tried FIRST** (was OpenAI first). Now Gemini is the primary brain as intended.

---

## Architecture Overview

```
┌─────────────────┐
│   Frontend      │  (HTML/JS - Voice & Text Input)
└────────┬────────┘
         │ HTTP API calls (with X-User-Id)
┌────────▼────────┐
│   Backend       │  (Express.js routes)
│  /api/interview │
│  /api/resume    │
│  /api/career    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Gemini Service Layer       │
│  (gemini.service.js)        │
│                              │
│  PRIORITY:                  │
│  1. Google Gemini API       │ ← PRIMARY BRAIN
│  2. OpenAI API (fallback)   │ ← Backup
└─────────────────────────────┘
```

---

## Gemini's Role: The AI Brain

### 1. Interview Question Generation
**File:** `backend/services/question.service.js:110-152`

**What Gemini does:**
- Receives: candidate name, interview type, domain, difficulty, question number, previous answer
- Generates contextual, adaptive questions
- Personalizes with candidate's name
- Distinguishes between Technical (domain-specific) and HR (behavioral) questions

**Example prompt to Gemini:**
```
You are a strict technical interviewer.
Candidate name: John.
Question domain: DSA.
Difficulty: medium.
Question number: 3.
Previous answer: "I would use a hash map..."

Return JSON: {"question":"..."}
```

**Fallback:** If Gemini fails, uses pre-written question bank (6 questions per domain)

---

### 2. Interview Feedback & Scoring
**File:** `backend/services/interview.engine.js:125-169`

**What Gemini evaluates:**
- **Confidence** (0-100): Speech patterns, answer length, voice metrics
- **Vocabulary** (0-100): Technical terminology, word choice
- **Technical** (0-100): Accuracy, depth, relevance to domain
- **Communication** (0-100): Clarity, structure, articulation
- **Suggestions**: 3-6 personalized improvement tips

**Input to Gemini:**
```
Simulate a technical interview evaluation for candidate John.
Difficulty: medium.
Transcript:
Q1: Explain binary search.
A1: (candidate's answer)
Q2: What is time complexity?
A2: (candidate's answer)

Return JSON with scores and suggestions.
```

**Fallback:** Simple word-count based heuristic if Gemini unavailable

---

### 3. Voice Transcription
**File:** `backend/services/gemini.service.js:284-337`

**What Gemini does:**
- Receives: Base64 audio data (WebM format)
- Converts speech to text
- Returns exact transcript

**Prompt:**
```
Transcribe the spoken audio exactly. Return only the transcript text.
If there is no speech, return an empty string.
```

**Used by:** Frontend Web Speech API → Audio recording → Base64 → Gemini transcription

---

### 4. Resume Analysis
**File:** `backend/controllers/resume.controller.js:59-90`

**What Gemini analyzes:**
- **ATS Score** (0-100): Keyword matching, format, structure
- **Technical Strength**: Assessment of technical skills coverage
- **Communication Strength**: Soft skills indicators
- **Missing Keywords**: Industry terms not found
- **Suggestions**: Specific improvements

**Prompt:**
```
Analyze this resume and return JSON only:
{
  "atsScore": number (0-100),
  "technicalStrength": "string",
  "communicationStrength": "string",
  "missingKeywords": ["string"],
  "suggestions": ["string"]
}
Resume text: [paste]
```

---

### 5. Career Roadmap Generation
**File:** `backend/controllers/career.controller.js:21-45`

**What Gemini creates:**
- Personalized learning timeline
- Technology recommendations
- Milestone achievements
- Monthly/quarterly goals

**Prompt:**
```
Create a career roadmap for skills: [skills]
Goal: [target role]
Include timeline and technologies
```

---

## Voice & Text Input Handling

### Flow Diagram:
```
User speaks → Browser Web Speech API → Audio blob → Base64
         ↓
  POST /api/interview/transcribe
         ↓
   Gemini transcribes → Text transcript
         ↓
   Saved to answers array
         ↓
   After all questions → POST /api/interview/start
         ↓
   Gemini evaluates full transcript → Scores + feedback
```

### Text Fallback:
If microphone unavailable or user prefers typing:
```
User types answer → Direct text submission
         ↓
   Same Gemini evaluation flow
```

---

## Current API Priority Issue (FIXED)

### Before (WRONG):
```javascript
// gemini.service.js - OpenAI tried first
export async function askGemini(prompt) {
  const openAi = await askViaOpenAi(prompt);  // ← FIRST
  if (openAi.ok) return openAi.text;

  const gemini = await askViaGemini(prompt);  // ← Fallback
  if (gemini.ok) return gemini.text;

  return "No response";
}
```

### After (CORRECT):
```javascript
export async function askGemini(prompt) {
  // Try Gemini FIRST (primary brain)
  const gemini = await askViaGemini(prompt);
  if (gemini.ok) return gemini.text;

  // OpenAI as backup only if Gemini fails
  const openAi = await askViaOpenAi(prompt);
  if (openAi.ok) return openAi.text;

  return "No response";
}
```

**Status:** ✅ Fixed and deployed (server restarted)

---

## Gemini API Key Status

### Problem: Leaked Key
```
Current key: AIzaSyDLXIpxV23Eq75oJ4QOi7-k_oK3IS6py-M
Status: FLAGGED as leaked by Google
Error: "Your API key was reported as leaked. Please use another API key."
```

### Impact:
- ❌ Gemini requests **fail immediately**
- ✅ System **falls back to OpenAI** (still works)
- ⚠️ AI quality may differ between providers
- ⚠️ No cost control (different billing)

### Solution:

**Step 1:** Get new Gemini API key
1. Go to: https://console.cloud.google.com/ai/gemini/api-keys
2. Click "Create API Key"
3. Copy new key (format: `AIzaSy...`)

**Step 2:** Update `backend/.env`
```env
GEMINI_API_KEY=AIzaSyYOUR_NEW_KEY_HERE
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyYOUR_NEW_KEY_HERE
```

**Step 3:** Restart backend
```bash
cd backend
npm start
```

**Step 4:** Verify
```bash
curl http://localhost:5000/api/interview/gemini-health
# Expected: {"ok":true,"reason":"AI reachable via gemini-2.5-flash"}
```

---

## Testing the Gemini Integration

### 1. Test Question Generation
```bash
curl -X POST http://localhost:5000/api/interview/next-question \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test123" \
  -d '{
    "userName": "Alice",
    "interviewType": "technical",
    "domain": "DSA",
    "difficulty": "medium",
    "askedQuestions": 0,
    "lastAnswer": ""
  }'
```
**Expected:** JSON with `{"question":"Alice, ..."}`

### 2. Test Interview Evaluation
```bash
curl -X POST http://localhost:5000/api/interview/start \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test123" \
  -d '{
    "name": "Alice",
    "type": "technical",
    "domain": "web development",
    "difficulty": "medium",
    "totalQuestions": 1,
    "answers": [
      {
        "question": "Explain SSR vs CSR",
        "answer": "SSR renders on server, CSR renders in browser"
      }
    ]
  }'
```
**Expected:** JSON with `confidence`, `vocabulary`, `technical`, `communication`, `suggestions`

### 3. Test Resume Analysis
```bash
curl -X POST http://localhost:5000/api/resume/analyze \
  -H "Content-Type: application/json" \
  -H "X-User-Id: test123" \
  -d '{"resumeText":"John Doe\nSoftware Engineer\nSkills: JavaScript, React"}'
```
**Expected:** JSON with `atsScore`, `technicalStrength`, `missingKeywords`, etc.

### 4. Check Which AI is Active
```bash
curl http://localhost:5000/api/interview/gemini-health
```
- **Gemini working:** `"reason":"AI reachable via gemini-2.5-flash"`
- **Using OpenAI fallback:** `"reason":"AI reachable via OpenAI ... (Gemini unavailable)"`
- **Both down:** `"ok":false`

---

## Voice-Based Interview Flow

### Frontend Implementation
**File:** `js/interview/interview-flow.js` (main orchestration)

**Steps:**
1. User clicks "Start Voice Interview"
2. Frontend requests question via `/api/interview/next-question`
3. **Gemini generates** contextual question
4. Question spoken via browser Speech Synthesis (text-to-speech)
5. User speaks answer → Browser Speech Recognition (or audio recording)
6. Transcript sent to `/api/interview/transcribe`
7. **Gemini transcribes** audio to text
8. Process repeats for all questions
9. Final submission to `/api/interview/start`
10. **Gemini evaluates** full transcript → Provides scored feedback

### Text-Based Alternative:
- User can type answers instead of speaking
- Same Gemini evaluation backend

---

## Security & Best Practices

### ✅ Properly Implemented:
1. **API keys in .env** (not hardcoded)
2. **User isolation** via `X-User-Id` header
3. **Fallback strategy** for reliability
4. **JSON-only responses** from AI (structured parsing)
5. **Timeout handling** (20s for Gemini, 15s for OpenAI)

### ⚠️ Needs Attention:
1. **Gemini API key is LEAKED** - Replace immediately
2. **.gitignore** - Already fixed: `.env` excluded
3. **Rate limiting** - Not implemented (could add)
4. **Request validation** - Basic, could be stronger

---

## Cost Considerations

### Gemini Pricing (as of 2025):
- **Input:** $0.075-0.35 per 1M tokens (model-dependent)
- **Output:** $0.30-1.05 per 1M tokens
- **Audio transcription:** $0.006-0.024 per minute

### OpenAI Fallback Pricing:
- **GPT-4o:** $2.50-10.00 per 1M tokens
- **Whisper transcription:** $0.006-0.024 per minute

**Recommendation:** Keep Gemini as primary for lower cost (~3-10x cheaper)

---

## Summary

| Feature | Gemini Role | Status |
|---------|-------------|--------|
| Question Generation | Generates adaptive questions | ✅ Works (fallback to OpenAI) |
| Answer Evaluation | Scores confidence, vocab, technical, communication | ✅ Works (fallback to OpenAI) |
| Voice Transcription | Converts speech to text | ✅ Works (fallback to OpenAI) |
| Resume Analysis | ATS scoring & keywords | ✅ Works (fallback to OpenAI) |
| Career Planning | Roadmap generation | ✅ Works (fallback to OpenAI) |

**All features functional** with OpenAI fallback, but **Gemini key must be replaced** to restore primary AI functionality and lower costs.

---

## Next Steps

1. **IMMEDIATE:** Replace leaked Gemini API key (see instructions above)
2. Test all endpoints with new key
3. Optionally: Remove OpenAI dependency if only using Gemini
   - Remove `openai` from `backend/package.json`
   - Remove OpenAI functions from `gemini.service.js`
   - Simplify codebase

---

**Website remains fully operational** during key replacement. All voice/text interview flows, resume analysis, and career planning work correctly using OpenAI as temporary backup.
