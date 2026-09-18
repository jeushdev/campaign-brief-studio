# Campaign Brief Studio
A local campaign-planning MVP with validated drafts, revision history, SQLite transactions, and explicit human review.

## Run locally
Requires Node 22.20+ and npm. A single machine with persistent disk is supported.
```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```
Open http://127.0.0.1:3000. Both dev and production launch commands bind to loopback. Host checks protect reads; mutations also require matching Origin and an Idempotency-Key. This is an unauthenticated local operator tool. Do not expose it through a public proxy or tunnel; shared/public deployment requires a separate authenticated design.

## Run with Docker
Requires Docker Desktop with Compose.
```powershell
Copy-Item .env.example .env.local
docker compose up --build
```
Open http://127.0.0.1:3000. SQLite data is stored in the named `campaign-brief-data` volume. The Compose port is bound to loopback, and `.env.local` keeps the default deterministic demo mode unless an n8n webhook is configured.

## Modes and storage
Without N8N_WEBHOOK_URL, the deterministic demo generator runs locally. Demo output is not an LLM integration. With a webhook URL, N8N_WEBHOOK_SECRET is mandatory and failures never fall back to demo.
SQLite persists at data/campaign-brief-studio.sqlite (override with CAMPAIGN_DB_PATH). Transactions preserve briefs, input revisions, attempts, plans, operations and activity. No transaction is held during a provider call.
On the first database initialization, a sibling briefs.json is imported if present. Every record is validated; any invalid record aborts the import. Existing plans and activity are preserved, and the original file is retained. Missing files may initialize; corruption, unreadable files and permission failures surface as errors. Stop the app before copying the entire data directory for backup, including any SQLite sidecar files.

## n8n / OpenAI setup
1. Import n8n/campaign-brief-studio.json. It is exported inactive and contains no credentials.
2. On Campaign webhook, select a **Header Auth** credential: header name x-campaign-webhook-secret, value matching the app's N8N_WEBHOOK_SECRET. Authentication must remain enabled; n8n verifies the value before executing the workflow.
3. On OpenAI response, select a **different Header Auth** credential: header name Authorization, value Bearer followed by your OpenAI API key. Never put this key in browser variables.
4. Configure the model in Prepare request (default gpt-4.1-mini). The adapter supports OpenAI; Claude is explicitly unsupported until implemented.
5. Activate the workflow and use its **production** webhook URL as N8N_WEBHOOK_URL. Restart the app.
6. Verify wrong/missing webhook secrets are rejected before a provider call, then submit one synthetic brief. Check that the same attempt returns a validated plan and moves to Needs review.
Changing generated workflow code locally requires updating its source and re-exporting. After re-import, reselect credentials and reapply any deployment-specific model choice.

The workflow uses strict JSON Schema, raw Responses output extraction, explicit refusal/incomplete/error handling, and a 35-second provider timeout. The app has a 45-second webhook deadline and validates the contract version, brief ID, attempt ID and complete plan again. Live credential-based success has not been verified by local tests.

## Workflow
- Submitted → Generating → Needs review; failure → Failed.
- Failed → Generating is an explicit retry of the same input revision.
- Needs review → Approved, Rejected, or Revision requested.
- Revision requested → Submitted → Generating saves edited inputs and instructions as a new revision.
- Approved and Rejected are terminal. Revision/rejection require notes. Low-confidence approval additionally requires acknowledgment and a note.
- In-progress attempts expire after two minutes and become explicitly retryable. Old callbacks cannot complete or fail newer attempts.
- Each mutation requires an idempotency key. Repeating the same key/payload replays the operation; changing its payload returns a conflict. Reviews/retries/revisions also require the current brief version.
No authenticated identity is recorded; caller-supplied reviewer headers are ignored.

## Verification
```powershell
npm run typecheck
npm run lint
npm test
npm run contract:check
npm run build
npm run test:production
```
The production smoke test uses an isolated temporary database, a loopback production server, and a simulated webhook executing the exported code. It checks freshness, decisions, revisions, failure/retry, concurrency and access guards without rebuilding. It is **not** a real n8n/OpenAI round trip.

See [architecture](docs/architecture.md), [contract](docs/contract.md), [verification checklist](docs/testing-checklist.md), [demo](docs/demo-script.md), and [limitations](docs/ai-safety-and-limitations.md).
