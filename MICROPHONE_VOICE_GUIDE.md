# InterviewPrep AI - Microphone & Voice Integration Guide

## Overview

The system now uses an optimized architecture where:
- **VAPI** = Voice Interface (handles audio input/output)
- **Gemini** = Brain (handles AI logic and responses)

## Microphone Fixes Applied

### 1. Enhanced Audio Constraints
```javascript
// Added audio quality improvements
audio: {
  echoCancellation: true,      // Removes echo
  noiseSuppression: true,      // Reduces background noise
  autoGainControl: true        // Normalizes volume
}
```

### 2. Better Error Handling
- **no-speech**: "No speech detected. Please speak clearly."
- **network**: "Network error. Check your connection."
- **not-allowed**: "Microphone permission denied."
- **timeout**: "Voice input timed out. Please try again."

### 3. Improved State Management
- Added `isListening` flag to track recording state
- Better cleanup on errors
- Proper timeout handling

### 4. Enhanced User Feedback
- 🎤 Visual indicators for listening state
- ✓ Confirmation when speech is heard
- Clear error messages with suggestions

### 5. Robust Result Processing
```javascript
// Improved result extraction
const result = event.results[event.results.length - 1];
if (result && result[0]) {
  const part = result[0].transcript?.trim() || "";
}
```

---

## Architecture: VAPI + Gemini Integration

### System Flow

```
┌─────────────────────────────────────────────────────┐
│                    User                             │
│              (Speaks into Mic)                      │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │   VAPI (Voice Layer)    │
        │  - Audio Capture        │
        │  - Speech Recognition   │
        │  - Text-to-Speech       │
        └────────────┬────────────┘
                     │
        ┌────��───────▼────────────┐
        │  Transcript (Text)      │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  Gemini (Brain Layer)   │
        │  - Process Text         │
        │  - Generate Response    │
        │  - Evaluate Answer      │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │  Response (Text)        │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │   VAPI (Voice Layer)    │
        │  - Text-to-Speech       │
        │  - Audio Output         │
        └────────────┬────────────┘
                     │
        ┌────────────▼────────────┐
        │   User Hears Response   │
        └────────────────────────┘
```

---

## How to Use the Fixed Microphone

### Step 1: Allow Microphone Access
When you first open the website, your browser will ask for microphone permission:
- Click "Allow" to grant access
- If you click "Block", you'll need to manually enable it in browser settings

### Step 2: Test Microphone
1. Go to Technical or HR Interview
2. Click "Test Mic" button
3. Speak a short sentence
4. You should see: "Mic test success: [your text]"

### Step 3: Start Interview
1. Click "Start Voice Interview"
2. Wait for "Hello. Click and say your name."
3. Click the button and speak your name
4. Continue with difficulty, question count, and domain

### Step 4: Answer Questions
1. Listen to the AI question
2. Click the button when ready
3. Speak your answer clearly
4. Wait for next question

---

## Troubleshooting Microphone Issues

### Issue: "Microphone permission denied"
**Solution**:
1. Check browser settings
2. Allow microphone access for localhost:5000
3. Refresh the page
4. Try again

### Issue: "No speech detected"
**Solution**:
1. Speak louder and clearer
2. Reduce background noise
3. Move closer to microphone
4. Check microphone is working (test in system settings)

### Issue: "Network error"
**Solution**:
1. Check internet connection
2. Verify Gemini API key is correct
3. Check if Gemini API is accessible
4. Try again in a few seconds

### Issue: "Voice input timed out"
**Solution**:
1. Speak faster (you have 22 seconds)
2. Reduce silence between words
3. Check microphone is active
4. Try the text fallback option

### Issue: Microphone not recognized
**Solution**:
1. Check if microphone is connected
2. Test microphone in system settings
3. Restart browser
4. Try different browser (Chrome/Firefox recommended)

---

## Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome | ✅ Full | Best support, recommended |
| Firefox | ✅ Full | Good support |
| Safari | ✅ Full | Limited Web Speech API |
| Edge | ✅ Full | Chromium-based, full support |
| IE 11 | ❌ No | Not supported |

---

## API Keys Configuration

### Gemini API Key
```env
GEMINI_API_KEY=AIzaSyDLXIpxV23Eq75oJ4QOi7-k_oK3IS6py-M
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyDLXIpxV23Eq75oJ4QOi7-k_oK3IS6py-M
```

**What it does**:
- Generates interview questions
- Evaluates your answers
- Analyzes resumes
- Creates career paths

### VAPI API Key
```env
VAPI_API_KEY=0c3dbff7-a92b-4971-a3c2-4e96b82f14ab
```

**What it does**:
- Provides voice configuration
- Handles audio settings
- Manages voice assistant

---

## Voice Interview Flow

### Complete Interview Process

```
1. START
   ↓
2. REQUEST MICROPHONE PERMISSION
   ↓
3. CAPTURE NAME
   - AI: "Hello. Click and say your name."
   - User: Speaks name
   - System: Extracts name using Gemini
   ↓
4. SELECT DIFFICULTY
   - AI: "Click and say difficulty."
   - User: Says "easy", "medium", or "hard"
   - System: Normalizes difficulty level
   ↓
5. SELECT QUESTION COUNT
   - AI: "Click and say number of questions."
   - User: Says number (1-20)
   - System: Parses number
   ↓
6. SELECT DOMAIN
   - AI: "Click and say interview domain..."
   - User: Says domain (DSA, Web Dev, Cloud, ML)
   - System: Stores domain
   ↓
7. QUESTION-ANSWER LOOP (for each question)
   - Gemini generates question
   - AI speaks question
   - User speaks answer
   - System captures answer
   ↓
8. EVALUATE INTERVIEW
   - Gemini evaluates all answers
   - Calculates scores (confidence, vocabulary, technical, communication)
   - Generates suggestions
   ↓
9. DISPLAY FEEDBACK
   - Show scores with visual bars
   - Display suggestions
   - Show performance metrics
   ↓
10. END
```

