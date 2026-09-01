# Python Microservices Backend

Specialized services for InterviewPrep AI: DSA evaluation, audio analysis, and performance analytics.

## Features

- **DSA Code Evaluator** - Evaluate coding solutions with complexity analysis
- **Audio Analyzer** - Analyze voice metrics (confidence, pace, clarity)
- **Performance Analytics** - Track user progress and identify areas to improve

## Setup

### 1. Install Python Dependencies

```bash
cd python-backend
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Default settings:
```
PYTHON_BACKEND_PORT=5001
NODE_BACKEND_URL=http://localhost:5000
FLASK_ENV=development
```

### 3. Start the Server

```bash
python app.py
```

Server will run on `http://localhost:5001`

---

## API Endpoints

### Health Check
```bash
GET /health
```

### DSA Code Evaluation
```bash
POST /api/dsa/evaluate
Content-Type: application/json

{
  "code": "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []",
  "problem": "Find two indices where nums[i] + nums[j] = target",
  "test_cases": [
    {
      "input": [[2, 7, 11, 15], 9],
      "expected": [0, 1]
    }
  ]
}
```

Response:
```json
{
  "is_valid": true,
  "verdict": "Accepted ✓",
  "score": 95,
  "complexity": {
    "time_complexity": "O(n)",
    "space_complexity": "O(n)",
    "nested_loops": 1,
    "has_recursion": false
  },
  "quality": {
    "issues": [],
    "suggestions": ["Add docstring to function"],
    "code_length": 185,
    "line_count": 8
  },
  "test_results": {
    "total": 1,
    "passed": 1,
    "failed": 0,
    "pass_rate": 100,
    "errors": []
  }
}
```

### Audio Analysis
```bash
POST /api/audio/analyze
Content-Type: application/json

{
  "audio_base64": "base64_encoded_audio_data",
  "mime_type": "audio/wav",
  "transcript": "optional transcript text"
}
```

Response:
```json
{
  "confidence_score": 75.5,
  "pace": {
    "pace": "Normal",
    "estimated_wpm": 150,
    "quality": "Good"
  },
  "filler_words": {
    "filler_count": 2,
    "filler_score": 98.5,
    "suggestion": "Good job minimizing fillers!"
  },
  "clarity": {
    "clarity_score": 82.3,
    "noise_level": "Low",
    "suggestion": "Audio quality is good"
  },
  "overall_score": 79.2,
  "duration_seconds": 5.2,
  "audio_info": {
    "sample_rate": 16000,
    "channels": 1,
    "format": "audio/wav"
  }
}
```

### Performance Analytics
```bash
GET /api/analytics/performance/{user_id}
```

Response:
```json
{
  "user_id": "user123",
  "progress": {
    "total_interviews": 15,
    "total_hours": 3.5,
    "average_score": 78.5,
    "trend": "Improving ↗",
    "recent_sessions": 5
  },
  "strengths": [
    {
      "area": "Communication",
      "score": 85.2,
      "sessions_analyzed": 12
    },
    {
      "area": "Technical",
      "score": 78.5,
      "sessions_analyzed": 12
    }
  ],
  "weaknesses": [
    {
      "area": "Problem Solving",
      "score": 55.3,
      "sessions_analyzed": 10,
      "recommendation": "Focus on improving your problem solving"
    }
  ],
  "categories": {
    "technical": 10,
    "hr": 5
  },
  "recommendations": [
    "Focus on: Focus on improving your problem solving",
    "Great! You're showing improvement. Keep practicing!"
  ],
  "generated_at": "2026-09-01T10:30:00"
}
```

### Test Endpoints

Test DSA evaluator:
```bash
POST /api/test/dsa
```

Test connectivity:
```bash
GET /api/test/ping
```

---

## Service Details

### DSA Evaluator

Evaluates Python code solutions with:
- ✓ Syntax validation
- ✓ Time/Space complexity analysis
- ✓ Test case execution
- ✓ Code quality assessment
- ✓ Detailed feedback

### Audio Analyzer

Analyzes audio with metrics:
- ✓ Confidence score (based on amplitude)
- ✓ Speaking pace (normal, slow, fast)
- ✓ Filler word detection
- ✓ Audio clarity (SNR analysis)
- ✓ Overall voice quality score

### Analytics

Provides insights:
- ✓ Progress tracking over time
- ✓ Strengths and weaknesses analysis
- ✓ Interview category breakdown
- ✓ Personalized recommendations
- ✓ Trend analysis

---

## Integration with Node.js Backend

The Python backend runs as a separate microservice on port 5001. The Node.js backend (port 5000) can call these endpoints:

```javascript
// Example: Call Python DSA evaluator from Node.js
const response = await fetch('http://localhost:5001/api/dsa/evaluate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: userCode,
    problem: problemDescription,
    test_cases: testCases
  })
});
const result = await response.json();
```

---

## Requirements

- Python 3.8+
- Flask 3.0.0
- NumPy 1.24.3
- librosa 0.10.0 (optional, for advanced audio analysis)
- SciPy 1.11.0

---

## Troubleshooting

### Port already in use
```bash
# Change port in .env
PYTHON_BACKEND_PORT=5002
```

### librosa not found
The service will work without librosa but with limited audio analysis features:
```bash
pip install librosa
```

### Connection refused
Make sure Node.js backend is running:
```bash
cd backend
npm start
```

---

## License

ISC
