# ✅ BUILD ENGINE SETUP CHECKLIST

Use this checklist to get the Build Engine running successfully.

---

## 📋 Pre-Installation (5 min)

- [ ] Node.js installed (v16+ required)
  ```bash
  node --version  # Should be v16.0.0 or higher
  ```

- [ ] Git installed
  ```bash
  git --version
  ```

- [ ] Text editor ready (VS Code, Sublime, etc.)

---

## 🔧 Installation (5 min)

- [ ] Navigate to build-engine folder
  ```bash
  cd build-engine
  ```

- [ ] Install dependencies
  ```bash
  npm install
  ```

- [ ] Verify installation
  ```bash
  ls node_modules  # Should see axios, openai, etc.
  ```

---

## 🔑 API Keys Setup (10 min)

### Genius API (Free)

- [ ] Go to: https://genius.com/api-clients
- [ ] Sign in or create account
- [ ] Click "New API Client"
- [ ] Fill in app details (any name works)
- [ ] Click "Generate Access Token"
- [ ] **Copy token** (starts with lowercase letters)

### OpenAI API ($10-15/month)

- [ ] Go to: https://platform.openai.com/api-keys
- [ ] Sign in or create account
- [ ] Add payment method: https://platform.openai.com/account/billing
- [ ] Click "Create new secret key"
- [ ] **Copy key** (starts with `sk-`)
- [ ] **Important:** Save it now! You can't view it again

### Google Gemini API (Free - Already Configured)

- [ ] Pre-configured in project: `AIzaSyB9jQaRGkfj4Tyq5y5j45RiYAeb_H2e-2g`
- [ ] Or get your own at: https://makersuite.google.com/app/apikey

### Add Keys to `.env`

- [ ] Copy example file
  ```bash
  cp .env.example .env
  ```

- [ ] Edit `.env` file
  ```bash
  # Use your preferred editor
  nano .env
  # or
  code .env
  ```

- [ ] Paste your keys:
  ```env
  GENIUS_API_KEY=your_genius_key_here
  OPENAI_API_KEY=sk-your_openai_key_here
  GEMINI_API_KEY=AIzaSyB9jQaRGkfj4Tyq5y5j45RiYAeb_H2e-2g
  ```

- [ ] Save and close

- [ ] Verify `.env` file exists
  ```bash
  cat .env  # Should show your keys (not the example values)
  ```

---

## 🧪 First Test Run (5 min)

- [ ] Run the pipeline
  ```bash
  npm start
  ```

- [ ] Watch for success messages:
  - [ ] ✅ "Loaded database: 453 terms"
  - [ ] ✅ "STAGE 1: LYRICS SCANNER"
  - [ ] ✅ Songs being scanned
  - [ ] ✅ "STAGE 2: SLANG DETECTION"
  - [ ] ✅ Terms being detected
  - [ ] ✅ "STAGE 3: DEFINITION RESEARCH"
  - [ ] ✅ "STAGE 4: VALIDATION"
  - [ ] ✅ "PIPELINE COMPLETE"

- [ ] Check output files:
  ```bash
  cat data/pending_terms.json
  ```

---

## 🎨 Dashboard Setup (2 min)

- [ ] Start dashboard server
  ```bash
  npm run dashboard
  ```

- [ ] Open browser to: http://localhost:3000/admin/

- [ ] Verify dashboard loads:
  - [ ] Header shows "VIBELYF BUILD ENGINE"
  - [ ] Stats show pending count
  - [ ] Terms display in cards

---

## 👤 First Term Approval (5 min)

- [ ] Review first pending term
  - [ ] Read meaning and definition
  - [ ] Check confidence score
  - [ ] Verify examples make sense
  - [ ] Review sources

- [ ] Click **"✅ Approve"**

- [ ] Verify term moves to approved list

- [ ] Export approved terms
  ```bash
  Click "📥 Export Approved Terms"
  ```

---

## 🔗 Database Integration Test (5 min)

- [ ] Check backup was created
  ```bash
  ls data/backups/
  ```

- [ ] Verify database path is correct
  ```bash
  # Should point to: ../js/cultural-vocabulary-master.js
  cat config/config.js | grep vocabularyDatabase
  ```

- [ ] Check database file exists
  ```bash
  ls ../js/cultural-vocabulary-master.js
  ```

---

## 🚀 Full Pipeline Test (10 min)

### Run Complete Workflow:

- [ ] Step 1: Run scan
  ```bash
  npm start
  ```

