# InterviewPrep AI - Server Connection Fix Guide

## ❌ Problem: "localhost refused to connect"

This error means the **backend server is NOT running**.

---

## ✅ Solution: Start the Backend Server

### FASTEST WAY (30 seconds)

**Step 1**: Double-click this file in your project folder:
```
START_SERVER.bat
```

**Step 2**: Wait for this message:
```
Backend running on port 5000
```

**Step 3**: Open browser:
```
http://localhost:5000
```

✅ **DONE!** You should see the login page.

---

## 📋 Alternative: Manual Steps

### Using Command Prompt

**Step 1**: Open Command Prompt
- Press `Windows Key + R`
- Type: `cmd`
- Press `Enter`

**Step 2**: Copy and paste this:
```
cd c:\Users\LAKSHMANA PAVAN\OneDrive\Desktop\interview_prep\backend
npm start
```

**Step 3**: Press `Enter`

**Step 4**: Wait for:
```
Backend running on port 5000
```

**Step 5**: Open browser:
```
http://localhost:5000
```

---

## 🎯 What You Should See

### In Command Prompt
```
Backend running on port 5000
```

### In Browser
- Login page with "Welcome Back"
- Email and password fields
- "Create new account" link

---

## 🔧 Troubleshooting

### Issue: "npm: command not found"
**Solution**: Install Node.js from https://nodejs.org/

### Issue: "Port 5000 already in use"
**Solution**: 
```
netstat -ano | findstr :5000
taskkill /PID <number> /F
npm start
```

### Issue: "Cannot find module"
**Solution**:
```
cd c:\Users\LAKSHMANA PAVAN\OneDrive\Desktop\interview_prep
npm install
cd backend
npm install
npm start
```

### Issue: Still getting "localhost refused to connect"
**Checklist**:
- ✅ Command prompt shows "Backend running on port 5000"?
- ✅ Command prompt window is still open?
- ✅ You waited 5 seconds?
- ✅ Using correct URL: `http://localhost:5000`?
- ✅ Not `https://` (should be `http://`)?

---

## 📚 Documentation Files Created

### Server Startup Guides
- **STEP_BY_STEP_STARTUP.md** - Detailed step-by-step guide
- **SERVER_STARTUP_GUIDE.md** - Comprehensive startup guide
- **COPY_PASTE_COMMANDS.md** - Copy-paste ready commands
- **QUICK_REFERENCE.md** - Quick reference card

### Main Documentation
- **README.md** - Complete documentation
- **QUICKSTART.md** - 5-minute setup
- **QUICK_REFERENCE.md** - Quick reference

### Technical Documentation
- **ARCHITECTURE.md** - System architecture
- **MULTI_AGENT_ARCHITECTURE.md** - Agent details
- **API_DOCUMENTATION.md** - API reference
- **DEPLOYMENT.md** - Production guide
- **DEVELOPMENT.md** - Developer guide

### Voice & Microphone
- **MICROPHONE_VOICE_GUIDE.md** - Voice troubleshooting
- **MICROPHONE_FIXES_LOG.md** - Microphone fixes

### Project Documentation
- **DOCUMENTATION_INDEX.md** - Navigation guide
- **PROJECT_SUMMARY.md** - Project summary
- **IMPLEMENTATION_SUMMARY.md** - Implementation summary
- **DOCUMENTATION_CHECKLIST.md** - Verification checklist

### Startup Scripts
- **START_SERVER.bat** - Windows batch file
- **START_SERVER.ps1** - PowerShell script

---

## 🚀 Quick Start (3 Steps)

1. **Double-click**: `START_SERVER.bat`
2. **Wait for**: "Backend running on port 5000"
3. **Open**: `http://localhost:5000`

---

## 💡 Important Notes

### Keep Terminal Open
- Don't close the command prompt window
- Server needs to keep running
- Minimize it instead

### Correct URL
- Use: `http://localhost:5000`
- NOT: `https://localhost:5000`
- NOT: `localhost:5000` (missing http://)

### Port 5000
- Server runs on port 5000
- Make sure nothing else uses this port
- If in use, kill the process

---

## 📞 Need Help?

### Check These Files
1. **STEP_BY_STEP_STARTUP.md** - Detailed steps
2. **COPY_PASTE_COMMANDS.md** - Copy-paste commands
3. **QUICK_REFERENCE.md** - Quick reference
4. **README.md** - Full documentation

### Verify Setup
- Node.js installed? → `node --version`
- npm installed? → `npm --version`
- Dependencies installed? → Check `node_modules` folder
- `.env` file exists? → Check project root
- API keys in `.env`? → Check file contents

---

## ✨ Success Indicators

✅ Command prompt shows "Backend running on port 5000"
✅ Browser shows login page at `http://localhost:5000`
✅ Can create account
✅ Can login
✅ Can access dashboard
✅ Can start interviews

---

## 🎉 You're All Set!

The server is now running and ready to use.

**Next Steps**:
1. Create account or login
2. Test microphone
3. Start first interview
4. Review feedback

Enjoy InterviewPrep AI! 🚀

---

**Server Connection Fix Guide Version**: 1.0.0  
**Status**: ✅ READY TO USE
