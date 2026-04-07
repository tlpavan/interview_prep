# InterviewPrep AI - Agentic Multi-Modal Career Readiness Framework

## Overview

InterviewPrep AI is a comprehensive, agentic multi-modal career readiness platform that unifies resume understanding, adaptive interview orchestration, and voice-based confidence analysis within a continuous feedback loop. The system leverages autonomous agents to dynamically regulate interview complexity, assess technical and behavioral responses, and track progression across sessions.

### Key Features

- **Resume Skill Gap Analysis**: AI-powered resume analysis with ATS scoring, technical strength assessment, and personalized improvement suggestions
- **Adaptive Interview Orchestration**: Dynamic question generation based on candidate performance, difficulty level, and domain expertise
- **Voice-Based Confidence Analysis**: Real-time speech recognition and confidence scoring during mock interviews
- **Multi-Modal Assessment**: Technical and HR interview simulations with domain-specific question generation
- **Personalized Learning Pathways**: Career roadmap generation based on skills and goals
- **Continuous Feedback Loop**: Session-based performance tracking with module scoring
- **Multi-Agent Architecture**: Specialized autonomous agents for different assessment dimensions

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Client)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Auth UI    │  │ Dashboard    │  │ Interview    │      │
│  │ (Firebase)   │  │ (Modules)    │  │ Pages        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Express.js)                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Routes & Controllers                │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │ Interview   │  │ Resume      │  │ Career      │  │   │
│  │  │ Routes      │  │ Routes      │  │ Routes      │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↓                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Autonomous Agent Services                  │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │   │
│  │  │ Interview    │  │ Question     │  │ Scoring    │ │   │
│  │  │ Engine       │  │ Generator    │  │ Service    │ │   │
│  │  └──────────────┘  └──────────────┘  └────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↓                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           External AI Services                       │   │
│  │  ┌──────────────┐  ┌──────────────┐                 │   │
│  │  │ Gemini API   │  │ VAPI (Voice) │                 │   │
│  │  └──────────────┘  └──────────────┘                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                            ↓                                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Data Persistence                           │   │
│  │  ┌──────────────────────────────────────────────────┐│   │
│  │  │ JSON Database (interviews.json)                  ││   │
│  │  │ - Interview Sessions                             ││   │
│  │  │ - Module Scores                                  ││   │
│  │  └──────────────────────────────────────────────────┘│   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- HTML5, CSS3, JavaScript (ES6+)
- Firebase Authentication
- Web Speech API (Speech Recognition & Synthesis)
- PDF.js for resume PDF parsing
- Fetch API for HTTP communication

**Backend:**
- Node.js with Express.js
- Google Gemini API (Multiple models: 2.5-flash, 2.5-pro, 2.0-flash)
- VAPI for voice integration
- JSON-based data persistence

**External Services:**
- Firebase (Authentication)
- Google Gemini (AI/LLM)
- VAPI (Voice AI)

## Project Structure

```
interview_prep/
├── backend/
│   ├── config/
│   │   └── env.js                 # Environment configuration
│   ├── controllers/
│   │   ├── interview.controller.js # Interview endpoints
│   │   ├── resume.controller.js    # Resume analysis endpoints
│   │   └── career.controller.js    # Career path endpoints
│   ├── routes/
│   │   ├── interview.routes.js     # Interview API routes
│   │   ├── resume.routes.js        # Resume API routes
│   │   └── career.routes.js        # Career API routes
│   ├── services/
│   │   ├── interview.engine.js     # Interview evaluation engine
│   │   ├── question.service.js     # Question generation service
│   │   ├── gemini.service.js       # Gemini API wrapper
│   │   ├── vapi.service.js         # VAPI configuration
│   │   ├── scoring.services.js     # Scoring logic
│   │   └── db.service.js           # Database operations
│   ├── data/
│   │   └── interviews.json         # Persistent data store
│   ├── package.json
│   ├── server.js                   # Express server entry point
│   └── .env                        # Backend environment variables
├── css/
│   ├── style.css                   # Login page styles
│   ├── dashboard.css               # Dashboard & interview styles
│   ├── animations.css              # Animation definitions
│   └── charts.css                  # Chart styling
├── js/
│   ├── interview/
│   │   ├── interview-flow.js       # Interview orchestration logic
│   │   └── session-state.js        # Interview session state
│   ├── auth.js                     # Authentication logic
│   ├── auth-guard.js               # Protected route guard
│   ├── firebase.js                 # Firebase configuration
│   ├── dashboard.js                # Dashboard navigation
│   ├── interview-page.js           # Interview page controller
│   ├── resume-page.js              # Resume analyzer controller
│   ├── career-page.js              # Career path controller
│   ├── profile-page.js             # Profile dashboard controller
│   ├── charts.js                   # Chart rendering
│   ├── ai-client.js                # AI client utilities
│   └── profile-page.js             # Profile page logic
├── index.html                      # Login/Register page
├── dashboard.html                  # Main dashboard
├── technical.html                  # Technical interview page
├── hr.html                         # HR interview page
├── resume.html                     # Resume analyzer page
├── career.html                     # Career path planner page
├── profile.html                    # Profile dashboard page
├── package.json                    # Frontend dependencies
├── .env                            # Frontend environment variables
└── README.md                       # This file
```

