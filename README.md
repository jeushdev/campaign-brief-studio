# Campaign Brief Studio

An AI automation portfolio demo that transforms a structured marketing brief into a validated, reviewable campaign draft. It is not a chatbot: validation, webhook orchestration, strict output checks, activity history, and human decisions are workflow states.

## Setup
```powershell
cd C:\Users\jeush\Documents\02_Projects\ai-automation\campaign-brief-studio
npm install
Copy-Item .env.example .env.local
npm run dev
```
Open `http://localhost:3000`.

## Modes
Without `N8N_WEBHOOK_URL`, a clearly labelled local demo generator creates draft output and persists it to `data/briefs.json`. It exercises the end-to-end UI but is not an LLM integration. With the webhook configured, the app posts server-side to n8n and rejects output that fails the campaign-plan contract. Local storage uses serialized atomic writes and surfaces corruption or permission failures; it is suitable for one persistent Node host only.

## Real n8n/OpenAI flow
Import `n8n/campaign-brief-studio.json`; configure n8n Header Auth for `x-campaign-webhook-secret`, set n8n `OPENAI_API_KEY` and `OPENAI_MODEL`, activate the workflow, then set its production URL as `N8N_WEBHOOK_URL` in `.env.local`. The workflow uses strict structured outputs and validates refusal, incomplete, malformed, and incomplete-plan responses before returning. No key is ever exposed to browser code. Public deployment still requires authenticated transactional storage as documented in the architecture notes.

See [architecture](docs/architecture.md), [safety](docs/ai-safety-and-limitations.md), [demo script](docs/demo-script.md), and [testing checklist](docs/testing-checklist.md).
