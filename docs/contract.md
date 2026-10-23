# Contract v1

Canonical schemas and the supported validator vocabulary live in `src/lib/schema.ts`. The same validation function is embedded into the workflow export. Run `npm run contract:export` after changing the workflow/schema; `npm run contract:check` detects drift.

- `campaign-brief.schema.json` describes normalized input. The UI additionally accepts comma-separated channels and trims input text before validation.
- `campaign-plan.schema.json` describes output. Required strings are nonblank; arrays contain at least one item, with exactly three messaging angles and seven content rows. Unknown fields are rejected. Landing outlines have no fixed count beyond nonempty.
- Optional sourceMaterial may be blank or omitted. Required constraints must contain at least eight trimmed characters.
- Low confidence is a valid output; approval requires an explicit acknowledgment and note.

Generation request:

```json
{ "contractVersion": 1, "briefId": "...", "attemptId": "...", "brief": {}, "callbackUrl": "http://localhost:3000/api/webhooks/generation-complete", "revisionInstructions": "optional" }
```

n8n Webhook Header Auth requires `x-campaign-webhook-secret` equal to the app's `N8N_WEBHOOK_SECRET`. The workflow validates the request/schema, requires the callback URL to equal its configured `CAMPAIGN_CALLBACK_URL` and permits only the fixed generation callback path on localhost, 127.0.0.1, [::1], host.docker.internal or campaign-brief-studio with an optional valid port. No credentials, query, fragment, alternate route or redirect destination is allowed. Set this n8n environment variable to the app-generated URL and ensure the deployment permits the workflow's `$env` lookup. Missing or incompatible destination configuration fails the workflow before calling Groq. The app's `APP_URL` must be a local origin without a trailing slash or path.

n8n responds to dispatch immediately; that acknowledgment is not a completed plan. It later posts exactly one of these envelopes to the app:

```json
{ "ok": true, "contractVersion": 1, "briefId": "...", "attemptId": "...", "plan": {} }
```

```json
{ "ok": false, "contractVersion": 1, "briefId": "...", "attemptId": "...", "error": { "code": "provider_error", "message": "Provider reported an API error." } }
```

Callbacks require `x-campaign-callback-secret` equal to `N8N_CALLBACK_SECRET`, a distinct high-entropy value (recommended at least 32 random characters). Configure this in a separate n8n Callback result Header Auth credential. Callback secrets are never sent in the request body. Missing webhook-mode configuration returns 503; missing/incorrect callback authentication returns 401. Authentication is checked before body parsing. Invalid JSON returns 400; bodies over 256 KiB return 413; incompatible versions, missing/extra fields, mixed success/error objects and invalid plans return 422. IDs must be nonblank strings of at most 200 characters; error code/message are nonblank strings of at most 100/8000 characters. Every invalid envelope leaves storage unchanged.

Valid current results return `{ "ok": true, "disposition": "applied" }`. Expected unknown, duplicate, expired or superseded results return `{ "ok": true, "disposition": "ignored_stale" }` without changing the current attempt. Unexpected store errors log the failure and return 500. The callback node retries failed delivery up to three times with a 10-second request timeout and redirects disabled. Exhaustion fails the n8n execution; there is no durable callback queue. A missing result becomes retryable after the existing 120-second attempt expiry. Unconfirmed dispatch transport errors wait for that result/expiry instead of preventing a late valid callback.

Groq chat-completion parsing requires one choice, `finish_reason: stop`, JSON message content and a fully validated plan. Refusal, incomplete, invalid_json, invalid_plan, http_error, provider_error, transport_error and timeout all produce failure envelopes. n8n webhook authentication/invalid-request failures may happen before an envelope exists. Only Groq is implemented; its `openai/gpt-oss-120b` model uses a Groq API key.

References checked during implementation: [Groq Structured Outputs](https://console.groq.com/docs/structured-outputs), [n8n HTTP Request](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest), [n8n Webhook](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook), [n8n error handling](https://docs.n8n.io/build/flow-logic/handle-errors-gracefully.md). These references inform configuration; fixture tests do not prove a live connection.
