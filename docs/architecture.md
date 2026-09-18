# Architecture
Browser → loopback Next.js routes → transactional SQLite → server-side n8n call → validated result → review.
SQLite uses WAL, full synchronization, foreign keys, a busy timeout and immediate write transactions. Each request operates against a current brief version; generation callbacks also require the active attempt and revision. Unique operation keys prevent duplicate creation/generation. Plans and input revisions are retained as history; new attempts clear the current-plan pointer.
Briefs, revisions, attempts, plans, activities and operation receipts commit together. HTTP/provider calls occur outside transactions. The app validates on input, generation completion and review; stored malformed data is rejected rather than silently replaced.
Dashboard, review and detail routes are request-rendered. Client navigation refreshes after mutations.
The local access boundary consists of loopback binding, Host checks, same-origin mutations and no permissive CORS. It does not identify users or protect against other software running as the same local user. Shared/public hosting, multiple machines sharing a file, and serverless/ephemeral disks are outside scope.
Provider adapters live in src/lib/provider-contract.ts. Only OpenAI is implemented. n8n credentials stay in n8n; the app holds only its webhook URL and shared secret.
