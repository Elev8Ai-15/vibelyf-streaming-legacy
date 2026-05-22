# Contributing to VibeLyf

First off — thanks for considering contributing! VibeLyf is an AI-powered social creation platform built around **linguistic diversity as a bridge to tech literacy**. Contributions of all kinds are welcome.

---

## 🌟 Ways to Contribute

| Type | Examples |
|---|---|
| 🐛 **Bug Reports** | Open an issue with reproduction steps |
| 💡 **Feature Ideas** | Open a discussion or issue tagged `enhancement` |
| 📚 **Cultural Vocabulary** | Add slang/dialect terms to `js/cultural-vocabulary-master.js` |
| 🎨 **Design** | Improve the Blue Glassmorphism design system in `css/` |
| ⚡ **Code** | Fix bugs, improve performance, refactor inline JS |
| 📖 **Docs** | Improve `README.md`, add tutorials |
| 🌍 **Translations** | Multi-language support for the UI |

---

## 🚀 Getting Started

### 1. Fork & Clone
```bash
git clone https://github.com/YOUR_USERNAME/vibelyf.git
cd vibelyf
```

### 2. Run Locally
No build step required — it's a static site.
```bash
# Python 3
python3 -m http.server 8000

# Or with Node
npx serve .
```
Open http://localhost:8000

### 3. Make Your Changes
- Keep PRs focused (one feature/fix per PR)
- Match the existing code style
- Test in Chrome, Firefox, Safari before submitting
- Update `README.md` if you change user-facing behavior

### 4. Submit a Pull Request
- Reference any related issue (`Closes #123`)
- Describe what you changed and why
- Include screenshots for UI changes

---

## 📋 Code Style

- **HTML**: Semantic tags (`<header>`, `<nav>`, `<main>`, `<section>`), meaningful IDs, shallow DOM nesting
- **CSS**: Use the CSS custom properties in `css/red-glassmorphism.css` (note: the file contains the *blue* design system — legacy filename)
- **JavaScript**: ES6+, no transpilation; use modules where possible; prefer `const`/`let` over `var`
- **Naming**: Use descriptive class names (`product-card` not `box`)

---

## 🧭 Architecture Quick Reference

| File | Purpose |
|---|---|
| `index.html` | Main SPA (~421KB) with inline JS |
| `css/red-glassmorphism.css` | Blue Glassmorphism v2.1 design system |
| `js/cultural-vocabulary-master.js` | 453-term cultural database |
| `js/linguistics-engine-v32.js` | 16 vibe archetypes → CSS |
| `js/vibelyf-tabs.js` | Hover-reveal tab system |
| `SUPABASE_SETUP.sql` | Database schema |

See `SAVE_STATE.md` for the full architecture map.

---

## 🚫 What NOT to Commit

- ❌ API keys (Gemini, Claude, Groq, Supabase) — use `.env` or browser localStorage
- ❌ Personal data
- ❌ Backup HTML files (`*-BACKUP-*.html`) — already in `.gitignore`
- ❌ Session notes / status reports (keep working notes local)

---

## 📜 Code of Conduct

Be respectful. VibeLyf celebrates linguistic diversity and aims to be a welcoming space for builders of all backgrounds. Discriminatory language, harassment, or gatekeeping will not be tolerated.

---

## ❓ Questions?

Open a [discussion](https://github.com/YOUR_USERNAME/vibelyf/discussions) or reach out via the issue tracker.

**Built with ❤️ and 453 slang terms.**
