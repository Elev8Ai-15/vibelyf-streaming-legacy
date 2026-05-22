# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 2.1.x (current) | ✅ |
| < 2.0 | ❌ |

---

## 🔒 Reporting a Vulnerability

If you discover a security vulnerability in VibeLyf Nation, please **do not** open a public issue. Instead:

1. Email the maintainers (replace with your contact): `security@vibelyf.example.com`
2. Include:
   - A clear description of the vulnerability
   - Steps to reproduce
   - Affected files/components
   - Potential impact
3. Allow up to **72 hours** for an initial response

We'll work with you to verify, fix, and (with permission) credit you in the release notes.

---

## ⚠️ Known Security Considerations

VibeLyf is a **client-side static web app**. Users should be aware:

### API Keys
- API keys (Gemini, Claude, Groq, Supabase) are stored in **browser localStorage**
- Keys are visible to anyone with access to the user's browser
- **Future fix:** Proxy all LLM calls through a Cloudflare Worker (see roadmap Phase 2)

### Third-Party Embeds
- VibeLyf embeds platforms via iframe (YouTube, Spotify, SoundCloud, etc.)
- We do not control content served from embedded sources
- All non-embeddable platforms (Instagram, X, Facebook, etc.) open in **new tabs**, not iframes

### User-Generated Content
- Currently no UGC system is live — pure aggregation only
- When the social layer (Phase 3) ships, content moderation (OpenAI Moderation API + Perspective) will be enforced before posting

### CORS
- API Generator and Code Generator use Gemini's public API (CORS-safe)
- Claude fallback may fail in some browser/extension environments due to CORS

---

## 🛡️ Best Practices for Self-Hosters

If you fork VibeLyf to run your own instance:

- ✅ Set strict Content-Security-Policy headers on your server
- ✅ Never commit API keys to git (`.env` is in `.gitignore`)
- ✅ Enable Supabase Row-Level Security (RLS) on all tables (see `SUPABASE_SETUP.sql`)
- ✅ Add rate limiting at the edge (Cloudflare / Vercel)
- ✅ Run `npm audit` regularly if you add a build engine

---

## 📚 Disclosure Policy

- We follow **coordinated disclosure**
- Critical vulnerabilities will be patched and disclosed within 30 days
- Researchers acting in good faith will be credited

Thank you for helping keep VibeLyf Nation secure! 🛡️
