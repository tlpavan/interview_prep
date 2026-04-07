# InterviewPrep AI - Architecture & Design Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Agent-Based Design](#agent-based-design)
3. [Data Flow](#data-flow)
4. [Component Details](#component-details)
5. [Integration Points](#integration-points)
6. [Scalability & Performance](#scalability--performance)

## System Architecture

### High-Level Overview

InterviewPrep AI implements a **multi-agent, event-driven architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Auth Module  │  │ Dashboard    │  │ Interview    │          │
│  │              │  │ Module       │  │ Modules      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                 │                  │                  │
│         └─────────────────┼──────────────────┘                  │
│                           │ HTTP/REST                           │
└───────────────────────────┼──────────────────────────────────────┘
                            │
┌───────────────────────────┼──────────────────────────────────────┐
│                    API GATEWAY LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Express.js Server (Port 5000)                            │   │
│  │ - CORS Middleware                                        │   │
│  │ - JSON Body Parser                                       │   │
│  │ - Error Handler                                          │   │
│  │ - Static File Server                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬──────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼──────────┐
│ Interview      │  │ Resume         │  │ Career         │
│ Routes         │  │ Routes         │  │ Routes         │
└───────┬────────┘  └───────┬────────┘  └──────┬──────────┘
        │                   │                   │
        └───────────────��───┼───────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                  CONTROLLER LAYER                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Request Validation & Orchestration                       │   │
│  │ - Interview Controller                                   │   │
│  │ - Resume Controller                                      │   │
│  │ - Career Controller                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬───────────────────────────��──────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────────┐  ┌───▼──────────┐  ┌────▼──────────┐
│ Interview Engine   │  │ Question     │  │ Scoring       │
│ Agent              │  │ Generator    │  │ Service       │
│                    │  │ Agent        │  │               │
└───────┬────────────┘  └───┬──────────┘  └────┬──────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                  SERVICE LAYER                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ External Service Integrations                            │   │
│  │ - Gemini Service (AI/LLM)                                │   │
│  │ - VAPI Service (Voice)                                   │   │
│  │ - Database Service (Persistence)                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬──────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───��───▼────────┐  ┌──────▼──────────┐
│ Google Gemini  │  │ VAPI Voice     │  │ JSON Database  │
│ API            │  │ API            │  │ (interviews.   │
│                │  │                │  │  json)         │
└────────────────┘  └────────────────┘  └────────────────┘
```

## Agent-Based Design

### 1. Interview Engine Agent

**Purpose**: Autonomous evaluation of interview responses

**Architecture**:
```
Interview Engine Agent
├── Input Processing
│   ├── Parse interview transcript
│   ├── Extract Q&A pairs
│   └── Validate data integrity
├── Evaluation Pipeline
│   ├── Confidence Analysis
│   │   ├── Speech pattern analysis
│   │   ├── Hesitation detection
│   │   └── Pace evaluation
│   ├── Vocabulary Assessment
│   │   ├── Technical term usage
│   │   ├── Word variety analysis
│   │   └── Domain-specific language
│   ├── Technical Evaluation
│   │   ├── Accuracy assessment
│   │   ├── Depth analysis
│   │   └── Relevance scoring
│   └── Communication Analysis
│       ├── Clarity measurement
│       ├── Structure evaluation
│       └── Articulation scoring
├── Feedback Generation
│   ├── Score calculation (0-100)
│   ├── Suggestion generation
│   └── Actionable insights
└── Output
    └── Structured feedback JSON
```

**Key Methods**:
- `runInterview()`: Main evaluation function
- `parseFeedback()`: Parse and validate AI response
- Scoring algorithms for each dimension

### 2. Question Generation Agent

**Purpose**: Dynamic, contextual question generation

**Architecture**:
```
Question Generator Agent
├── Context Analysis
│   ├── Candidate profile
│   ├── Interview type (technical/HR)
│   ├── Domain specialization
│   ├── Difficulty level
│   └── Previous answer context
├── Question Generation
│   ├── Template selection
│   ├── Personalization
│   │   ├── Include candidate name
│   │   ├── Reference previous answers
│   │   └── Adapt to skill level
│   ├── Validation
���   │   ├── Ensure clarity
│   │   ├── Check relevance
│   │   └── Verify difficulty match
│   └── Fallback mechanism
└── Output
    └── Single, focused question
```

**Key Methods**:
- `generateInterviewQuestion()`: Main generation function
- `parseJsonBlock()`: Parse AI response
- Fallback question templates

### 3. Resume Analysis Agent

**Purpose**: Comprehensive resume evaluation

**Architecture**:
```
Resume Analysis Agent
├── Input Processing
│   ├── Text extraction
│   ├── Normalization
│   └── Validation
├── Analysis Pipeline
│   ├── ATS Score Calculation
│   │   ├── Keyword matching
│   │   ├── Format analysis
│   │   └── Completeness check
│   ├── Technical Assessment
│   │   ├── Technology stack analysis
│   │   ├── Experience level
│   │   └── Skill depth
│   ├── Communication Evaluation
│   │   ├── Action verb usage
│   │   ├── Achievement highlighting
│   │   └── Clarity assessment
│   └── Gap Analysis
│       ├── Missing keywords
│       ├── Skill gaps
│       ��── Experience gaps
├── Recommendation Engine
│   ├── Improvement suggestions
│   ├── Keyword recommendations
│   └── Format suggestions
└── Output
    └── Structured analysis JSON
```

**Key Methods**:
- `analyzeResume()`: Main analysis function
- `heuristicResumeAnalysis()`: Fallback analysis
- `parseResumeJson()`: Parse AI response

### 4. Career Path Agent

**Purpose**: Personalized career roadmap generation

**Architecture**:
```
Career Path Agent
├── Input Analysis
│   ├── Current skills assessment
│   ├── Goal definition
│   └── Market analysis
├── Roadmap Generation
│   ├── Skill gap identification
│   ├── Learning path creation
│   ├── Timeline estimation
│   ├── Milestone definition
│   └── Resource recommendation
├── Personalization
│   ├── Adapt to learning pace
│   ├── Consider experience level
│   └── Align with goals
└── Output
    └── Detailed roadmap with timeline
```

**Key Methods**:
- `careerPath()`: Main roadmap generation
- Gemini integration for content generation

## Data Flow

### Interview Session Flow

```
1. USER INITIATES INTERVIEW
   │
   ├─→ Frontend: beginInterview()
   │   ├─→ Request microphone permission
   │   ├─→ Capture candidate name
   │   ├─→ Get difficulty level
   │   ├─→ Get question count
   │   └─→ Get domain
   │
   ├─→ Backend: /api/interview/extract-name
   │   └─→ Extract name from speech
   │
   ├─→ QUESTION-ANSWER LOOP (for each question)
   │   │
   │   ├─→ Backend: /api/interview/next-question
   │   │   ├─→ Question Generator Agent
   │   │   ├─→ Gemini API call
   │   │   └─→ Return question
   │   │
   │   ├─→ Frontend: Speak question & capture answer
   │   │   ├─→ Text-to-speech
   │   │   ├─→ Speech recognition
   │   │   └─→ Store Q&A pair
   │   │
   │   └─→ Repeat for all questions
   │
   ├─→ Backend: /api/interview/start
   │   ��─→ Interview Engine Agent
   │   ├─→ Evaluate all responses
   │   ├─→ Generate feedback
   │   ├─→ Calculate scores
   │   ├─→ Database Service: Save session
   │   └─→ Return feedback
   │
   └─→ Frontend: Display feedback
       ├─→ Show scores
       ├─→ Display suggestions
       └─→ Update profile dashboard
```

### Resume Analysis Flow

```
1. USER UPLOADS/PASTES RESUME
   │
   ├─→ Frontend: Resume text input
   │   ├─→ PDF extraction (if file)
   │   └─→ Text normalization
   │
   ├─→ Backend: /api/resume/analyze
   │   ├─→ Resume Analysis Agent
   │   ├─→ Gemini API call
   │   ├─→ Parse response
   │   ├─→ Fallback heuristic analysis
   │   ├─→ Database Service: Save score
   │   └─→ Return analysis
   │
   └─→ Frontend: Display results
       ├─→ Show ATS score
       ├─→ Display strengths
       ├─→ Show missing keywords
       └─→ Display suggestions
```

### Career Path Flow

```
1. USER ENTERS SKILLS & GOALS
   │
   ├─→ Frontend: Input validation
   │
   ├─→ Backend: /api/career/path
   │   ├─→ Career Path Agent
   │   ├─→ Gemini API call
   │   ├─→ Database Service: Save score
   │   └─→ Return roadmap
   │
   └─→ Frontend: Display roadmap
       ├─→ Show timeline
       ├─→ Display milestones
       └─→ Show recommendations
```

## Component Details

### Frontend Components

#### 1. Authentication Module (`js/auth.js`)
- Firebase authentication integration
- Email/password registration and login
- Google OAuth integration
- Session management

#### 2. Interview Flow Module (`js/interview/interview-flow.js`)
- Voice capture orchestration
- Question-answer loop management
- Feedback display
- Error handling with fallbacks

#### 3. Session State Module (`js/interview/session-state.js`)
- Interview session state management
- Score tracking
- User profile information

#### 4. Page Controllers
- `interview-page.js`: Interview page logic
- `resume-page.js`: Resume analyzer logic
- `career-page.js`: Career path logic
- `profile-page.js`: Profile dashboard logic
- `dashboard.js`: Dashboard navigation

### Backend Components

#### 1. Controllers
- **Interview Controller**: Handles interview endpoints
- **Resume Controller**: Handles resume analysis
- **Career Controller**: Handles career path generation

#### 2. Services
- **Interview Engine**: Evaluation logic
- **Question Service**: Question generation
- **Gemini Service**: AI API wrapper with fallback strategy
- **VAPI Service**: Voice configuration
- **Database Service**: Data persistence
- **Scoring Service**: Score calculation

#### 3. Routes
- **Interview Routes**: `/api/interview/*`
- **Resume Routes**: `/api/resume/*`
- **Career Routes**: `/api/career/*`

### Database Schema

#### interviews.json Structure
```json
{
  "sessions": [
    {
      "id": "timestamp-random",
      "createdAt": "ISO-8601",
      "userName": "string",
      "type": "technical|hr",
      "domain": "string",
      "difficulty": "easy|medium|hard",
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
  ],
  "moduleScores": [
    {
      "module": "technical|hr|resume|career",
      "score": 0-100,
      "createdAt": "ISO-8601"
    }
  ]
}
```

## Integration Points

### 1. Google Gemini API Integration

**Purpose**: AI-powered content generation and evaluation

**Implementation** (`backend/services/gemini.service.js`):
```javascript
// Model fallback strategy
const MODEL_CANDIDATES = [
  "gemini-2.5-flash",    // Fastest, most cost-effective
  "gemini-2.5-pro",      // Balanced performance
  "gemini-2.0-flash"     // Fallback option
];

// Features:
- Automatic model fallback on failure
- 25-second timeout per request
- Error handling for rate limits
- Health check endpoint
```

**Usage**:
- Question generation
- Resume analysis
- Interview evaluation
- Career path generation

### 2. Firebase Authentication

**Purpose**: Secure user authentication

**Implementation** (`js/firebase.js`):
```javascript
// Firebase config with project credentials
// Features:
- Email/password authentication
- Google OAuth integration
- Session persistence
- Secure token management
```

### 3. Web Speech API Integration

**Purpose**: Browser-based voice capture

**Implementation** (`js/interview/interview-flow.js`):
```javascript
// Features:
- Speech recognition
- Text-to-speech synthesis
- Microphone permission handling
- Fallback to text input
- Timeout handling
```

### 4. VAPI Integration

**Purpose**: Advanced voice AI capabilities

**Implementation** (`backend/services/vapi.service.js`):
```javascript
// Configuration:
- Voice selection (jessica)
- Model selection (gpt-4o-mini)
- First message customization
```

## Scalability & Performance

### Current Architecture Limitations

1. **Data Storage**: JSON file-based (suitable for <10K sessions)
2. **Concurrency**: Single-threaded Node.js (suitable for <100 concurrent users)
3. **API Calls**: Sequential processing (no parallel requests)
4. **Memory**: In-memory session state (no distributed sessions)

### Scaling Strategies

#### Phase 1: Optimization (Current)
- Model fallback strategy
- Request timeout handling
- Efficient JSON parsing
- Lazy loading on frontend

#### Phase 2: Database Migration
```
Current: JSON file
↓
Target: MongoDB/PostgreSQL
Benefits:
- Horizontal scalability
- Better query performance
- Transaction support
- Backup/recovery
```

#### Phase 3: Microservices
```
Current: Monolithic Express server
↓
Target: Microservices architecture
Services:
- Auth Service
- Interview Service
- Resume Service
- Career Service
- Notification Service
```

#### Phase 4: Caching & CDN
```
Add:
- Redis for session caching
- CDN for static assets
- API response caching
- Database query caching
```

#### Phase 5: Async Processing
```
Add:
- Message queue (RabbitMQ/Kafka)
- Background job processing
- Async interview evaluation
- Batch processing
```

### Performance Metrics

**Current Performance**:
- API Response Time: 2-5 seconds (Gemini API dependent)
- Frontend Load Time: <2 seconds
- Interview Session Duration: 5-15 minutes
- Database Query Time: <100ms

**Target Performance**:
- API Response Time: <1 second (with caching)
- Frontend Load Time: <1 second
- Interview Session Duration: 5-15 minutes (unchanged)
- Database Query Time: <50ms

### Load Testing Recommendations

```
Test Scenarios:
1. Concurrent Users: 100, 500, 1000
2. Interview Sessions: Parallel question generation
3. Resume Analysis: Batch processing
4. API Rate Limits: Gemini quota handling
5. Database: Large dataset queries
```

## Security Architecture

### Authentication & Authorization
```
┌─────────────────────────────────────────┐
│ Firebase Authentication                 │
├─────────────────────────────────────────┤
│ - Email/Password                        │
│ - Google OAuth                          │
│ - JWT Token Management                  │
│ - Session Persistence                   │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ Protected Routes (auth-guard.js)        │
├─────────────────────────────────────────┤
│ - Verify user authentication            │
│ - Redirect to login if needed           │
│ - Maintain session state                │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│ API Endpoints                           │
├─────────────────────────────────────────┤
│ - Input validation                      │
│ - Error handling                        │
│ - Response sanitization                 │
└─────────────────────────────────────────┘
```

### Data Protection
- API keys in environment variables
- CORS configuration for cross-origin requests
- Input validation on all endpoints
- Error messages don't leak sensitive info

## Deployment Architecture

### Development Environment
```
Local Machine
├── Frontend: http://localhost:5000
├── Backend: http://localhost:5000
└── Database: ./backend/data/interviews.json
```

### Production Environment (Recommended)
```
Cloud Platform (AWS/GCP/Azure)
├── Frontend: CDN (CloudFront/Cloud CDN)
├── Backend: Container (Docker/Kubernetes)
├── Database: Managed Database (RDS/Cloud SQL)
├── Cache: Redis (ElastiCache/Memorystore)
└── Monitoring: CloudWatch/Stackdriver
```

### Docker Deployment
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
EXPOSE 5000
CMD ["npm", "start"]
```

---

**Document Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Active Development