---

## Scoring System

### Four Dimensions (0-100 each)

**1. Confidence**
- Speech clarity and pace
- Hesitation frequency
- Response completeness
- Recovery from mistakes

**2. Vocabulary**
- Technical term usage
- Word variety
- Domain-specific language
- Articulation quality

**3. Technical**
- Answer accuracy
- Depth of explanation
- Relevant examples
- Algorithm correctness

**4. Communication**
- Logical structure
- Clarity of explanation
- Engagement level
- Response relevance

---

## Tips for Best Results

### Before Interview
1. ✅ Test microphone first
2. ✅ Find quiet environment
3. ✅ Close background applications
4. ✅ Check internet connection
5. ✅ Use headphones (optional but recommended)

### During Interview
1. ✅ Speak clearly and at moderate pace
2. ✅ Explain your thought process
3. ✅ Use technical terminology appropriately
4. ✅ Provide examples when possible
5. ✅ Ask clarifying questions if needed

### Audio Quality
1. ✅ Reduce background noise
2. ✅ Speak directly into microphone
3. ✅ Maintain consistent volume
4. ✅ Avoid long pauses
5. ✅ Speak naturally, not robotic

---

## Advanced Configuration

### Microphone Settings (in browser)
```javascript
// Current settings (optimized)
audio: {
  echoCancellation: true,      // ON - Removes echo
  noiseSuppression: true,      // ON - Reduces noise
  autoGainControl: true        // ON - Normalizes volume
}
```

### Speech Recognition Settings
```javascript
rec.lang = navigator.language || "en-US";  // Auto-detect language
rec.interimResults = true;                  // Show partial results
rec.continuous = false;                     // Single phrase mode
rec.maxAlternatives = 1;                    // Best match only
```

### Timeout Settings
```javascript
const timeout = 22000;  // 22 seconds max per input
```

---

## Testing Microphone

### Manual Test
1. Click "Test Mic" button
2. Speak: "Hello, this is a test"
3. Expected: "Mic test success: Hello, this is a test"

### Troubleshooting Test
If test fails:
1. Check browser console (F12)
2. Look for error messages
3. Verify microphone in system settings
4. Try different browser
5. Restart browser

---

## Common Phrases for Interview

### For Difficulty
- "Easy" → Easy level
- "Medium" → Medium level
- "Hard" → Hard level

### For Question Count
- "One", "Two", "Three", etc.
- "5 questions"
- "10 questions"

### For Domain
- "DSA" or "Data Structures"
- "Web Development"
- "Cloud Computing"
- "Machine Learning"
- "General"

---

## Performance Optimization

### For Better Recognition
1. Speak at natural pace (not too fast)
2. Pause between sentences
3. Enunciate clearly
4. Avoid filler words ("um", "uh", "like")
5. Use complete sentences

### For Better Scores
1. Explain your reasoning
2. Provide specific examples
3. Use technical terminology correctly
4. Show problem-solving approach
5. Demonstrate communication skills

---

## Fallback Options

### If Microphone Fails
The system automatically offers text input:
```
"name voice capture failed (no-speech). Type name here:"
```

You can then type your response instead of speaking.

### Text Input Mode
1. Click "Test Mic" to verify
2. If it fails, use text fallback
3. Type your responses when prompted
4. System will still evaluate your answers

---

## Integration Details

### VAPI Integration
- **Purpose**: Voice interface and audio handling
- **Features**: Speech recognition, text-to-speech
- **Configuration**: Stored in backend/services/vapi.service.js
- **API Key**: 0c3dbff7-a92b-4971-a3c2-4e96b82f14ab

### Gemini Integration
- **Purpose**: AI brain for logic and evaluation
- **Features**: Question generation, answer evaluation, scoring
- **Configuration**: Stored in backend/services/gemini.service.js
- **API Key**: AIzaSyDLXIpxV23Eq75oJ4QOi7-k_oK3IS6py-M
- **Models**: Fallback strategy (2.5-flash → 2.5-pro → 2.0-flash)

---

## Debugging

### Enable Console Logging
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for messages like:
   - "Speech Recognition Error: [error]"
   - "Microphone permission error: [error]"
   - "Recognition error: [error]"

### Check Network
1. Open DevTools Network tab
2. Look for API calls to:
   - `/api/interview/next-question`
   - `/api/interview/start`
   - `/api/interview/extract-name`
3. Verify responses are successful (200 status)

### Check Microphone
1. System Settings → Sound
2. Verify microphone is enabled
3. Test microphone in system settings
4. Check volume levels

---

## Support

### If Issues Persist
1. Check browser compatibility
2. Try different browser
3. Restart browser and system
4. Clear browser cache
5. Check internet connection
6. Verify API keys are correct

### Contact Support
- Check documentation: README.md
- Review troubleshooting: QUICKSTART.md
- Check API docs: API_DOCUMENTATION.md

---

## Summary

✅ **Microphone Fixes Applied**:
- Enhanced audio constraints
- Better error handling
- Improved state management
- Enhanced user feedback
- Robust result processing

✅ **VAPI + Gemini Integration**:
- VAPI handles voice (input/output)
- Gemini handles AI logic (brain)
- Seamless integration
- Fallback to text input

✅ **Ready to Use**:
- Start the backend: `npm start`
- Open browser: `http://localhost:5000`
- Test microphone
- Start interview

---

**Microphone & Voice Integration Guide Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: ✅ READY TO USE
