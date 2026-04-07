# InterviewPrep AI - Step-by-Step Server Startup Guide

## 🎯 QUICK FIX (2 Minutes)

### For Windows Users - EASIEST METHOD

**Step 1**: Go to project folder
```
c:\Users\LAKSHMANA PAVAN\OneDrive\Desktop\interview_prep
```

**Step 2**: Double-click this file
```
START_SERVER.bat
```

**Step 3**: Wait for this message
```
Backend running on port 5000
```

**Step 4**: Open browser
```
http://localhost:5000
```

✅ **DONE!** You should see the login page.

---

## 📝 DETAILED STEPS (If above doesn't work)

### Method 1: Command Prompt (Windows)

**Step 1**: Open Command Prompt
- Press `Windows Key + R`
- Type: `cmd`
- Press `Enter`

**Step 2**: Navigate to project
```cmd
cd c:\Users\LAKSHMANA PAVAN\OneDrive\Desktop\interview_prep
```

**Step 3**: Go to backend
```cmd
cd backend
```

**Step 4**: Start server
```cmd
npm start
```

**Step 5**: You should see
```
Backend running on port 5000
```

**Step 6**: Open browser
```
http://localhost:5000
```

---

### Method 2: PowerShell (Windows)

**Step 1**: Open PowerShell as Admin
- Press `Windows Key + X`
- Click "Windows PowerShell (Admin)"

**Step 2**: Navigate to project
```powershell
cd "c:\Users\LAKSHMANA PAVAN\OneDrive\Desktop\interview_prep"
```

**Step 3**: Run startup script
```powershell
.\START_SERVER.ps1
```

**Step 4**: You should see
```
Backend running on port 5000
```

**Step 5**: Open browser
```
http://localhost:5000
```

---

## ✅ VERIFICATION

### Server is Running When You See:
```
Backend running on port 5000
```

### Browser Shows:
- Login page with "Welcome Back"
- Email and password fields
- "Create new account" link

### If You See This Error:
```
ERR_CONNECTION_REFUSED
```
→ Server is NOT running. Go back and follow steps above.

---

## 🔧 TROUBLESHOOTING

### Problem 1: "npm: command not found"

**Cause**: Node.js not installed

**Fix**:
1. Download: https://nodejs.org/
2. Install Node.js (includes npm)
3. Restart command prompt
4. Try `npm start` again

---

### Problem 2: "Port 5000 already in use"

**Cause**: Another program is using port 5000

**Fix** (Command Prompt):
```cmd
netstat -ano | findstr :5000
```

You'll see something like:
```
TCP    127.0.0.1:5000    0.0.0.0:0    LISTENING    12345
```

Kill that process (replace 12345 with your number):
```cmd
taskkill /PID 12345 /F
```

Then try starting server again:
```cmd
npm start
```

---

### Problem 3: "Cannot find module"

**Cause**: Dependencies not installed

**Fix**:
```cmd
cd c:\Users\LAKSHMANA PAVAN\OneDrive\Desktop\interview_prep
npm install
cd backend
npm install
npm start
```

---

### Problem 4: "GEMINI_API_KEY is missing"

**Cause**: `.env` file missing or incomplete

**Fix**:
1. Open `.env` file in project root
2. Make sure it has:
```env
PORT=5000
GEMINI_API_KEY=AIzaSyDLXIpxV23Eq75oJ4QOi7-k_oK3IS6py-M
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyDLXIpxV23Eq75oJ4QOi7-k_oK3IS6py-M
VAPI_API_KEY=0c3dbff7-a92b-4971-a3c2-4e96b82f14ab
```
3. Save file
4. Restart server

---

### Problem 5: Still getting "localhost refused to connect"

**Checklist**:
- ✅ Command prompt shows "Backend running on port 5000"?
- ✅ Command prompt window is still open?
- ✅ You waited 5 seconds after starting?
- ✅ You're using correct URL: `http://localhost:5000`?
- ✅ Not `https://` (should be `http://`)?

If all yes, try:
1. Close command prompt
2. Close browser
3. Start fresh with `START_SERVER.bat`
4. Wait 10 seconds
5. Open browser

---

## 📊 WHAT HAPPENS WHEN SERVER STARTS

### Terminal Output
```
Backend running on port 5000
```

### Browser Shows
```
InterviewPrep AI
Welcome Back

[Email input field]
[Password input field]

[Login button]
[Google Login button]

Create new account →
```

### You Can Now
- Create account
- Login
- Access dashboard
- Start interviews

---

## 🎯 COMPLETE WORKFLOW

```
1. Open Command Prompt
   ↓
2. Navigate to backend folder
   ↓
3. Run: npm start
   ↓
4. See: "Backend running on port 5000"
   ↓
5. Open: http://localhost:5000
   ↓
6. See: Login page
   ↓
7. Create account or login
   ↓
8. Access dashboard
   ↓
9. Start interview
```

---

## 💡 IMPORTANT NOTES

### Keep Terminal Open
- Don't close the command prompt window
- Server needs to keep running
- Minimize it instead

### One Terminal Per Server
- Use one terminal for the server
- Use another for other commands
- This prevents conflicts

### Port 5000
- Server runs on port 5000
- Make sure nothing else uses this port
- If in use, kill the process (see troubleshooting)

### Browser URL
- Use: `http://localhost:5000`
- NOT: `https://localhost:5000`
- NOT: `localhost:5000` (missing http://)

---

## 🚀 QUICK COMMANDS REFERENCE

### Start Server
```cmd
cd backend
npm start
```

### Check Node.js
```cmd
node --version
```

### Check npm
```cmd
npm --version
```

### Check Port 5000
```cmd
netstat -ano | findstr :5000
```

### Kill Process on Port 5000
```cmd
taskkill /PID <number> /F
```

### Install Dependencies
```cmd
npm install
cd backend
npm install
```

---

## 📞 STILL STUCK?

### Check These Files
- **SERVER_STARTUP_GUIDE.md** - This file
- **QUICKSTART.md** - 5-minute setup
- **README.md** - Full documentation
- **QUICK_REFERENCE.md** - Quick reference

### Verify Setup
1. Node.js installed? → `node --version`
2. npm installed? → `npm --version`
3. Dependencies installed? → Check `node_modules` folder
4. `.env` file exists? → Check project root
5. API keys in `.env`? → Check file contents

### Common Mistakes
- ❌ Closing command prompt (server stops)
- ❌ Using wrong URL (https instead of http)
- ❌ Port 5000 already in use
- ❌ Dependencies not installed
- ❌ `.env` file missing or incomplete

---

## ✨ SUCCESS CHECKLIST

- ✅ Command prompt open
- ✅ Navigated to backend folder
- ✅ Ran `npm start`
- ✅ See "Backend running on port 5000"
- ✅ Opened `http://localhost:5000`
- ✅ See login page
- ✅ Can create account
- ✅ Can login
- ✅ Can access dashboard
- ✅ Can start interview

---

**Step-by-Step Guide Version**: 1.0.0  
**Status**: ✅ READY TO USE

Follow these steps and you'll have the server running in 2 minutes! 🚀
