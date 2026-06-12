# 🌐 VibeLyf

> AI-powered social creation platform that **understands slang**, **teaches communication**, and **builds apps from your words**.

[![Status](https://img.shields.io/badge/status-stable-success)]()
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)](CONTRIBUTING.md)
[![Built with](https://img.shields.io/badge/built%20with-AI-purple)]()
[![Vibe](https://img.shields.io/badge/vibe-deep%20navy-0f2d5a)]()

**Design Philosophy:** *Linguistic diversity is a bridge, not a barrier, to democratize tech education.*

---

## 🎯 What is VibeLyf?

VibeLyf is a **dual-purpose platform**:

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
git clone https://github.com/YOUR_USERNAME/vibelyf.git
cd vibelyf

# Serve (Python)
python3 -m http.server 8000

# Or with Node
npx serve .
```

Open **http://localhost:8000** → you're live.

### AI features — no keys needed in the browser
All LLM calls route through the **VibeLyf API Worker** (`worker/`, Cloudflare Workers).
Provider keys live in the Worker's encrypted secret store — **never put API keys in
the browser or localStorage.** The SPA points at the Worker via
`window.VIBELYF_WORKER_API` (set in `index.html`).

To run your own Worker: `cd worker && cp .dev.vars.example .dev.vars` (fill in keys)
then `npm run dev` for local or `npx wrangler deploy` for production.

| Command | Purpose |
|---|---|
| `/status` or `/diag` | Show full system diagnostic |
| `/cloud YOUR_URL YOUR_ANON_KEY` | Configure Supabase (anon key is browser-safe) |

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
vibelyf/
├── index.html              Main SPA (~421KB) — entire app
├── manifest.json           PWA manifest
├── sw.js                   Service worker
├── SUPABASE_SETUP.sql      Database schema
├── css/                    Design system + component styles
│   └── red-glassmorphism.css   Blue Glassmorphism v2.1 (legacy filename)
├── worker/                 Cloudflare Workers API proxy (keys, CORS, rate limits)
├── privacy.html            Privacy & Data Policy (served at /privacy)
├── deploy-pages.sh         THE way to deploy the SPA (atomic staging rebuild)
├── js/                     JavaScript modules
│   ├── cultural-vocabulary-master.js   453-term database
│   ├── linguistics-engine-v32.js       16 vibe archetypes
│   ├── vibelyf-code-generator.js    Code gen (via Worker → Claude)
│   ├── claude-api-generator.js         API gen (via Worker → Claude)
│   ├── vibelyf-groq-brain.js        Fast slang detection (via Worker → Groq)
│   ├── vibelyf-bluesky.js           🦋 Native Bluesky feed (AT Protocol)
│   ├── vibelyf-mastodon.js          🐘 Native Mastodon feed (fediverse)
│   ├── vibelyf-lemmy.js             🐭 Native Lemmy feed (open communities)
│   ├── vibelyf-cloud.js             Supabase auth/DB
│   ├── vibelyf-profile.js           User profile system
│   ├── vibelyf-tabs.js              Hover-reveal tab system
│   └── (more)
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
| [`js/vibelyf-tabs.js`](js/vibelyf-tabs.js) | 29KB | Hover-reveal tab system v2.0 |
| [`js/cultural-vocabulary-master.js`](js/cultural-vocabulary-master.js) | 185KB | 453-term vocabulary database |
| [`SAVE_STATE.md`](SAVE_STATE.md) | 13KB | Architecture map for AI agents |

> 💡 **Note:** `css/red-glassmorphism.css` is a legacy filename — the file actually contains the *blue* design system (v2.1). It will be renamed in a future cleanup.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, ES6+ JavaScript (no transpilation, no build step) |
| **API proxy** | Cloudflare Workers (`worker/`) — holds all provider keys, CORS allow-list, per-IP rate limiting |
| **AI Code Gen / API Gen / Image Forge** | Claude Sonnet 4.6 via Worker (`/api/llm/codegen`, `/api/llm/api-gen`) — prompt caching on the cultural vocabulary; multimodal image input supported |
| **AI Fast-Brain (slang)** | Groq Llama 4 Scout → Groq Llama 3.3 70B → Cerebras failover via Worker (`/api/llm/slang`) |
| **Social embeds** | Worker `/api/embed` oEmbed proxy (X, TikTok, Reddit, YouTube, more) |
| **Native social feeds** | Bluesky (AT Protocol), Mastodon, Lemmy — public APIs, no keys, rendered as native VibeLyf cards |
| **Voice** | Web Speech API |
| **Analytics** | PostHog (opt-in via the consent banner; off by default) |
| **Auth/DB** | Supabase (email auth live; OAuth pending) |
| **Hosting** | Cloudflare Pages (SPA) + Cloudflare Workers (API) |
| **PWA** | manifest.json + service worker (same-origin cache only) |
| **Compliance** | Age gate, cookie consent, AI-disclosure labeling, `/privacy` policy, Do-Not-Sell controls |
| **Styling** | CSS custom properties (`css/vibelyf.css` graffiti design system) + Tailwind via CDN in generated apps |

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

[MIT](LICENSE) © 2026 VibeLyf

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
