# 🚀 VIBELYF BUILD ENGINE

**Automated Cultural Language Ingestion Pipeline**

Transform your static 453-term vocabulary database into a self-learning system that continuously discovers and validates new slang from song lyrics.

---

## 📋 Overview

The VIBELYF Build Engine is a 6-stage AI-powered pipeline that:

1. **Scans** trending song lyrics from Genius API
2. **Detects** new slang using OpenAI GPT-4
3. **Researches** definitions using Google Gemini
4. **Validates** terms against your existing database
5. **Stages** terms for human review
6. **Merges** approved terms into production database

---

## 🏗️ Architecture

```
vibelyf-build-engine/
├── config/
│   └── config.js               # Central configuration
├── data/
│   ├── pending_terms.json      # Terms awaiting approval
│   ├── processed_terms.json    # Approved/rejected archive
│   └── backups/                # Database backups
├── lib/
│   ├── genius-scanner.js       # Stage 1: Lyrics scraping
│   ├── slang-detector.js       # Stage 2: OpenAI detection
│   ├── researcher.js           # Stage 3: Gemini research
│   ├── validator.js            # Stage 4: Quality checks
│   └── database-manager.js     # Stage 6: Database updates
├── public/
│   └── admin/
│       ├── index.html          # Admin dashboard
│       ├── style.css
│       └── app.js
├── src/
│   └── orchestrator.js         # Main pipeline controller
├── .env                        # API keys (create from .env.example)
├── package.json
└── README.md
```

---

## ⚡ Quick Start

### 1. Installation

```bash
cd build-engine
npm install
```

### 2. Configure API Keys

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Required
GENIUS_API_KEY=your_genius_key_here
OPENAI_API_KEY=your_openai_key_here
GEMINI_API_KEY=AIzaSyB9jQaRGkfj4Tyq5y5j45RiYAeb_H2e-2g

# Optional
SPOTIFY_CLIENT_ID=your_spotify_id
SPOTIFY_CLIENT_SECRET=your_spotify_secret
```

**Get API Keys:**
- Genius: https://genius.com/api-clients
- OpenAI: https://platform.openai.com/api-keys
- Gemini: Already configured (or get at: https://makersuite.google.com/app/apikey)

### 3. Run the Pipeline

```bash
npm start
```

This will:
- Scan 50 trending songs
- Detect new slang terms
- Research definitions
- Validate and save to `data/pending_terms.json`

### 4. Review Terms

Open the admin dashboard:

```bash
npm run dashboard
```

Then navigate to: `http://localhost:3000/admin/`

Review, approve, or reject pending terms.

---

## 🎯 Pipeline Stages

### Stage 1: Lyrics Scanner
**File:** `lib/genius-scanner.js`

- Fetches trending songs from Genius API
- Supports multiple genres (hip-hop, rap, reggaeton, K-pop, etc.)
- Scrapes and cleans lyrics text
- Caches results to avoid re-fetching

**Output:** `data/scan_results.json`

### Stage 2: Slang Detector (OpenAI)
**File:** `lib/slang-detector.js`

- Uses GPT-4 Turbo to analyze lyrics
- Identifies non-standard language
- Filters against existing 453 terms
- Assigns confidence scores (0-100%)

**Output:** Array of detected terms with context

### Stage 3: Definition Researcher (Gemini)
**File:** `lib/researcher.js`

- Uses Google Gemini to research each term
- Generates comprehensive definitions
- Provides etymology and cultural context
- Finds usage examples and sources

**Output:** Fully structured term objects

### Stage 4: Validator
**File:** `lib/validator.js`

- Checks for duplicates
- Validates required fields
- Verifies category assignments
- Calculates validation scores
- Recommends: AUTO_APPROVE, NEEDS_REVIEW, or REJECT

**Output:** Validated terms with recommendations

### Stage 5: Human Review (Dashboard)
**Files:** `public/admin/`

- Web-based review interface
- Filter by category or confidence
- Approve/reject/edit terms
- Bulk approve high-confidence terms
- Export approved terms

### Stage 6: Database Merger
**File:** `lib/database-manager.js`

- Creates backup before merging
- Adds approved terms to appropriate categories
- Updates metadata (version, count, date)
- Sorts terms alphabetically
- Regenerates `cultural-vocabulary-master.js`

---

## 🎨 Dashboard Features