- [ ] Step 2: Open dashboard
  ```bash
  npm run dashboard
  ```

- [ ] Step 3: Review terms
  - [ ] Filter by confidence (90%+)
  - [ ] Check term quality
  - [ ] Verify no duplicates

- [ ] Step 4: Bulk approve
  - [ ] Click "Bulk Approve High Confidence"
  - [ ] Confirm approval

- [ ] Step 5: Verify success
  - [ ] Check approved count increased
  - [ ] Terms ready for merge

---

## 📊 Verification Checklist

### After First Run:

- [ ] Scan results file exists
  ```bash
  ls data/scan_results.json
  ```

- [ ] Pending terms file populated
  ```bash
  cat data/pending_terms.json | grep "totalPending"
  ```

- [ ] Dashboard accessible
  ```bash
  curl http://localhost:3000/admin/index.html
  ```

- [ ] No error messages in console

- [ ] Backup directory created
  ```bash
  ls data/backups/
  ```

---

## 🎯 Success Criteria

Mark these off as you achieve them:

### Week 1:
- [ ] First successful scan (50 songs)
- [ ] First term detected
- [ ] First term approved
- [ ] Dashboard fully functional
- [ ] No API errors

### Week 2:
- [ ] 5-10 terms approved total
- [ ] Terms merged into database
- [ ] VIBELYF recognizes new terms
- [ ] Daily scans set up (optional)

### Month 1:
- [ ] 50+ new terms added
- [ ] Database reaches 500+ terms
- [ ] Pipeline runs smoothly
- [ ] Users discovering new slang

---

## 🔧 Troubleshooting Checklist

If something doesn't work:

### Scan Fails:

- [ ] Check Genius API key is correct
  ```bash
  cat .env | grep GENIUS_API_KEY
  ```

- [ ] Verify internet connection
  ```bash
  ping genius.com
  ```

- [ ] Try different genres in `config/config.js`

### Detection Fails:

- [ ] Check OpenAI API key
  ```bash
  cat .env | grep OPENAI_API_KEY
  ```

- [ ] Verify OpenAI account has credits
  - Visit: https://platform.openai.com/account/billing

- [ ] Check API key starts with `sk-`

### Research Fails:

- [ ] Check Gemini API key
  ```bash
  cat .env | grep GEMINI_API_KEY
  ```

- [ ] Verify API endpoint is correct in `config/config.js`

### Dashboard Won't Load:

- [ ] Check server is running
  ```bash
  npm run dashboard
  ```

- [ ] Verify port 3000 is free
  ```bash
  lsof -i :3000
  ```

- [ ] Try different port in `.env`
  ```env
  PORT=3001
  ```

---

## 📅 Daily Automation Checklist

### Setup Cron Job (Linux/Mac):

- [ ] Open crontab
  ```bash
  crontab -e
  ```

- [ ] Add daily job
  ```bash
  0 3 * * * cd /path/to/build-engine && npm start >> logs/cron.log 2>&1
  ```

- [ ] Create logs directory
  ```bash
  mkdir -p logs
  ```

- [ ] Test cron works
  ```bash
  # Wait 24 hours or manually trigger
  ```

### Setup Task Scheduler (Windows):

- [ ] Open Task Scheduler
- [ ] Create new task
- [ ] Trigger: Daily at 3:00 AM
- [ ] Action: Run `npm start` in build-engine folder
- [ ] Test task runs successfully

---

## 🎉 Final Checklist

Before considering setup complete:

- [ ] ✅ All dependencies installed
- [ ] ✅ All API keys configured
- [ ] ✅ First scan completed successfully
- [ ] ✅ Dashboard accessible and functional
- [ ] ✅ First term approved and exported
- [ ] ✅ Database integration verified
- [ ] ✅ No console errors
- [ ] ✅ Documentation reviewed
- [ ] ✅ Backup system working
- [ ] ✅ Ready for daily automation

---

## 🆘 Support Resources

If you get stuck:

1. **Read logs:**
   ```bash
   tail -f logs/*.log
   ```

2. **Check documentation:**
   - README.md
   - QUICK-START.md
   - 🎊-BUILD-ENGINE-COMPLETE.md

3. **Verify file structure:**
   ```bash
   tree -L 2
   ```

4. **Test each component:**
   ```bash
   node lib/genius-scanner.js  # Test scanner
   node lib/slang-detector.js  # Test detector
   ```

---

**✅ Setup complete when all boxes are checked!**

**Good luck building! 🚀**