## API Endpoints

### Interview Module (`/api/interview`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/start` | Start interview and get feedback |
| POST | `/extract-name` | Extract candidate name from speech |
| POST | `/next-question` | Generate next interview question |
| GET | `/voice-config` | Get VAPI voice configuration |
| GET | `/recent` | Get recent interview sessions |
| GET | `/profile-summary` | Get profile module scores |
| GET | `/gemini-health` | Check Gemini API health |

### Resume Module (`/api/resume`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Analyze resume and get ATS score |

### Career Module (`/api/career`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/path` | Generate career roadmap |

## Autonomous Agents

### 1. Interview Engine Agent
**Purpose**: Evaluates interview responses and generates comprehensive feedback

**Responsibilities**:
- Assess confidence levels from speech patterns
- Evaluate technical accuracy and depth
- Analyze communication quality
- Generate actionable suggestions

**Input**: Interview transcript with Q&A pairs
**Output**: Structured feedback with scores (0-100) for:
- Confidence
- Vocabulary
- Technical knowledge
- Communication skills

### 2. Question Generation Agent
**Purpose**: Dynamically generates contextual interview questions

**Responsibilities**:
- Adapt difficulty based on previous answers
- Generate domain-specific questions
- Personalize questions with candidate name
- Maintain question variety

**Input**: 
- Candidate profile (name, type, domain, difficulty)
- Previous answer (for context)
- Question count

**Output**: Contextually relevant interview question

### 3. Resume Analysis Agent
**Purpose**: Analyzes resumes for ATS compatibility and skill gaps

**Responsibilities**:
- Calculate ATS score
- Identify technical strengths
- Assess communication indicators
- Suggest missing keywords
- Provide improvement recommendations

**Input**: Resume text
**Output**: Structured analysis with:
- ATS Score (0-100)
- Technical strength assessment
- Communication strength assessment
- Missing keywords list
- Improvement suggestions

### 4. Career Path Agent
**Purpose**: Generates personalized career roadmaps

**Responsibilities**:
- Analyze current skills
- Define career goals
- Create learning timeline
- Recommend technologies and milestones

**Input**: Skills and career goals
**Output**: Detailed career roadmap with timeline

## Data Models

### Interview Session
```json
{
  "id": "timestamp-random",
  "createdAt": "ISO-8601 timestamp",
  "userName": "string",
  "type": "technical | hr",
  "domain": "string (e.g., DSA, web development)",
  "difficulty": "easy | medium | hard",
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
```

### Module Score
```json
{
  "module": "technical | hr | resume | career",
  "score": 0-100,
  "createdAt": "ISO-8601 timestamp"
}
```

### Resume Analysis
```json
{
  "atsScore": 0-100,
  "technicalStrength": "string",
  "communicationStrength": "string",
  "missingKeywords": ["string"],
  "suggestions": ["string"]
}
```

## Setup & Installation

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Modern web browser with Web Speech API support
- Google Gemini API key
- Firebase project
- VAPI API key (optional, for advanced voice features)

### Backend Setup

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Configure environment variables** (`.env`):
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
VAPI_API_KEY=your_vapi_api_key
```

3. **Start the server**:
```bash
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment variables** (`.env`):
```env
PORT=5000
```

3. **Serve the application**:
```bash
# Using a simple HTTP server
npx http-server

# Or use the backend server which serves static files
# (Backend must be running on port 5000)
```

Access the application at `http://localhost:5000` or `http://localhost:8080` (depending on your server)

## Usage Guide

### 1. Authentication
- Create an account or login with email/password
- Alternatively, use Google Sign-In for quick access
- Firebase handles all authentication securely

### 2. Resume Analysis
1. Navigate to "Resume Analyzer" from dashboard
2. Upload a PDF resume or paste resume text
3. Click "Analyze Resume"
4. View ATS score, technical strength, and improvement suggestions

