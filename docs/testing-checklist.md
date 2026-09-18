# Testing checklist
- Missing inputs return 422 and field errors.
- Malformed LLM output creates Failed.
- Webhook failure creates Failed and an activity entry.
- Retrying after correction preserves activity.
- Approval and revision notes are logged.
- Before public deployment, replace local storage with authenticated Supabase ownership and RLS.
