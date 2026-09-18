# Verification checklist
## Local automated checks
- typecheck, lint, unit tests, generated-contract drift check, production build.
- Wrong input types, null/non-object input, blank nested fields, unknown fields, empty sections, exact counts.
- Transaction rollback, cross-process duplicate creation, stale callbacks/decisions, low-confidence approval, atomic legacy import with plans preserved.
- Raw Responses success/refusal/incomplete/errors/timeouts/malformed output; exported n8n code execution and envelope validation.
- Production smoke: create → revision request → edited resubmit → approve/reject; webhook failure → retry; parallel duplicate mutation; fresh lists after each mutation without rebuild; same-origin/Host guards.
- Browser controls release after HTTP, unreadable-response and network errors; uncertain submissions replay the original request.

## Configured integration checks (not replaced by fixtures)
- Bind distinct webhook and OpenAI Header Auth credentials; activate the imported workflow.
- Missing and incorrect webhook secrets must fail before OpenAI is invoked.
- Send a synthetic brief from the app through the production webhook and inspect matching brief/attempt IDs, current plan, status and activity.
- Exercise controlled provider error/refusal/incomplete/timeout paths without claiming unobserved real failures.
- Confirm revised input and instructions reach the provider.
Never label fixture execution as a live n8n or OpenAI success.
