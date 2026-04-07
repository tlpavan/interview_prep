# InterviewPrep AI - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints are accessible without authentication (Firebase auth is handled on frontend).

## Response Format
All responses are in JSON format.

---

## Interview Module (`/interview`)

### 1. Start Interview
**Endpoint**: `POST /interview/start`

**Description**: Evaluate interview responses and generate feedback

**Request Body**:
```json
{
  "name": "string (candidate name)",
  "type": "string (technical | hr)",
  "domain": "string (e.g., DSA, web development, cloud)",
  "difficulty": "string (easy | medium | hard)",
  "totalQuestions": "number (1-20)",
  "answers": [
    {
      "question": "string",
      "answer": "string"
    }
  ]
}
```

**Response**:
```json
{
  "confidence": 0-100,
  "vocabulary": 0-100,
  "technical": 0-100,
  "communication": 0-100,
  "suggestions": [
    "string (actionable suggestion)"
  ]
}
```

**Example**:
```bash
curl -X POST http://localhost:5000/api/interview/start \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "type": "technical",
    "domain": "DSA",
    "difficulty": "medium",
    "totalQuestions": 3,
    "answers": [
      {
        "question": "What is a binary search tree?",
        "answer": "A binary search tree is a data structure where each node has at most two children..."
      }
    ]
  }'
```

**Status Codes**:
- `200 OK`: Feedback generated successfully
- `500 Internal Server Error`: Failed to run interview

---

### 2. Extract Name from Speech
**Endpoint**: `POST /interview/extract-name`

**Description**: Extract candidate name from speech transcript

**Request Body**:
```json
{
  "transcript": "string (speech transcript)"
}
```

**Response**:
```json
{
  "name": "string (extracted name or 'User' as fallback)"
}
```

**Example**:
```bash
curl -X POST http://localhost:5000/api/interview/extract-name \
  -H "Content-Type: application/json" \
  -d '{
    "transcript": "My name is Alice Johnson"
  }'
```

**Response**:
```json
{
  "name": "Alice"
}
```

---

### 3. Generate Next Question
**Endpoint**: `POST /interview/next-question`

**Description**: Generate next interview question based on context

**Request Body**:
```json
{
  "userName": "string (candidate name)",
  "interviewType": "string (technical | hr)",
  "domain": "string (e.g., DSA, web development)",
  "difficulty": "string (easy | medium | hard)",
  "askedQuestions": "number (questions asked so far)",
  "lastAnswer": "string (previous answer for context)"
}
```

**Response**:
```json
{
  "question": "string (interview question)"
}
```

**Example**:
```bash
curl -X POST http://localhost:5000/api/interview/next-question \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "John",
    "interviewType": "technical",
    "domain": "DSA",
    "difficulty": "medium",
    "askedQuestions": 0,
    "lastAnswer": ""
  }'
```

**Response**:
```json
{
  "question": "John, can you explain the concept of time complexity?"
}
```

---

### 4. Get Voice Configuration
**Endpoint**: `GET /interview/voice-config`

**Description**: Get VAPI voice configuration

**Response**:
```json
{
  "apiKey": "string (VAPI API key)",
  "assistant": {
    "voice": "string (voice name)",
    "model": "string (AI model)",
    "firstMessage": "string (initial greeting)"
  }
}
```

**Example**:
```bash
curl http://localhost:5000/api/interview/voice-config
```

---

### 5. Get Recent Interviews
**Endpoint**: `GET /interview/recent?limit=10`

**Description**: Get recent interview sessions

**Query Parameters**:
- `limit` (optional): Number of sessions to return (default: 10)

**Response**:
```json
{
  "sessions": [
    {
      "id": "string (session ID)",
      "createdAt": "string (ISO-8601 timestamp)",
      "userName": "string",
      "type": "string (technical | hr)",
      "domain": "string",
      "difficulty": "string",
      "totalQuestions": "number",
      "answers": [
        {
          "question": "string",
          "answer": "string"
        }
      ],
      "feedback": {
        "confidence": 0-100,
        "vocabulary": 0-100,
        "technical": 0-100,
        "communication": 0-100,
        "suggestions": ["string"]
      }
    }
  ]
}
```

**Example**:
```bash
curl http://localhost:5000/api/interview/recent?limit=5
```

---

### 6. Get Profile Summary
**Endpoint**: `GET /interview/profile-summary`

**Description**: Get aggregated module scores

**Response**:
```json
{
  "summary": {
    "technical": 0-100,
    "hr": 0-100,
    "resume": 0-100,
    "career": 0-100
  }
}
```