- **Real-time stats:** Pending, approved, and total term counts
- **Filter by category:** AAVE, Hispanic, Digital, etc.
- **Confidence filtering:** Show only high-confidence terms (90+%)
- **Bulk operations:** Approve all high-confidence terms at once
- **Export:** Download approved terms as JSON
- **Review workflow:** Approve, edit, or reject individual terms

---

## 🔧 Configuration

Edit `config/config.js` to customize:

```javascript
scanning: {
    genres: ['hip-hop', 'rap', 'reggaeton'],
    songsPerGenre: 10,
    totalSongsPerScan: 50,
    maxTermsPerScan: 20
},

validation: {
    minConfidenceScore: 60,
    autoApproveThreshold: 90,
    minSources: 2,
    minExamples: 2
}
```

---

## 📊 Expected Results

### Week 1
- ✅ 5-10 new terms discovered
- ✅ 70%+ validation pass rate
- ✅ Dashboard fully functional

### Month 1
- ✅ 50+ new terms added
- ✅ Database grows from 453 → 500+ terms
- ✅ Automated daily scans

### Month 6
- ✅ 300+ new terms added
- ✅ Database covers 750+ terms
- ✅ Build Engine is self-sustaining

---

## 🚀 Deployment

### Daily Automation (Cron Job)

Run daily at 3 AM:

```bash
0 3 * * * cd /path/to/build-engine && npm start >> logs/cron.log 2>&1
```

### CI/CD Integration

Add to your deployment pipeline:

```yaml
- name: Run Build Engine
  run: |
    cd build-engine
    npm install
    npm start
```

---

## 🛠️ Troubleshooting

### "Failed to load database"
- Check that `../js/cultural-vocabulary-master.js` exists
- Verify the path in `.env` is correct

### "Genius API search failed"
- Check your `GENIUS_API_KEY` in `.env`
- Verify API key is valid at https://genius.com/api-clients

### "OpenAI API call failed"
- Check your `OPENAI_API_KEY` in `.env`
- Ensure you have credits: https://platform.openai.com/account/billing

### "No songs found"
- Check your internet connection
- Try different genres in `config/config.js`

---

## 💰 API Costs

### Estimated Monthly Costs (Daily Scans)

- **Genius API:** Free (1000 requests/day)
- **OpenAI GPT-4:** ~$10-15/month (50 songs × $0.01 × 30 days)
- **Google Gemini:** Free tier (sufficient for most use cases)

**Total:** ~$10-15/month

---

## 📝 File Formats

### Pending Terms (`data/pending_terms.json`)

```json
{
  "metadata": {
    "totalPending": 5,
    "lastUpdated": "2024-12-19",
    "version": "1.0"
  },
  "terms": [
    {
      "term": "ong",
      "meaning": "On God - emphasis or truthfulness",
      "definition": "...",
      "category": "aave",
      "confidence": 85,
      "examples": ["..."],
      "sources": ["..."],
      "sourceSong": {
        "title": "Song Name",
        "artist": "Artist Name"
      }
    }
  ]
}
```

---

## 🤝 Integration with VIBELYF

This Build Engine is designed to update:
```
../js/cultural-vocabulary-master.js
```

After merging approved terms:
1. A backup is created in `data/backups/`
2. New terms are added to the appropriate category
3. Metadata is updated (version, count, date)
4. The file is sorted alphabetically
5. VIBELYF automatically uses the new terms

**No code changes needed in VIBELYF!**

---

## 📚 Next Steps

1. **Run your first scan:** `npm start`
2. **Review terms:** `npm run dashboard`
3. **Approve high-confidence terms**
4. **Merge to database**
5. **Test in VIBELYF**
6. **Set up daily automation**

---

## 🎯 Success Metrics

Track your progress:

- [ ] First successful scan (50 songs)
- [ ] First term detected and approved
- [ ] Database reaches 500 terms
- [ ] Daily scans automated
- [ ] 10+ terms added per week
- [ ] Users discover new slang in VIBELYF

---

## 🆘 Support

**Issues?**
- Check logs in `logs/` directory
- Review `data/pending_terms.json` for errors
- Verify API keys in `.env`

**Questions?**
Contact the VIBELYF development team.

---

## 📄 License

MIT License - Part of the VIBELYF project

---

**Built with ❤️ for VIBELYF**

*Keeping cultural language alive, one slang term at a time.*
