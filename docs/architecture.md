# Architecture
```mermaid
flowchart LR
 U[Reviewer]-->A[Next.js validation]-->S[Local store or Supabase]
 A-->W[n8n webhook]-->L[OpenAI structured JSON]-->V[Schema validation]-->S
 S-->R[Review queue and activity log]-->D[Human decision]
```
The browser calls Next.js only. The route normalizes required inputs, writes a draft, calls the webhook server-side, validates the returned contract, then moves it to **Needs review**. Local JSON is for development; replace `src/lib/store.ts` with a Supabase adapter for production.
