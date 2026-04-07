# InterviewPrep AI - Quick Start Guide

## 5-Minute Setup

### Prerequisites
- Node.js v16+ installed
- Git installed
- A modern web browser

### Step 1: Clone & Install (2 minutes)
```bash
git clone <repository-url>
cd interview_prep

# Install backend
cd backend
npm install

# Install frontend
cd ..
npm install
```

### Step 2: Configure Environment (1 minute)

Create `.env` file in project root:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
VAPI_API_KEY=your_vapi_api_key
```

**Get API Keys**:
- **Gemini API**: https://makersuite.google.com/app/apikey
- **VAPI**: https://dashboard.vapi.ai/

### Step 3: Start Server (1 minute)

**Terminal 1 - Backend**:
```bash
cd backend
npm start
```

Expected output:
```
Backend running on port 5000
```

### Step 4: Access Application (1 minute)

Open browser: `http://localhost:5000`

---

## First Time User Guide

### 1. Create Account
- Click "Create new account →"
- Enter email and password
- Click "Create Account"
- Or use "Google Login" for quick signup

### 2. Explore Dashboard
- View 4 main modules:
  - **Resume Analyzer**: Upload resume for ATS feedback
  - **Technical Interview**: Practice technical questions
  - **HR Interview**: Practice behavioral questions
  - **Career Path**: Get personalized roadmap

### 3. Try Resume Analysis
1. Click "Resume Analyzer"
2. Paste your resume text (or upload PDF)
3. Click "Analyze Resume"
4. View ATS score and suggestions

### 4. Try Technical Interview
1. Click "Technical Voice Interview"
2. Click "Start Voice Interview"
3. Say your name when prompted
4. Select difficulty (easy/medium/hard)
5. Select number of questions (1-20)
6. Select domain (DSA, Web Dev, Cloud, etc.)
7. Answer each question via voice
8. View feedback and scores

### 5. Check Profile
- Click profile card to view dashboard
- See scores for all modules
- Track progress over time

---

## Common Tasks

### Upload Resume
```
1. Go to Resume Analyzer
2. Click "Choose File" or paste text
3. Click "Analyze Resume"
4. Review ATS score and suggestions
```

### Start Interview
```
1. Choose interview type (Technical or HR)
2. Click "Start Voice Interview"
3. Follow voice prompts
4. Answer questions
5. View feedback
```

### Generate Career Path
```
1. Go to Career Path Planner
2. Enter your skills (e.g., "JavaScript, React, Node.js")
3. Enter your goal (e.g., "Full Stack Developer")
4. Click "Generate Career Path"
5. Review roadmap
```

### View Performance
```
1. Click profile card on dashboard
2. View circular score indicators
3. See scores for:
   - Technical interviews
   - HR interviews
   - Resume analysis
   - Career planning
```

---

## Troubleshooting

### Issue: "Backend running on port 5000" but page won't load

**Solution**:
```bash
# Check if port is in use
lsof -i :5000

# Kill process if needed
kill -9 <PID>

# Try different port
PORT=5001 npm start
```

### Issue: "GEMINI_API_KEY is missing"

**Solution**:
1. Get API key from: https://makersuite.google.com/app/apikey
2. Add to `.env` file:
   ```env
   GEMINI_API_KEY=your_actual_key_here
   ```
3. Restart backend: `npm start`

### Issue: Voice input not working

**Solution**:
1. Check microphone permissions in browser
2. Try text fallback (type instead of speak)
3. Use Chrome/Firefox (best support)
4. Check browser console for errors (F12)

### Issue: "Failed to analyze resume"

**Solution**:
1. Ensure resume text is at least 50 characters
2. Check internet connection
3. Verify Gemini API key is valid
4. Try again in a few seconds

### Issue: Can't login

**Solution**:
1. Check email and password are correct
2. Try "Google Login" instead
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try incognito/private window

---

## API Testing

### Test Backend Health
```bash
curl http://localhost:5000/api/interview/gemini-health
```

Expected response:
```json
{
  "ok": true,
  "reason": "Gemini reachable via gemini-2.5-flash"
}
```

### Test Resume Analysis
```bash
curl -X POST http://localhost:5000/api/resume/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "resumeText": "John Doe\nSoftware Engineer\nSkills: JavaScript, React, Node.js"
  }'
```

### Test Interview
```bash
curl -X POST http://localhost:5000/api/interview/start \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "type": "technical",
    "domain": "DSA",
    "difficulty": "medium",
    "totalQuestions": 1,
    "answers": [
      {
        "question": "What is a binary search tree?",
        "answer": "A data structure where each node has at most two children"
      }
    ]
  }'
```

---

## Project Structure Overview

```
interview_prep/
├── backend/              # Node.js/Express server
│   ├── server.js        # Main server file
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── routes/          # API endpoints
│   └── data/            # Database (JSON)
├── js/                  # Frontend JavaScript
│   ├── auth.js          # Login/signup
│   ├── dashboard.js     # Main dashboard
│   └── interview/       # Interview logic
├── css/                 # Styling
├── index.html           # Login page
├── dashboard.html       # Main dashboard
├── technical.html       # Technical interview
├── hr.html              # HR interview
├── resume.html          # Resume analyzer
├── career.html          # Career planner
└── profile.html         # Profile dashboard
```

---

## Key Features