**Example**:
```bash
curl http://localhost:5000/api/interview/profile-summary
```

**Response**:
```json
{
  "summary": {
    "technical": 75,
    "hr": 82,
    "resume": 88,
    "career": 70
  }
}
```

---

### 7. Check Gemini Health
**Endpoint**: `GET /interview/gemini-health`

**Description**: Check if Gemini API is accessible

**Response**:
```json
{
  "ok": "boolean",
  "reason": "string (status message)"
}
```

**Example**:
```bash
curl http://localhost:5000/api/interview/gemini-health
```

**Response (Success)**:
```json
{
  "ok": true,
  "reason": "Gemini reachable via gemini-2.5-flash"
}
```

**Response (Failure)**:
```json
{
  "ok": false,
  "reason": "GEMINI_API_KEY is missing"
}
```

---

## Resume Module (`/resume`)

### 1. Analyze Resume
**Endpoint**: `POST /resume/analyze`

**Description**: Analyze resume and get ATS score with recommendations

**Request Body**:
```json
{
  "resumeText": "string (resume content)"
}
```

**Response**:
```json
{
  "analysis": {
    "atsScore": 0-100,
    "technicalStrength": "string (assessment)",
    "communicationStrength": "string (assessment)",
    "missingKeywords": [
      "string (missing keyword)"
    ],
    "suggestions": [
      "string (improvement suggestion)"
    ]
  }
}
```

**Example**:
```bash
curl -X POST http://localhost:5000/api/resume/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "John Doe\nSoftware Engineer\nSkills: JavaScript, React, Node.js, MongoDB\nExperience: 5 years at Tech Company..."
  }'
```

**Response**:
```json
{
  "analysis": {
    "atsScore": 78,
    "technicalStrength": "Strong technical stack coverage with modern web technologies.",
    "communicationStrength": "Good communication indicators found.",
    "missingKeywords": [
      "Docker",
      "Kubernetes",
      "AWS",
      "TypeScript",
      "GraphQL"
    ],
    "suggestions": [
      "Add quantified impact (e.g., reduced latency by 30%).",
      "Mention core backend architecture and deployment tools.",
      "Ensure each project includes role, stack, and outcome."
    ]
  }
}
```

**Status Codes**:
- `200 OK`: Analysis completed successfully
- `500 Internal Server Error`: Failed to analyze resume

---

## Career Module (`/career`)

### 1. Generate Career Path
**Endpoint**: `POST /career/path`

**Description**: Generate personalized career roadmap

**Request Body**:
```json
{
  "skills": "string (comma-separated skills)",
  "goals": "string (career goal)"
}
```

**Response**:
```json
{
  "roadmap": "string (detailed career roadmap)"
}
```

**Example**:
```bash
curl -X POST http://localhost:5000/api/career/path \
  -H "Content-Type: application/json" \
  -d '{
    "skills": "JavaScript, React, Node.js",
    "goals": "Become a Full Stack Engineer"
  }'
```

**Response**:
```json
{
  "roadmap": "Career Roadmap: Full Stack Engineer\n\n1. Foundation (Months 1-3)\n   - Master advanced JavaScript concepts\n   - Learn TypeScript\n   - Study system design basics\n\n2. Backend Development (Months 4-6)\n   - Advanced Node.js patterns\n   - Database design (SQL & NoSQL)\n   - API design and REST principles\n\n3. DevOps & Deployment (Months 7-9)\n   - Docker containerization\n   - Kubernetes orchestration\n   - CI/CD pipelines\n\n4. Advanced Topics (Months 10-12)\n   - Microservices architecture\n   - Cloud platforms (AWS/GCP)\n   - Performance optimization\n\nMilestones:\n- Month 3: Complete TypeScript certification\n- Month 6: Build production-grade backend\n- Month 9: Deploy application to cloud\n- Month 12: Lead full stack project"
}
```

**Status Codes**:
- `200 OK`: Roadmap generated successfully
- `500 Internal Server Error`: Failed to generate roadmap

---

## Error Handling

### Error Response Format
```json
{
  "error": "string (error message)",
  "details": "string (detailed error information)"
}
```

### Common Error Codes

| Code | Message | Cause |
|------|---------|-------|
| 400 | Bad Request | Invalid request body or parameters |
| 404 | Not Found | Endpoint does not exist |
| 500 | Internal Server Error | Server-side error or external API failure |

### Error Examples

**Missing Required Field**:
```json
{
  "error": "Failed to analyze resume",
  "details": "resumeText is required"
}
```

