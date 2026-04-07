# How to Start InterviewPrep AI Server

## ❌ Error: "localhost refused to connect"

This means the backend server is **NOT RUNNING**. Follow these steps to start it:

---

## 🚀 Option 1: Using Batch File (Easiest for Windows)

### Step 1: Double-click the startup file
```
START_SERVER.bat
```

A command window will open and show:
```
========================================
InterviewPrep AI - Backend Server Startup
========================================

Starting backend server on port 5000...
```

### Step 2: Wait for server to start
You should see:
```
Backend running on port 5000
```

### Step 3: Open browser
```
http://localhost:5000
```

---

## 🚀 Option 2: Using PowerShell

### Step 1: Open PowerShell
- Press `Windows Key + X`
- Select "Windows PowerShell (Admin)"

### Step 2: Navigate to project
```powershell
cd "c:\Users\LAKSHMANA PAVAN\OneDrive\Desktop\interview_prep"
```

### Step 3: Run startup script
```powershell
.\START_SERVER.ps1
```

### Step 4: Wait for server to start
You should see:
```
Backend running on port 5000
```

### Step 5: Open browser
```
http://localhost:5000
```

---

## 🚀 Option 3: Manual Command Prompt

### Step 1: Open Command Prompt
- Press `Windows Key + R`
- Type `cmd`
- Press Enter

### Step 2: Navigate to project
```cmd
cd c:\Users\LAKSHMANA PAVAN\OneDrive\Desktop\interview_prep
```

### Step 3: Go to backend folder
```cmd
cd backend
```

### Step 4: Start server
```cmd
npm start
```

### Step 5: Wait for message
You should see:
```
Backend running on port 5000
```

### Step 6: Open browser
```
http://localhost:5000
```

---

## ✅ Success Indicators

When the server starts successfully, you should see:

```
Backend running on port 5000
```

And in your browser at `http://localhost:5000`, you should see:
- Login page with "Welcome Back" heading
- Email and password input fields
- "Create new account" link

---

## ❌ Troubleshooting

### Issue: "npm: command not found"
**Solution**: Node.js is not installed
1. Download from: https://nodejs.org/
2. Install Node.js (includes npm)
3. Restart command prompt
4. Try again

### Issue: "Port 5000 already in use"
**Solution**: Another process is using port 5000
```cmd
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Try starting server again
npm start
```

### Issue: "Cannot find module"
**Solution**: Dependencies not installed
```cmd
cd c:\Users\LAKSHMANA PAVAN\OneDrive\Desktop\interview_prep
npm install
cd backend
npm install
npm start
```

### Issue: "GEMINI_API_KEY is missing"
**Solution**: Check `.env` file
1. Open `.env` file in project root
2. Verify it contains:
```env
PORT=5000
GEMINI_API_KEY=AIzaSyDLXIpxV23Eq75oJ4QOi7-k_oK3IS6py-M
GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyDLXIpxV23Eq75oJ4QOi7-k_oK3IS6py-M
VAPI_API_KEY=0c3dbff7-a92b-4971-a3c2-4e96b82f14ab
```
3. Save file
4. Restart server

---

## 📋 Quick Checklist

- ✅ Node.js installed (check: `node --version`)
- ✅ npm installed (check: `npm --version`)
- ✅ Dependencies installed (check: `npm install` in both root and backend)
- ✅ `.env` file has API keys
- ✅ Port 5000 is not in use
- ✅ Backend server is running
- ✅ Browser can access `http://localhost:5000`

---

## 🎯 Next Steps After Server Starts

1. ✅ Server shows "Backend running on port 5000"
2. ✅ Open browser: `http://localhost:5000`
3. ✅ Create account or login
4. ✅ Test microphone
5. ✅ Start first interview

---

## 📞 Still Having Issues?

### Check Server Status
```cmd
# In a new command prompt, check if server is running
netstat -ano | findstr :5000
```

If you see a result, server is running.

### Check Logs
Look at the command prompt where you started the server for error messages.

### Restart Everything
1. Close all command prompts
2. Close browser
3. Start fresh with `START_SERVER.bat`
4. Open browser to `http://localhost:5000`

---

## 💡 Pro Tips

### Keep Server Running
- Don't close the command prompt window while using the app
- Minimize it instead
- Keep it visible to see any errors

### Multiple Terminals
- Use one terminal for the server
- Use another for any other commands
- This way you can see server logs

### Auto-Restart on Changes
To auto-restart server when files change:
```cmd
npm install -g nodemon
cd backend
nodemon server.js
```

---

## 📚 Documentation

For more help, see:
- **QUICKSTART.md** - 5-minute setup guide
- **QUICK_REFERENCE.md** - Quick reference card
- **README.md** - Complete documentation
- **MICROPHONE_VOICE_GUIDE.md** - Voice troubleshooting

---

**Server Startup Guide Version**: 1.0.0  
**Status**: ✅ READY TO USE

Start the server now and enjoy InterviewPrep AI! 🚀
