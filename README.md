# 🌐 Vibenicity Nation

> AI-powered social creation platform that **understands slang**, **teaches communication**, and **builds apps from your words**.

[![Status](https://img.shields.io/badge/status-stable-success)]()
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](CONTRIBUTING.md)
[![Built with](https://img.shields.io/badge/built%20with-AI-purple)]()
[![Vibe](https://img.shields.io/badge/vibe-deep%20navy-0f2d5a)]()

**Design Philosophy:** *Linguistic diversity is a bridge, not a barrier, to democratize tech education.*

---

## 🎯 What is Vibenicity?

Vibenicity is a **dual-purpose platform**:

1. **🌍 Universal Social/Productivity Hub** — aggregates social media, music, shopping, and AI tools into one feed
2. **🎓 AI Communication Intelligence Trainer** — detects vague language, interprets slang, teaches precise communication

It's a place where people who speak in slang, dialect, or non-standard English can **build apps**, **learn communication skills**, and **find community** — without being gatekept by traditional tech literacy.

---

## ✨ Features

### 🤖 Core AI Engines
- **Code Generator** — Gemini 2.5 Flash → builds HTML/CSS/JS apps from natural-language descriptions
- **API Generator** — Gemini (primary) + Claude (fallback) → generates Express + Prisma backends
- **Image Forge** — 5-model Gemini chain → image-driven UI generation
- **Cultural Vocabulary** — 453 terms across 11 categories (AAVE, Prison Slang, Southern, Gen Z, etc.)
- **Linguistics Engine V32** — 16 vibe archetypes (FIRE, ICE, NEON, GLASS, LUXURY, KAWAII, CYBER, MATRIX…) mapped to Tailwind CSS
- **Groq Fast-Brain** — sub-500ms slang detection via Llama 3.3 70B

### 🗂️ Social/Productivity Hub
- **Smart Feed System** — honest **embed-or-new-tab** architecture (no fake feeds)
  - **Embedded:** YouTube, Spotify, SoundCloud, YouTube Music
  - **New Tab:** Instagram, Facebook, X/Twitter, TikTok, Snapchat, LinkedIn, Reddit, Pinterest, Discord, Apple Music, Pandora
  - **Shopping:** Amazon, eBay, AliExpress, Walmart, Etsy, Shopify, Target, Best Buy, Temu, Shein (affiliate links)
- **Builder Tools** — direct access to Claude AI, ChatGPT, Genspark AI

### 🎨 Design — Blue Glassmorphism v2.1
- Deep navy-royal blue (`rgb(15,45,90)`) on cool-white frosted glass
- 33 widgets total: 22 SVG brand logos + 6 AI builder icons + 3 category icons + 10 nav icons + fallbacks
- **Hover-reveal tab system** — 60fps GPU-composited expand/collapse with keyboard accessibility
- Fully responsive, ARIA-compliant, reduced-motion safe

### 👤 User Systems
- **Profile** — XP system, 12 vibe themes, 11 progression tiers, editable bio/avatar
- **Voice Input** — Web Speech API mic, real-time transcript
- **Onboarding Chat** — welcome flow with cultural intro
- **Cloud Sync** — Supabase auth (email/password + OAuth)
- **PWA** — installable, offline-capable

### 📊 Communication Training (5-Step Loop)
`Vague Detection → Clarification → Context Gathering → Generation → Scoring`

Tracks a Communication Score over time and awards achievements for clear, precise messages.

---

## 🚀 Quick Start

### Run Locally
No build step required — it's a static site.

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/vibenicity.git
cd vibenicity

# Serve (Python)
python3 -m http.server 8000

# Or with Node
npx serve .
```

Open **http://localhost:8000** → you're live.

### Configure API Keys (optional, for AI features)
Type these in the chat bar (keys are stored in browser localStorage):

| Command | Purpose |
|---|---|
| `/groq gsk_YOUR_KEY` | Set Groq API key (free tier: 6000 req/day) |
| `/cloud YOUR_URL YOUR_ANON_KEY` | Configure Supabase |
| `/status` | Show full system diagnostic |

For **Gemini** and **Claude** keys, see in-app prompts when you first try a build command.

---

## 💬 Chat Commands

| Command | Action |
|---|---|
| `/score` | Show communication score breakdown |
| `/groq [key]` | Show Groq status or set API key |
| `/voice` | Show voice input statistics |
| `/status` or `/diag` | Full system diagnostic |
| `/cloud [url key]` | Configure Supabase |
| `/signup email pass` | Create account (requires Supabase) |
| `/login email pass` | Sign in (requires Supabase) |
| `/sync` | Force push local data to cloud |

---

## 🏗️ Architecture

```
vibenicity/
├── index.html              Main SPA (~421KB) — entire app
├── manifest.json           PWA manifest
├── sw.js                   Service worker
├── SUPABASE_SETUP.sql      Database schema
├── css/                    Design system + component styles
│   └── red-glassmorphism.css   Blue Glassmorphism v2.1 (legacy filename)
├── js/                     18 JavaScript modules
│   ├── cultural-vocabulary-master.js   453-term database
│   ├── linguistics-engine-v32.js       16 vibe archetypes
│   ├── vibenicity-code-generator.js    Gemini code gen
│   ├── claude-api-generator.js         API gen
│   ├── vibenicity-groq-brain.js        Fast slang detection
│   ├── vibenicity-cloud.js             Supabase auth/DB
│   ├── vibenicity-profile.js           User profile system
│   ├── vibenicity-tabs.js              Hover-reveal tab system
│   └── (10 more)
├── images/                 Icons + brand assets
│   └── icons/              SVG brand logos (Simple Icons, MIT)
├── videos/                 Welcome brand video
├── data/                   Linguistic datasets
├── components/             Reusable HTML components
└── docs/                   Detailed documentation (SAVE_STATE.md, etc.)
```

### Key Files

| File | Size | Purpose |
|---|---|---|
| [`index.html`](index.html) | 421KB | Main SPA with inline JS |
| [`css/red-glassmorphism.css`](css/red-glassmorphism.css) | 47KB | Design system (Blue Glassmorphism v2.1) |
| [`js/vibenicity-tabs.js`](js/vibenicity-tabs.js) | 29KB | Hover-reveal tab system v2.0 |
| [`js/cultural-vocabulary-master.js`](js/cultural-vocabulary-master.js) | 185KB | 453-term vocabulary database |
| [`SAVE_STATE.md`](SAVE_STATE.md) | 13KB | Architecture map for AI agents |

> 💡 **Note:** `css/red-glassmorphism.css` is a legacy filename — the file actually contains the *blue* design system (v2.1). It will be renamed in a future cleanup.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, ES6+ JavaScript (no transpilation) |
| **AI Code Gen** | Google Gemini 2.5 Flash |
| **AI API Gen** | Gemini (primary) + Claude Sonnet 4 (fallback) |
| **AI Fast-Brain** | Groq Llama 3.3 70B |
| **Image AI** | Gemini 5-model chain (Nano Banana Pro upcoming) |
| **Voice** | Web Speech API |
| **Analytics** | PostHog |
| **Auth/DB** | Supabase (ready to connect) |
| **Storage** | localStorage (17 keys) + cloud sync |
| **PWA** | manifest.json + service worker |
| **Styling** | CSS custom properties + Tailwind via CDN |
| **Fonts** | Google Fonts (Inter) |

---

## 📊 Build Status

✅ **Stable** — 0 JS errors, all 9 modules operational (verified via PlaywrightConsoleCapture)
✅ **PWA Registered** — installable, offline-capable
🚧 **~65% toward full vision**

### ✅ What's Working
- AI code generation, API generation, image generation
- 453-term cultural vocabulary database with self-learning ("Golden Goose")
- 16 vibe archetypes → CSS injection
- 5-step communication training loop
- Smart feed system (embed-or-new-tab)
- User profile + XP system
- Customization panel (6 tabs: Themes/Effects/Typography/Layout/Widgets/AI)
- Hover-reveal tab system with keyboard accessibility
- Voice input
- Cloud sync (Supabase auth + DB)

### 🚧 Roadmap
- [ ] **Social Graph** — following / followers / connections
- [ ] **Native Content Posting** — user-generated content flow
- [ ] **Community Features** — comments, likes, shares
- [ ] **Discovery/Explore Feed**
- [ ] **Notification System** — push + in-app
- [ ] **Modern AI Upgrades** — Gemini 3.0, Claude 4.5, streaming, prompt caching, MCP, Agent SDK
- [ ] **Vector RAG** — semantic search on vocabulary via pgvector
- [ ] **Conversational Voice Agent** — ElevenLabs Conversational v2
- [ ] **Video Creation** — Veo 3.1 / Sora 2 integration
- [ ] **Edge-Proxied API Keys** — Cloudflare Worker for secure key management
- [ ] **Mobile Apps** — Capacitor wrap for iOS/Android stores

See [`SAVE_STATE.md`](SAVE_STATE.md) for the full architecture deep-dive.

---

## 🤝 Contributing

Contributions of all kinds welcome — bug reports, feature ideas, vocabulary submissions, design improvements, code.

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for guidelines.

---

## 🔒 Security

Found a vulnerability? See [`SECURITY.md`](SECURITY.md) for responsible disclosure.

⚠️ **Current limitation:** API keys are stored in browser localStorage (client-exposed). Roadmap item: proxy via Cloudflare Worker.

---

## 📜 License

[MIT](LICENSE) © 2026 Vibenicity Nation

---

## 🙏 Credits

- **Brand Logos** — [Simple Icons](https://simpleicons.org) (MIT licensed)
- **AI Models** — Google Gemini, Anthropic Claude, Groq, OpenAI
- **Cultural Vocabulary** — 15 academic sources, AAVE/Prison/Southern/Gen Z dialects
- **Inspiration** — every community that ever built something with words they were told didn't count

---

<p align="center">
  <strong>Built with ❤️ and 453 slang terms.</strong><br>
  <em>The revolution is cultural intelligence meets AI.</em>
</p>