### 1. Resume Analysis
- **ATS Score**: 0-100 rating
- **Technical Assessment**: Skill evaluation
- **Communication Check**: Soft skills analysis
- **Missing Keywords**: Suggestions for improvement
- **Actionable Feedback**: Specific recommendations

### 2. Technical Interview
- **Adaptive Questions**: Based on difficulty and domain
- **Voice Input**: Speak your answers
- **Real-time Feedback**: Immediate scoring
- **Multiple Domains**: DSA, Web Dev, Cloud, ML, etc.
- **Difficulty Levels**: Easy, Medium, Hard

### 3. HR Interview
- **Behavioral Questions**: Communication focus
- **Confidence Scoring**: Voice analysis
- **Communication Assessment**: Clarity and articulation
- **Suggestions**: Improvement tips

### 4. Career Planning
- **Personalized Roadmap**: Based on skills and goals
- **Timeline**: Month-by-month breakdown
- **Milestones**: Key achievements
- **Technology Recommendations**: Tools to learn

### 5. Profile Dashboard
- **Module Scores**: Visual performance indicators
- **Progress Tracking**: Historical data
- **Performance Analytics**: Trends over time

---

## Tips for Best Results

### Resume Analysis
- Include quantified achievements (e.g., "reduced latency by 30%")
- Use industry keywords relevant to your target role
- Highlight technical stack and tools used
- Include project outcomes and impact

### Technical Interview
- Speak clearly and at a moderate pace
- Explain your thought process
- Use technical terminology appropriately
- Provide examples when possible
- Ask clarifying questions if needed

### HR Interview
- Be conversational and natural
- Show enthusiasm for the role
- Provide specific examples from experience
- Discuss soft skills and teamwork
- Ask thoughtful questions

### Career Planning
- Be specific about your goal role
- List all relevant skills you have
- Consider both technical and soft skills
- Review roadmap regularly
- Update as you learn new skills

---

## Next Steps

### After First Interview
1. Review feedback and suggestions
2. Identify areas for improvement
3. Practice weak areas
4. Take another interview to track progress

### After Resume Analysis
1. Implement suggested improvements
2. Add missing keywords
3. Quantify achievements
4. Re-analyze to see score improvement

### After Career Planning
1. Follow the roadmap timeline
2. Complete suggested courses/certifications
3. Build projects mentioned in roadmap
4. Update profile with new skills

---

## Support & Resources

### Getting Help
- Check troubleshooting section above
- Review API documentation: `API_DOCUMENTATION.md`
- Check architecture guide: `ARCHITECTURE.md`
- Read development guide: `DEVELOPMENT.md`

### External Resources
- **Gemini API Docs**: https://ai.google.dev/
- **Firebase Docs**: https://firebase.google.com/docs
- **Node.js Docs**: https://nodejs.org/docs/
- **Express.js Guide**: https://expressjs.com/

### Reporting Issues
1. Check if issue is already documented
2. Provide detailed error message
3. Include steps to reproduce
4. Share relevant logs/screenshots

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `F12` | Open browser DevTools |
| `Ctrl+Shift+Delete` | Clear browser cache |
| `Ctrl+L` | Focus address bar |
| `Ctrl+R` | Refresh page |
| `Ctrl+Shift+R` | Hard refresh (clear cache) |

---

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Best support for Web Speech API |
| Firefox | ✅ Full | Good support |
| Safari | ✅ Full | Limited Web Speech API |
| Edge | ✅ Full | Chromium-based, full support |
| IE 11 | ❌ No | Not supported |

---

## Performance Tips

### Faster Loading
- Clear browser cache regularly
- Use modern browser (Chrome/Firefox)
- Check internet connection speed
- Close unnecessary browser tabs

### Better Interview Experience
- Use quiet environment
- Test microphone before starting
- Use wired internet if possible
- Close background applications

### Optimal Settings
- **Difficulty**: Start with "medium"
- **Questions**: Start with 3-5 questions
- **Domain**: Choose your strongest area first
- **Time**: Allow 15-20 minutes per session

---

## FAQ

**Q: Can I retake interviews?**
A: Yes, unlimited retakes. Each session is saved separately.

**Q: Is my data private?**
A: Yes, data is stored locally and in your Firebase account.

**Q: Can I export my results?**
A: Currently, results are viewable in the profile dashboard.

**Q: Do I need a microphone?**
A: Recommended but not required. Text fallback available.

**Q: How long does analysis take?**
A: Usually 2-5 seconds depending on Gemini API response time.

**Q: Can I use this on mobile?**
A: Yes, responsive design supports mobile browsers.

**Q: Is there a cost?**
A: Free tier available. Premium features coming soon.

**Q: Can I share results?**
A: Currently, results are personal. Sharing feature coming soon.

---

## What's Next?

1. **Complete Your First Interview**: Get baseline scores
2. **Analyze Your Resume**: Identify improvement areas
3. **Generate Career Path**: Plan your learning journey
4. **Track Progress**: Monitor improvement over time
5. **Share Feedback**: Help us improve the platform

---

**Quick Start Guide Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Active

For detailed information, see:
- `README.md` - Full documentation
- `ARCHITECTURE.md` - System design
- `API_DOCUMENTATION.md` - API reference
- `DEPLOYMENT.md` - Deployment guide
- `DEVELOPMENT.md` - Development guide
