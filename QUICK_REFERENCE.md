# InterviewPrep AI - Quick Reference Card

## 🚀 START HERE (3 Steps)

### Step 1: Install & Configure
```bash
cd c:\Users\LAKSHMANA PAVAN\OneDrive\Desktop\interview_prep
npm install
cd backend && npm install && cd ..
```

### Step 2: Start Backend
```bash
cd backend
npm start
```
✅ You should see: `Backend running on port 5000`

### Step 3: Open Browser
```
http://localhost:5000
```

---

## 🎤 Microphone Setup

### Allow Permission
- Browser will ask for microphone access
- Click "Allow"
- If blocked, enable in browser settings

### Test Microphone
1. Go to any interview page
2. Click "Test Mic"
3. Speak: "Hello, this is a test"
4. Should see: "Mic test success: ..."

---

## 📋 API Keys (Already Configured)

```env
GEMINI_API_KEY=AIzaSyDLXIpxV23Eq75oJ4QOi7-k_oK3IS6py-M
VAPI_API_KEY=0c3dbff7-a92b-4971-a3c2-4e96b82f14ab
```

✅ Both keys are already in `.env` file

---

## 🎯 Interview Flow

### 1. Create Account
- Email/Password or Google Login
- Redirects to Dashboard

### 2. Choose Module
- **Resume Analyzer**: Upload resume
- **Technical Interview**: Technical questions
- **HR Interview**: Behavioral questions
- **Career Path**: Career roadmap

### 3. Start Interview
- Click "Start Voice Interview"
- Say your name
- Select difficulty (easy/medium/hard)
- Select question count (1-20)
- Select domain (DSA, Web Dev, Cloud, ML)

### 4. Answer Questions
- Listen to AI question
- Click button and speak answer
- Repeat for all questions

### 5. View Feedback
- See scores (0-100):
  - Confidence
  - Vocabulary
  - Technical
  - Communication
- Read suggestions

---

## 🎤 Voice Commands

### Difficulty
- Say: "Easy" or "Medium" or "Hard"

### Question Count
- Say: "5" or "10" or "Twenty"

### Domain
- Say: "DSA" or "Web Development" or "Cloud" or "Machine Learning"

---

## ⚙️ System Architecture

```
VAPI (Voice)          Gemini (Brain)
├─ Audio Input        ├─ Question Generation
├─ Speech Recognition ├─ Answer Evaluation
└─ Text-to-Speech     └─ Scoring
```

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Mic not working | Check browser permissions, test in system settings |
| "No speech detected" | Speak louder, reduce background noise |
| "Network error" | Check internet, verify API keys |
| Port 5000 in use | Use `PORT=5001 npm start` |
| API key error | Verify `.env` file has correct keys |

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| README.md | Full overview |
| QUICKSTART.md | 5-minute setup |
| MICROPHONE_VOICE_GUIDE.md | Voice troubleshooting |
| API_DOCUMENTATION.md | API reference |
| ARCHITECTURE.md | System design |

---

## 🌐 Browser Support

✅ Chrome (Recommended)
✅ Firefox
✅ Safari
✅ Edge
❌ Internet Explorer

---

## 📊 Scoring Explained

**Confidence** (0-100)
- How clear and confident you sound

**Vocabulary** (0-100)
- Quality of language and technical terms

**Technical** (0-100)
- Accuracy and depth of answers

**Communication** (0-100)
- Clarity and structure of responses

---

## 💡 Tips

✅ Speak clearly and at natural pace
✅ Explain your reasoning
✅ Use technical terminology correctly
✅ Provide specific examples
✅ Reduce background noise
✅ Use headphones (optional)

---

## 🔗 Quick Links

- **Login**: http://localhost:5000
- **Dashboard**: http://localhost:5000/dashboard
- **Technical Interview**: http://localhost:5000/technical.html
- **HR Interview**: http://localhost:5000/hr.html
- **Resume Analyzer**: http://localhost:5000/resume.html
- **Career Path**: http://localhost:5000/career.html
- **Profile**: http://localhost:5000/profile.html

---

## 🎓 Learning Path

1. **First Time**: Read QUICKSTART.md
2. **Setup**: Follow 3 steps above
3. **Test**: Click "Test Mic"
4. **Try**: Start with 1-2 questions
5. **Learn**: Read feedback and suggestions
6. **Improve**: Take another interview

---

## 📞 Support

- **Documentation**: See README.md
- **Troubleshooting**: See QUICKSTART.md
- **Voice Issues**: See MICROPHONE_VOICE_GUIDE.md
- **API Help**: See API_DOCUMENTATION.md

---

## ✨ Features

✅ Resume Analysis with ATS scoring
✅ Technical Interview with adaptive questions
✅ HR Interview with behavioral assessment
✅ Career Path Planning
✅ Voice-based confidence analysis
✅ Real-time feedback
✅ Performance tracking
✅ Multi-agent AI system

---

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Start backend server
3. ✅ Open http://localhost:5000
4. ✅ Create account
5. ✅ Test microphone
6. ✅ Start first interview
7. ✅ Review feedback
8. ✅ Take another interview

---

**Quick Reference Card Version**: 1.0.0  
**Status**: ✅ READY TO USE
