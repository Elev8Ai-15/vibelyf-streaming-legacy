# ⚡ QUICK START GUIDE

Get the VIBENICITY Build Engine running in **5 minutes**.

---

## Step 1: Install Dependencies (1 min)

```bash
cd build-engine
npm install
```

---

## Step 2: Configure API Keys (2 min)

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add these 3 required keys:

```env
GENIUS_API_KEY=your_genius_key_here
OPENAI_API_KEY=your_openai_key_here
GEMINI_API_KEY=AIzaSyB9jQaRGkfj4Tyq5y5j45RiYAeb_H2e-2g
```

### Where to Get Keys:

1. **Genius API** (Free): https://genius.com/api-clients
   - Sign in → Create API Client → Copy Access Token

2. **OpenAI API** ($10-15/month): https://platform.openai.com/api-keys
   - Create account → Add payment method → Create API Key

3. **Gemini API** (Free): Already configured, or get at https://makersuite.google.com/app/apikey

---

## Step 3: Run the Pipeline (1 min)

```bash
npm start
```

You'll see:

```
🚀 VIBENICITY BUILD ENGINE v1.0.0
Automated Cultural Language Ingestion Pipeline

🎵 STAGE 1: LYRICS SCANNER
Scanning 50 songs across genres: hip-hop, rap, reggaeton...
  ✓ Drake - Song Title
  ✓ Bad Bunny - Song Title
  ...

🔍 STAGE 2: SLANG DETECTION
  ✓ Found 5 potential new terms

📚 STAGE 3: DEFINITION RESEARCH
  Researching: "ong"
    ✓ 85% confidence
  ...

✅ STAGE 4: VALIDATION
  ong: NEEDS_REVIEW (85%)
  ...

💾 SAVING PENDING TERMS
✅ Saved 3 terms to pending_terms.json

📊 RESULTS:
   Songs scanned:     50
   Terms detected:    5
   Pending approval:  3

✅ Build Engine run complete!
```

---

## Step 4: Review Terms (1 min)

Open the dashboard:

```bash
npm run dashboard
```

Navigate to: **http://localhost:3000/admin/**

You'll see:
- Pending terms with confidence scores
- Definitions, examples, sources
- Approve/Reject buttons

---

## Step 5: Approve Terms

Click **"✅ Approve"** on high-confidence terms.

Or click **"✅ Bulk Approve High Confidence"** to approve all 90%+ terms at once.

---

## Step 6: Merge to Database

After approving terms, they're ready to merge into your VIBENICITY database.

The Build Engine will:
1. Create backup of current database
2. Add approved terms to appropriate categories
3. Update version and term count
4. Save to `../js/cultural-vocabulary-master.js`

Your VIBENICITY chatbot will automatically use the new terms! 🎉

---

## 📅 Daily Automation

Set up a daily cron job:

```bash
crontab -e
```

Add:

```bash
0 3 * * * cd /path/to/build-engine && npm start >> logs/cron.log 2>&1
```

This runs the pipeline every day at 3 AM.

---

## 🎯 Next Steps

- [ ] Run your first scan
- [ ] Approve your first term
- [ ] Test in VIBENICITY
- [ ] Set up daily automation
- [ ] Watch your database grow from 453 → 500+ terms!

---

## 💡 Pro Tips

1. **Start with high-confidence terms:** Approve 90%+ first
2. **Check sources:** Verify Urban Dictionary, TikTok, song lyrics
3. **Review etymology:** Ensure cultural accuracy
4. **Bulk operations:** Use "Bulk Approve" for efficiency
5. **Monitor daily:** Check dashboard every morning

---

## 🆘 Common Issues

### "Failed to load database"
→ Check that `../js/cultural-vocabulary-master.js` exists

### "OpenAI API call failed"
→ Verify API key and check billing: https://platform.openai.com/account/billing

### "No songs found"
→ Try different genres in `config/config.js`

---

**Ready to build! 🚀**

Run `npm start` to begin your first scan.
