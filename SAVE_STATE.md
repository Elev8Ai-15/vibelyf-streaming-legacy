# 💾 VibeLyf — SESSION SAVE STATE (canonical)

> **Last updated:** June 12, 2026
> **This file is the canonical project-state doc.** It lives in the repo on purpose —
> earlier external handoff notes (in `my-assistant/`) were lost to a folder
> reorganization. Keep state HERE, with the code.

---

## 🚀 Quick start for a new session

> Read `SAVE_STATE.md`, `README.md`, and `worker/README.md`. The SPA is `index.html`
> (~9,000 lines, vanilla, no build step) + `js/` modules. The Worker API proxy is
> `worker/` (Cloudflare Workers). Deploy SPA ONLY via `./deploy-pages.sh`;
> deploy Worker via `cd worker && npx wrangler deploy`. `CLOUDFLARE_API_TOKEN` is in `.env`.

## 🌍 Live surfaces

| Surface | URL |
|---|---|
| SPA (Cloudflare Pages) | https://vibelyf.pages.dev |
| Worker API | https://vibelyf-api.bradgpowell1123.workers.dev |
| Supabase | https://zcnvqgtjljqzzkhhvwhg.supabase.co — **⚠️ PAUSED (NXDOMAIN as of 2026-06-12)**. Free-tier inactivity pause. Brad must Restore in the Supabase dashboard; until then SPA auth + the durable rate-limit layer are inactive. |
| GitHub | https://github.com/Elev8Ai-15/vibelyf-streaming-legacy (rename to `vibelyf` pending, task #23) |
| vibelyf.com | NOT bound yet (task #24 — Brad must add the zone to Cloudflare + switch registrar nameservers; then bind via API) |

## 🏗️ Architecture (June 2026)

- **All LLM calls go through the Worker** (`/api/llm/codegen|api-gen|slang`). Keys live in CF
  secrets only — nothing in the browser. Single override point: `window.VIBELYF_WORKER_API`
  (set in index.html before module scripts).
- **codegen = Claude Sonnet 4.6** (`worker/src/routes/codegen.js`). It accepts the Gemini-native
  `{contents:[{parts}]}` shape AND translates `inline_data` images → Claude image blocks
  (Image Forge multimodal works through it). Gemini was dropped: Google DENIED the GCP project
  (403 PERMISSION_DENIED, May–June 2026). `api-gen` = Claude + 30KB cached vocab prompt.
  `slang` = Groq Llama-4-Scout → Groq 3.3-70B → Cerebras failover. `embed` = 9-platform oEmbed proxy.
- **CORS**: strict allow-list in `worker/wrangler.toml` `ALLOWED_ORIGINS` — includes
  `vibelyf.pages.dev`. When vibelyf.com binds, it's already listed.
- **Native open-social feeds (Phase 2.B)** — no auth, no keys, all verified live:
  - 🦋 `js/vibelyf-bluesky.js` — AT Protocol public AppView (`public.api.bsky.app`)
  - 🐘 `js/vibelyf-mastodon.js` — Mastodon REST per-instance (`user@instance` handles)
  - 🐭 `js/vibelyf-lemmy.js` — Lemmy (`community@instance`). Reddit's free API is DEAD (403) — Lemmy replaced it.
  - All three: VibeLyf-styled `.vl-card` rendering into `#main-content`, user add/remove
    (validated + strict charset), localStorage persistence, curated default seeds.
  - Walled gardens (FB/IG/X/...) = single-post embeds via Worker `/api/embed` + new-tab launchers.
  - 🌐 **Unified feed** (`js/vibelyf-unifeed.js`) — the left-nav "All Feeds" merges all three
    networks into ONE time-sorted stream with per-network corner badges + persisted toggle
    pills; walled-garden launcher grid below it. Reuses each module's fetch/renderCard.
  - Embed route SSRF-audited: Worker only fetches fixed oEmbed endpoints (user URL is an
    encoded param, never fetched directly) + per-platform URL validators. Clean.
- **Compliance (Phase 1.I, for Aug 2 2026 deadline)** — age gate, privacy-first cookie banner,
  AI-disclosure badge on generated artifacts (`js/vibelyf-app-renderer.js` header),
  persistent Do-Not-Sell links, DSAR modal, full policy at `/privacy` (`privacy.html`).
  Controller: `window.VibeLyfCompliance` (inline script at the end of index.html).
- **Service worker (`sw.js`)** — intercepts SAME-ORIGIN GETs only (cross-origin feed APIs go
  straight to network; this was a stale-feed bug, fixed). **Bump `CACHE_NAME` on EVERY deploy
  that changes JS/CSS** or returning visitors get stale assets. Current: `vibelyf-v2026.06.05b`.
- **Image Forge** (`js/vibelyf-image-forge-engine.js`) — Worker-backed, `isReady()` always true,
  single call (failover is server-side). Multimodal image uploads work.
- **Rate limiting (live, verified)** — layered per-IP limits on paid routes: 10/min on
  codegen+api-gen, 60/min on slang/embed. Working layer = Cache-API per-colo counter;
  Supabase `rate_limits` counter takes over on heavy routes automatically once the project
  is restored; native CF `[[ratelimits]]` bindings are wired but verified NON-enforcing on
  this plan; in-memory window is the last resort. `/api/health` exposes `rate_limiter` state.
  429s carry `Retry-After`.

## ⚠️ Operating rules learned the hard way

1. **Deploy Pages ONLY via `./deploy-pages.sh`** — an incrementally-patched temp staging dir got
   purged by Windows mid-session and a deploy shipped WITHOUT index.html (live 404, ~10 min outage,
   June 12). The script rebuilds staging fresh and sanity-gates on index.html.
2. **Bump `sw.js` CACHE_NAME with every asset deploy** — stale-while-revalidate means returning
   visitors are otherwise one version behind.
3. **Old git history (commits `b2082aa`–`465aa4c`) contains DEAD hardcoded API keys** — both
   verified revoked; GitHub flagged them; acceptable, or clean with `git filter-repo`.
4. **Live-verify provider model IDs** — `gemini-3.5-flash` (dots), Groq has Scout not Maverick.

## 📋 Open tasks

| # | Task | Blocked on |
|---|---|---|
| — | **Restore the paused Supabase project** (zcnvqgtjljqzzkhhvwhg) | **Brad**: supabase.com dashboard → Restore. Re-enables SPA auth + durable rate limits. Consider a weekly keep-alive ping to prevent re-pausing. |
| 24 | Bind vibelyf.com to Pages + Worker | **Brad**: add zone to CF, switch nameservers at registrar |
| 23 | Rename repo → `vibelyf` | **Brad**: fine-grained PAT w/ admin scope |
| 15 | Google + GitHub OAuth in Supabase | ~15 min console work each |
| 26 | Meta App Review (FB/IG/Threads embeds) | Brad: create Meta app, weeks-long review |
| 28 | Discord WidgetBot | Needs a VibeLyf Discord server first |
| 29 | Cursor SDK + v0 API in Build tab | ~6–8 hr build |
| — | ElevenLabs TTS + fal.ai image routes; per-user rate limiting + JWT verify (`worker/src/lib/auth.js` is a stub) | keys / Supabase wiring |
| — | Bluesky seeds: swap in Brad's own handle when he makes an account | Brad |
| — | Cosmetic: index.html diagnostic string still says "Image Forge (Gemini Multi)" | trivial |

## 🤖 Verified model stack

codegen/api-gen: `claude-sonnet-4-6` (Anthropic, prompt caching on the 535-term vocab).
slang: `meta-llama/llama-4-scout-17b-16e-instruct` (Groq) → `llama-3.3-70b-versatile` (Groq) → `llama-4-scout` (Cerebras).
