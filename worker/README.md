# VibeLyf API Worker

Cloudflare Workers proxy in front of every LLM provider VibeLyf uses. Hides
API keys, enables Anthropic prompt caching on the 535-term cultural
vocabulary (~70-90% cost reduction), and handles Groq → Cerebras failover
when the primary fast-brain rate-limits.

This subfolder is its own deployable unit — the static SPA at the repo root
keeps shipping to Cloudflare Pages, and this Worker ships separately to
Cloudflare Workers, bound to `vibelyf.com/api/*`.

---

## Architecture

```
Browser (vibelyf.com)
      │
      │ POST /api/llm/codegen, /api/llm/api-gen, /api/llm/slang, …
      ▼
Cloudflare Workers (this project)
      │
      │ (server-side, with secrets in CF encrypted store)
      ▼
Gemini · Claude · Groq · Cerebras · (later: ElevenLabs · fal.ai)
```

Why a Worker and not browser-direct provider calls:

1. **No leaked keys.** The Genspark export shipped with hardcoded `sk-ant-*`
   and `AIzaSy*` keys. Keys live in CF's encrypted store now and never reach
   the browser.
2. **Anthropic prompt caching.** The 535-term cultural vocabulary (~180KB)
   goes in the system prompt once. First call writes the cache (1.25× input),
   subsequent calls within 5 min TTL read at 0.1× input (90% discount).
3. **Cross-provider failover.** Groq 429? Worker retries on Cerebras
   automatically. Browser sees one stable endpoint.
4. **CORS.** Claude's API blocks browser-direct calls by CORS. Worker fixes that.
5. **Per-user rate limiting.** Phase 1.H part 2 wires this against the
   Supabase `rateLimits` table.

---

## Routes

| Method | Path | Provider | Notes |
|---|---|---|---|
| `GET`  | `/api/health` | — | Liveness + which provider keys are configured |
| `POST` | `/api/llm/codegen` | Gemini 3.5 Flash | Code generation. Falls back through 3.1 Pro → 2.5 Flash → 2.5 Pro on 5xx. |
| `POST` | `/api/llm/api-gen` | Claude Sonnet 4.6 | API/schema generation with cached vocab system prompt. |
| `POST` | `/api/llm/slang` | Groq Llama 4 Maverick | Slang detection / intent classification. Failover: Groq Scout → Cerebras Scout. |

See each `src/routes/*.js` file for the request/response shape.

Response envelope is consistent across all routes:

```json
{ "success": true, "data": { ... }, "meta": { "provider": "...", "model": "...", "elapsed_ms": 123 } }
```

Error envelope:

```json
{ "success": false, "error": { "code": "UPSTREAM_ERROR", "message": "..." }, "meta": { ... } }
```

---

## Local development

```bash
cd worker
npm install
cp .dev.vars.example .dev.vars
# edit .dev.vars and paste your dev API keys (do NOT commit this file)
npm run dev
```

Wrangler starts the Worker at `http://127.0.0.1:8787`. Hit it with:

```bash
curl http://127.0.0.1:8787/api/health
curl -X POST http://127.0.0.1:8787/api/llm/codegen \
     -H "Content-Type: application/json" \
     -d '{"prompt": "build me a quick to-do list app"}'
```

The dev server hot-reloads on file changes.

---

## Production deploy

One-time setup:

```bash
cd worker
npx wrangler login                                     # opens browser, OAuth into Cloudflare
npx wrangler secret put GEMINI_API_KEY                 # paste when prompted
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put GROQ_API_KEY
npx wrangler secret put CEREBRAS_API_KEY
```

Deploy:

```bash
npm run deploy
```

After the first deploy:

1. Cloudflare dashboard → Workers & Pages → `vibelyf-api` → **Triggers**
2. Add a **Route**: `vibelyf.com/api/*` → zone `vibelyf.com`
3. Confirm DNS / Pages app still serves everything else

To watch live request logs:

```bash
npm run tail
```

---

## Updating provider model IDs

Model IDs are constants in `src/providers/<provider>.js`:

```js
export const GEMINI_MODELS = { primary: 'gemini-3-5-flash', fallbacks: [...] };
export const ANTHROPIC_MODELS = { primary: 'claude-sonnet-4-6' };
export const GROQ_MODELS = { primary: 'llama-4-maverick', fallback: 'llama-4-scout' };
export const CEREBRAS_MODELS = { primary: 'llama-4-scout' };
```

When a new model ships, edit the constant and redeploy. Browser code doesn't
need to know — the route URL stays the same.

---

## Updating the cultural vocabulary

The vocab in `src/data/vocab.js` is a copy of `js/cultural-vocabulary-master.js`
from the SPA, with the `window.X = {...}` wrapper rewritten as
`export const VOCAB = {...}`. To refresh:

```bash
cp ../js/cultural-vocabulary-master.js src/data/vocab.js
sed -i 's/^window\.culturalVocabularyMaster = /export const VOCAB = /' src/data/vocab.js
sed -i '/^window\.searchVocabulary = window\.culturalVocabularyMaster\.searchVocabulary\.bind/,$d' src/data/vocab.js
```

Then redeploy. The first request after a vocab change pays the cache-write
cost (1.25× input); the next call (within 5 min) is back at 0.1× input.

**Important:** any change to `vocab-prompt.js`'s serializer invalidates the
cache for ALL requests. The serializer is intentionally deterministic; keep
it that way.

---

## Phase 1.H part 2 (not built yet)

- `POST /api/voice/tts` → ElevenLabs Conversational v2
- `POST /api/image/gen` → fal.ai router (Flux 1.1 Pro / Ideogram 3 / Recraft V4 / Nano Banana Pro)
- Per-user rate limiting against Supabase `rateLimits` table (requires Phase 1.D)
- Real JWT verification in `src/lib/auth.js` (requires Phase 1.D)
- Browser-side cutover: refactor `multi-llm-orchestrator.js` + provider modules
  to call `/api/llm/*` instead of provider URLs directly

---

## File layout

```
worker/
├── package.json              # wrangler dev dep + scripts
├── wrangler.toml             # name, main, vars, compatibility_date
├── .dev.vars.example         # template for local secrets (real .dev.vars is gitignored)
├── .gitignore                # excludes .dev.vars, .wrangler/, node_modules/
├── README.md                 # ← this file
└── src/
    ├── index.js              # entry — routes pathname to handler
    ├── lib/
    │   ├── cors.js           # CORS allow-list + preflight
    │   ├── response.js       # JSON envelope helpers
    │   └── auth.js           # Supabase JWT verify (stub until Phase 1.H part 2)
    ├── routes/
    │   ├── health.js
    │   ├── codegen.js
    │   ├── api-gen.js
    │   └── slang.js
    ├── providers/
    │   ├── gemini.js
    │   ├── anthropic.js
    │   ├── groq.js
    │   └── cerebras.js
    └── data/
        ├── vocab.js          # 185KB extracted vocab, ES module
        └── vocab-prompt.js   # deterministic serializer for prompt caching
```

---

## Costs

Workers Free plan: 100,000 requests/day, 10ms CPU per request. Adequate for
the alpha; bump to Workers Paid ($5/mo) before public launch for:
- Higher CPU limit (50ms/request → enough headroom for the JSON parsing
  on large vocab payloads)
- Durable Objects (Phase 3 — live chat + WebSocket)
- 10MB script size (vs 1MB) — keeps the vocab + a couple more features safe

Provider costs are the real bill. Anthropic prompt caching is the headline
optimization: the same vocab system prompt costs 0.1× input price on a
cache hit, so high-frequency users effectively get a 90% discount.
