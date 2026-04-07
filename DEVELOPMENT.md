# InterviewPrep AI - Development Guide

## Table of Contents
1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Code Style & Standards](#code-style--standards)
4. [Development Workflow](#development-workflow)
5. [Testing](#testing)
6. [Debugging](#debugging)
7. [Contributing](#contributing)

---

## Development Environment Setup

### Prerequisites
- Node.js v16+ (LTS recommended)
- npm v8+ or yarn v3+
- Git v2.30+
- Visual Studio Code (recommended)
- Postman or similar API testing tool

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd interview_prep
```

### Step 2: Install Dependencies

**Backend**:
```bash
cd backend
npm install
```

**Frontend**:
```bash
cd ..
npm install
```

### Step 3: Setup Environment Variables

**Backend** (`.env`):
```env
PORT=5000
NODE_ENV=development
GEMINI_API_KEY=your_test_key
GOOGLE_GENERATIVE_AI_API_KEY=your_test_key
VAPI_API_KEY=your_test_key
LOG_LEVEL=debug
```

**Frontend** (`.env`):
```env
PORT=5000
```

### Step 4: Verify Setup

**Backend Health Check**:
```bash
cd backend
npm start
# Expected: "Backend running on port 5000"
```

**Frontend Access**:
```bash
# In another terminal
open http://localhost:5000
```

---

## Project Structure

### Backend Structure
```
backend/
├── config/
│   └── env.js                 # Environment configuration
├── controllers/
│   ├── interview.controller.js # Interview logic
│   ├── resume.controller.js    # Resume analysis logic
│   └── career.controller.js    # Career path logic
├── routes/
│   ├── interview.routes.js     # Interview endpoints
│   ├── resume.routes.js        # Resume endpoints
│   └── career.routes.js        # Career endpoints
├── services/
│   ├── interview.engine.js     # Interview evaluation
│   ├── question.service.js     # Question generation
│   ├── gemini.service.js       # Gemini API wrapper
│   ├── vapi.service.js         # VAPI configuration
│   ├── scoring.services.js     # Scoring logic
│   └── db.service.js           # Database operations
├── data/
│   ���── interviews.json         # Data store
├── server.js                   # Express server
├── package.json
└── .env
```

### Frontend Structure
```
├── css/
│   ├── style.css               # Login page styles
│   ├── dashboard.css           # Dashboard styles
│   ├── animations.css          # Animations
│   └── charts.css              # Chart styles
├── js/
│   ├── interview/
│   │   ├── interview-flow.js   # Interview orchestration
│   │   └── session-state.js    # Session state
│   ├── auth.js                 # Authentication
│   ├── firebase.js             # Firebase config
│   ├── dashboard.js            # Dashboard logic
│   ├── interview-page.js       # Interview page
│   ├── resume-page.js          # Resume page
│   ├── career-page.js          # Career page
│   └── profile-page.js         # Profile page
├── index.html                  # Login page
├── dashboard.html              # Dashboard
├── technical.html              # Technical interview
├── hr.html                     # HR interview
├── resume.html                 # Resume analyzer
├── career.html                 # Career planner
├── profile.html                # Profile dashboard
└── package.json
```

---

## Code Style & Standards

### JavaScript Style Guide

#### Naming Conventions
```javascript
// Constants: UPPER_SNAKE_CASE
const MAX_QUESTIONS = 20;
const API_TIMEOUT = 25000;

// Variables: camelCase
let sessionState = {};
const userName = "John";

// Functions: camelCase
function generateQuestion() {}
const analyzeResume = async () => {};

// Classes: PascalCase
class InterviewEngine {}

// Private methods: _camelCase
function _parseResponse() {}
```

#### Code Formatting
```javascript
// Use 2-space indentation
function example() {
  const value = 42;
  return value;
}

// Use const by default, let if needed, avoid var
const immutable = "value";
let mutable = "value";

// Use arrow functions for callbacks
array.map(item => item * 2);

// Use template literals
const message = `Hello, ${name}!`;

// Use async/await over .then()
async function fetchData() {
  try {
    const data = await fetch(url);
    return data;
  } catch (error) {
    console.error(error);
  }
}
```

#### Comments & Documentation
```javascript
/**
 * Generates an interview question based on context
 * @param {Object} context - Interview context
 * @param {string} context.userName - Candidate name
 * @param {string} context.domain - Interview domain
 * @param {string} context.difficulty - Difficulty level
 * @returns {Promise<string>} Generated question
 * @throws {Error} If question generation fails
 */
async function generateQuestion(context) {
  // Implementation
}

// Use inline comments for complex logic
const score = Math.min(95, 35 + hits.length * 4); // ATS score calculation
```

### HTML/CSS Standards

#### HTML
```html
<!-- Use semantic HTML -->
<header>
  <nav>Navigation</nav>
</header>

<main>
  <section>
    <article>Content</article>
  </section>
</main>

<footer>Footer</footer>

<!-- Use data attributes for JavaScript -->
<div data-interview-type="technical">
  Interview content
</div>
```

#### CSS
```css
/* Use CSS custom properties for theming */
:root {
  --primary-color: #38bdf8;
  --bg-color: #0c111b;
  --text-color: #e6edf7;
}

/* Use BEM naming convention */
.card {
  /* Block */
}

.card__header {
  /* Element */
}

.card--active {
  /* Modifier */
}

/* Mobile-first approach */
.container {
  width: 100%;
}

@media (min-width: 768px) {
  .container {
    width: 750px;
  }
}
```

---

## Development Workflow

### Feature Development

#### Step 1: Create Feature Branch
```bash
git checkout -b feature/new-feature-name
```

#### Step 2: Implement Feature

**Backend Example** (New API Endpoint):
```javascript
// 1. Create controller method
// backend/controllers/example.controller.js
export async function exampleEndpoint(req, res) {
  try {
    const { data } = req.body;
    const result = await processData(data);
    res.json({ result });
  } catch (error) {
    res.status(500).json({
      error: "Failed to process",
      details: error.message
    });
  }
}

// 2. Create route
// backend/routes/example.routes.js
import express from "express";
import { exampleEndpoint } from "../controllers/example.controller.js";

const router = express.Router();
router.post("/example", exampleEndpoint);
export default router;

// 3. Register route in server.js
import exampleRoutes from "./routes/example.routes.js";
app.use("/api/example", exampleRoutes);
```

**Frontend Example** (New Page):
```html
<!-- new-page.html -->
<!DOCTYPE html>
<html>
<head>
  <title>New Page</title>
  <link rel="stylesheet" href="css/dashboard.css">
  <script type="module" src="js/auth-guard.js"></script>
</head>
<body>
  <div id="content">
    <!-- Page content -->
  </div>
  <script type="module" src="js/new-page.js"></script>
</body>
</html>
```

```javascript
// js/new-page.js
async function loadData() {
  try {
    const response = await fetch("/api/example/data");
    const data = await response.json();
    renderData(data);
  } catch (error) {
    console.error("Failed to load data:", error);
  }
}

function renderData(data) {
  // Render logic
}

loadData();
```

#### Step 3: Test Feature

```bash
# Manual testing
npm start

# Test API endpoints
curl -X POST http://localhost:5000/api/example/example \
  -H "Content-Type: application/json" \
  -d '{"data": "test"}'

# Test in browser
# Navigate to http://localhost:5000/new-page.html
```

#### Step 4: Commit Changes
```bash
git add .
git commit -m "feat: add new feature description"
```

#### Step 5: Push and Create Pull Request
```bash
git push origin feature/new-feature-name
# Create PR on GitHub
```

### Bug Fixes

#### Step 1: Create Bug Branch
```bash
git checkout -b fix/bug-description
```

#### Step 2: Reproduce Bug
```bash
# Add test case that reproduces bug
# Verify bug exists
```

#### Step 3: Fix Bug
```javascript
// Make minimal changes to fix issue
// Add comments explaining the fix
```

#### Step 4: Test Fix
```bash
# Verify bug is fixed
# Run related tests
# Check for regressions
```

#### Step 5: Commit and Push
```bash
git commit -m "fix: description of bug fix"
git push origin fix/bug-description
```

---

## Testing

### Manual Testing Checklist

#### Interview Module
- [ ] Start technical interview
- [ ] Start HR interview
- [ ] Test voice input (if available)
- [ ] Test text fallback
- [ ] Verify feedback generation
- [ ] Check score calculation
- [ ] Verify session saving

#### Resume Module
- [ ] Upload PDF resume
- [ ] Paste resume text
- [ ] Verify ATS score
- [ ] Check keyword extraction
- [ ] Verify suggestions

#### Career Module
- [ ] Enter skills and goals
- [ ] Generate career path
- [ ] Verify roadmap content

#### Profile Module
- [ ] View module scores
- [ ] Check score updates
- [ ] Verify data persistence

### API Testing with Postman

#### Setup Postman Collection

**1. Create Collection**:
- Name: "InterviewPrep AI"
- Description: "API testing collection"

**2. Add Requests**:

**Interview Start**:
```
POST http://localhost:5000/api/interview/start
Headers: Content-Type: application/json
Body:
{
  "name": "Test User",
  "type": "technical",
  "domain": "DSA",
  "difficulty": "medium",
  "totalQuestions": 2,
  "answers": [
    {
      "question": "What is a binary search tree?",
      "answer": "A data structure..."
    }
  ]
}
```

**Resume Analysis**:
```
POST http://localhost:5000/api/resume/analyze
Headers: Content-Type: application/json
Body:
{
  "resumeText": "John Doe\nSoftware Engineer\nSkills: JavaScript, React"
}
```

**Career Path**:
```
POST http://localhost:5000/api/career/path
Headers: Content-Type: application/json
Body:
{
  "skills": "JavaScript, React",
  "goals": "Full Stack Developer"
}
```

### Unit Testing (Future)

**Setup Jest**:
```bash
npm install --save-dev jest
```

**Example Test**:
```javascript
// backend/services/__tests__/question.service.test.js
import { generateInterviewQuestion } from '../question.service.js';

describe('Question Service', () => {
  test('should generate question with candidate name', async () => {
    const question = await generateInterviewQuestion({
      userName: 'John',
      interviewType: 'technical',
      domain: 'DSA',
      difficulty: 'medium',
      askedQuestions: 0,
      lastAnswer: ''
    });

    expect(question).toContain('John');
    expect(question.length).toBeGreaterThan(10);
  });
});
```

**Run Tests**:
```bash
npm test
```

---

## Debugging

### Backend Debugging

#### Using Node Inspector

**Start with Inspector**:
```bash
node --inspect backend/server.js
```

**Open DevTools**:
```
chrome://inspect
```

#### Using Console Logging

```javascript
// Add debug logs
console.log('Debug info:', variable);
console.error('Error occurred:', error);

// Use debug module
import debug from 'debug';
const log = debug('interview-prep:service');
log('Service started');
```

#### Using VS Code Debugger

**`.vscode/launch.json`**:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Backend",
      "program": "${workspaceFolder}/backend/server.js",
      "restart": true,
      "console": "integratedTerminal"
    }
  ]
}
```

**Usage**:
- Set breakpoints in code
- Press F5 to start debugging
- Use debug console to inspect variables

### Frontend Debugging

#### Browser DevTools

**Chrome/Firefox/Safari**:
- Press F12 to open DevTools
- Use Console tab for logs
- Use Network tab to inspect API calls
- Use Application tab to check localStorage

#### Common Issues

**Issue**: API calls failing
```javascript
// Check network tab for request/response
// Verify API endpoint URL
// Check request headers
// Verify request body format
```

**Issue**: Voice input not working
```javascript
// Check browser console for errors
// Verify microphone permissions
// Test with text fallback
// Check browser compatibility
```

---

## Contributing

### Code Review Checklist

Before submitting PR, ensure:
- [ ] Code follows style guide
- [ ] All functions have JSDoc comments
- [ ] No console.log statements (use proper logging)
- [ ] Error handling is implemented
- [ ] No hardcoded values (use constants/env vars)
- [ ] Code is DRY (Don't Repeat Yourself)
- [ ] Performance is acceptable
- [ ] Security best practices followed

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `test`: Test additions
- `chore`: Build/dependency changes

**Examples**:
```
feat(interview): add adaptive difficulty adjustment
fix(resume): correct ATS score calculation
docs(api): update endpoint documentation
refactor(services): extract common logic
```

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Manual testing completed
- [ ] API endpoints tested
- [ ] Edge cases handled

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guide
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
```

---

## Performance Optimization Tips

### Backend Optimization

```javascript
// 1. Use async/await properly
async function processData(items) {
  // Good: Parallel processing
  return Promise.all(items.map(item => processItem(item)));
  
  // Bad: Sequential processing
  // for (const item of items) {
  //   await processItem(item);
  // }
}

// 2. Cache frequently accessed data
const cache = new Map();
function getCachedData(key) {
  if (cache.has(key)) return cache.get(key);
  const data = expensiveOperation();
  cache.set(key, data);
  return data;
}

// 3. Use efficient data structures
const set = new Set(largeArray); // O(1) lookup
const map = new Map(pairs);      // O(1) access
```

### Frontend Optimization

```javascript
// 1. Lazy load resources
const script = document.createElement('script');
script.src = 'heavy-library.js';
document.body.appendChild(script);

// 2. Debounce event handlers
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

// 3. Use event delegation
document.addEventListener('click', (e) => {
  if (e.target.matches('.button')) {
    handleButtonClick(e.target);
  }
});
```

---

## Useful Commands

```bash
# Backend
cd backend
npm start              # Start development server
npm test              # Run tests
npm run lint          # Lint code

# Frontend
npm install           # Install dependencies
npm start             # Start dev server (if configured)

# Git
git status            # Check status
git log --oneline     # View commit history
git diff              # View changes
git stash             # Temporarily save changes
git rebase main       # Rebase on main branch

# Docker
docker build -t interview-prep .
docker run -p 5000:5000 interview-prep
docker-compose up -d
docker-compose logs -f
```

---

## Resources

### Documentation
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Firebase Documentation](https://firebase.google.com/docs)

### Tools
- [VS Code](https://code.visualstudio.com/)
- [Postman](https://www.postman.com/)
- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/)

### Learning Resources
- [JavaScript.info](https://javascript.info/)
- [CSS-Tricks](https://css-tricks.com/)
- [Dev.to](https://dev.to/)

---

**Development Guide Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Active