**API Timeout**:
```json
{
  "error": "Failed to run interview",
  "details": "Request timeout after 25 seconds"
}
```

**Missing API Key**:
```json
{
  "error": "Failed to check Gemini health",
  "details": "GEMINI_API_KEY is missing"
}
```

---

## Rate Limiting

Currently, there is no built-in rate limiting. However, rate limits may be imposed by:

1. **Gemini API**: 
   - Free tier: 60 requests per minute
   - Paid tier: Higher limits based on plan

2. **Firebase**: 
   - Authentication: 1000 requests per second per project

3. **VAPI**: 
   - Depends on subscription plan

---

## Pagination

Currently, pagination is supported only for the `/interview/recent` endpoint:

```bash
# Get last 5 sessions
curl http://localhost:5000/api/interview/recent?limit=5

# Get last 20 sessions
curl http://localhost:5000/api/interview/recent?limit=20
```

---

## Data Validation

### Interview Start Request
- `name`: Required, string, max 100 characters
- `type`: Required, must be "technical" or "hr"
- `domain`: Required, string, max 100 characters
- `difficulty`: Required, must be "easy", "medium", or "hard"
- `totalQuestions`: Required, number, 1-20
- `answers`: Optional, array of Q&A pairs

### Resume Analyze Request
- `resumeText`: Required, string, min 50 characters, max 50000 characters

### Career Path Request
- `skills`: Required, string, min 5 characters
- `goals`: Required, string, min 5 characters

---

## CORS Configuration

The API allows requests from:
- `http://localhost:*`
- `http://127.0.0.1:*`
- Same-origin requests

---

## Request/Response Examples

### Complete Interview Flow

**Step 1: Extract Name**
```bash
curl -X POST http://localhost:5000/api/interview/extract-name \
  -H "Content-Type: application/json" \
  -d '{"transcript": "My name is Sarah"}'
```

**Step 2: Generate Question 1**
```bash
curl -X POST http://localhost:5000/api/interview/next-question \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "Sarah",
    "interviewType": "technical",
    "domain": "DSA",
    "difficulty": "medium",
    "askedQuestions": 0,
    "lastAnswer": ""
  }'
```

**Step 3: Generate Question 2**
```bash
curl -X POST http://localhost:5000/api/interview/next-question \
  -H "Content-Type: application/json" \
  -d '{
    "userName": "Sarah",
    "interviewType": "technical",
    "domain": "DSA",
    "difficulty": "medium",
    "askedQuestions": 1,
    "lastAnswer": "A binary search tree is a data structure..."
  }'
```

**Step 4: Submit Interview**
```bash
curl -X POST http://localhost:5000/api/interview/start \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah",
    "type": "technical",
    "domain": "DSA",
    "difficulty": "medium",
    "totalQuestions": 2,
    "answers": [
      {
        "question": "What is a binary search tree?",
        "answer": "A binary search tree is a data structure where each node has at most two children..."
      },
      {
        "question": "How do you implement BST insertion?",
        "answer": "You start at the root and compare the value..."
      }
    ]
  }'
```

---

## Testing with cURL

### Test Gemini Health
```bash
curl http://localhost:5000/api/interview/gemini-health
```

### Test Resume Analysis
```bash
curl -X POST http://localhost:5000/api/resume/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "John Doe\nSoftware Engineer\nSkills: JavaScript, React, Node.js\nExperience: 5 years"
  }'
```

### Test Career Path
```bash
curl -X POST http://localhost:5000/api/career/path \
  -H "Content-Type: application/json" \
  -d '{
    "skills": "JavaScript, React",
    "goals": "Full Stack Developer"
  }'
```

---

## Webhook Support

Currently, webhooks are not supported. Consider implementing webhooks for:
- Interview completion notifications
- Resume analysis results
- Career milestone achievements

---

## API Versioning

Current API version: **v1** (implicit)

Future versions may be accessed via:
```
/api/v2/interview/start
/api/v2/resume/analyze
/api/v2/career/path
```

---

## SDK/Client Libraries

Currently, no official SDKs are available. Use standard HTTP clients:
- JavaScript: `fetch()` API
- Python: `requests` library
- cURL: Command-line tool
- Postman: API testing tool

---

## Support & Troubleshooting

### Common Issues

**Issue**: "GEMINI_API_KEY is missing"
- **Solution**: Add `GEMINI_API_KEY` to `.env` file

**Issue**: "Request timeout"
- **Solution**: Check internet connection, Gemini API status

**Issue**: "Invalid request body"
- **Solution**: Verify JSON format and required fields

---

**API Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Active
