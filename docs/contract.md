# Contract v1
Canonical schemas and the supported validator vocabulary live in src/lib/schema.ts. The app uses the same validation function embedded into the workflow export. Run npm run contract:export after changing it; npm run contract:check detects drift.
- campaign-brief.schema.json describes normalized input. The UI additionally accepts comma-separated channels and trims input text before validation.
- campaign-plan.schema.json describes output. All required strings are nonblank; arrays contain at least one item, with exactly three messaging angles and seven content rows. Unknown fields are rejected. Landing outlines have no fixed count beyond nonempty.
- Optional sourceMaterial may be blank or omitted. Required constraints must have at least eight trimmed characters.
- Low confidence is a valid output; approval requires an explicit acknowledgment and note.

Request: { contractVersion: 1, briefId, attemptId, brief, revisionInstructions? }.
Success: { ok: true, contractVersion: 1, briefId, attemptId, plan }.
Failure: { ok: false, contractVersion: 1, briefId, attemptId, error: { code, message } }.
Refusal, incomplete, invalid_json, invalid_plan, http_error, provider_error, transport_error and timeout all fail generation. Authentication errors can be returned directly by n8n before an envelope exists.
Raw Responses output is traversed across message content; a refusal is not parsed as a plan. One completed structured text payload is required and fully validated.

Sources: [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs), [n8n HTTP Request](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest), [Webhook authentication](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook).