### 3. Technical Interview
1. Navigate to "Technical Voice Interview"
2. Click "Start Voice Interview"
3. Provide your name, difficulty level, number of questions, and domain
4. Answer each question via voice (or text fallback)
5. Receive comprehensive feedback with scores and suggestions

### 4. HR Interview
1. Navigate to "HR Voice Interview"
2. Follow similar flow as technical interview
3. Receive behavioral and communication feedback

### 5. Career Path Planning
1. Navigate to "Career Path Planner"
2. Enter your current skills and career goal
3. Click "Generate Career Path"
4. View personalized roadmap with timeline and milestones

### 6. Profile Dashboard
1. View your performance across all modules
2. Track progress with circular score indicators
3. Monitor improvement over multiple sessions

## Voice Interview Flow

```
1. Name Capture
   ↓
2. Difficulty Selection (easy/medium/hard)
   ↓
3. Question Count Selection (1-20)
   ↓
4. Domain Selection (DSA, Web Dev, Cloud, ML, etc.)
   ↓
5. Question-Answer Loop
   - AI asks question
   - Candidate answers via voice
   - Repeat for specified count
   ↓
6. Feedback Generation
   - Evaluate all responses
   - Generate scores
   - Provide suggestions
   ↓
7. Results Display
   - Show confidence, vocabulary, technical, communication scores
   - Display actionable suggestions
```

## Scoring Methodology

### Interview Scoring
- **Confidence (0-100)**: Based on speech clarity, pace, and hesitation patterns
- **Vocabulary (0-100)**: Assessed from word choice and technical terminology usage
- **Technical (0-100)**: Evaluated on accuracy, depth, and relevance of technical content
- **Communication (0-100)**: Measured by clarity, structure, and articulation

### Module Scores
- **Technical**: Average of technical interview scores
- **HR**: Average of HR interview communication scores
- **Resume**: ATS score from resume analysis
- **Career**: Score based on career path completion

## Error Handling

The system includes comprehensive error handling:

1. **API Failures**: Graceful fallbacks with user-friendly messages
2. **Voice Recognition Failures**: Automatic text input fallback
3. **Network Issues**: Retry logic with timeout handling
4. **Gemini API Limits**: Model fallback strategy (2.5-flash → 2.5-pro → 2.0-flash)
5. **Missing Credentials**: Clear error messages for missing API keys

## Performance Optimization

1. **Model Fallback Strategy**: Tries multiple Gemini models for reliability
2. **Timeout Handling**: 25-second timeout for API calls
3. **Lazy Loading**: Frontend components load on demand
4. **Caching**: Session state maintained in memory
5. **Efficient JSON Storage**: Compact data format for persistence

## Security Considerations

1. **Firebase Authentication**: Secure user authentication and session management
2. **API Key Protection**: Environment variables for sensitive credentials
3. **CORS Configuration**: Restricted cross-origin requests
4. **Input Validation**: Server-side validation of all inputs
5. **Error Messages**: Generic error messages to prevent information leakage

## Future Enhancements

1. **Advanced Voice Analysis**:
   - Emotion detection from speech
   - Accent and pronunciation analysis
   - Real-time confidence scoring

2. **Adaptive Difficulty**:
   - Machine learning-based difficulty adjustment
   - Performance-based question selection
   - Skill-specific question routing

3. **Enhanced Feedback**:
   - Video recording and playback
   - Detailed performance analytics
   - Peer comparison metrics

4. **Integration Features**:
   - LinkedIn profile import
   - Job description matching
   - Real-time job market insights

5. **Scalability**:
   - Database migration (MongoDB/PostgreSQL)
   - Microservices architecture
   - Distributed caching (Redis)
   - Load balancing

6. **Multi-Language Support**:
   - Support for multiple languages
   - Localized question banks
   - Regional job market insights

## Troubleshooting

### Microphone Not Working
- Check browser permissions for microphone access
- Ensure microphone is connected and working
- Try the "Test Mic" button first
- Use text fallback if voice fails

### Gemini API Errors
- Verify API key is correct in `.env`
- Check API quota and rate limits
- Ensure internet connection is stable
- Check Gemini API status

### Firebase Authentication Issues
- Verify Firebase project configuration
- Check Firebase credentials in `firebase.js`
- Ensure Firebase project is active
- Clear browser cache and cookies

### Interview Session Not Saving
- Check backend is running
- Verify database file permissions
- Ensure `backend/data/` directory exists
- Check browser console for errors

## Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the development team
- Check documentation for common solutions

## Acknowledgments

- Google Gemini API for AI capabilities
- Firebase for authentication
- VAPI for voice integration
- Web Speech API for browser-based voice recognition

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Active Development
