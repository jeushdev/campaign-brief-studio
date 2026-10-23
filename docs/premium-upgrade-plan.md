# Campaign Brief Studio — premium upgrade implementation plan

Date: 2026-10-23

Status: Local implementation and portfolio package completed overnight on 2026-10-24 after the authorized second pass. Automated checks, isolated production smoke, browser acceptance, and independent correctness/visual review passed within the observed scope. User/device/assistive-technology, comprehensive accessibility/performance, live-provider, Docker, and deployment evidence remains pending as recorded in `docs/testing-checklist.md`. The user delegated design decisions; that delegation does not establish those external acceptance results. See `docs/design-direction.md` for the second-pass decisions.

Baseline: `334ab7c` on `main`, initially clean working tree.

## 1. Product outcome

Build a polished campaign-planning workspace for small marketing teams, with a guided portfolio demonstration. The user confirmed this audience on 2026-10-23. The existing application remains a local, single-operator tool until a separately scoped shared-deployment milestone adds identity and authorization.

The core journey is **brief → generate → inspect → revise → approve → export**. A first-time visitor should understand this journey immediately, and a returning operator should find the next task quickly.

The recommended experience is a calm creative studio: the campaign document leads; navigation, controls, and technical detail support the work. Its distinctive moment is reviewing the original brief alongside the resulting strategy, then seeing a deliberate review decision recorded in history.

“Premium” is an acceptance standard covering visual craft, useful behavior, accessibility, reliability, and presentation. It is not a claim that aesthetic quality can be guaranteed by a checklist.

### Scope

- Redesign all five existing routes and their meaningful states.
- Preserve validated inputs, structured plans, human review, revision history, idempotency, and stale-result protection.
- Improve brief creation, plan readability, queue navigation, export, and recovery behavior.
- Package a believable demonstration using fictional businesses and truthful mode labels.
- Resolve confirmed workflow and documentation gaps needed for a trustworthy showcase.
- Retain Next.js, React, TypeScript, SQLite, and the existing n8n/Groq contract initially. No framework or database migration is justified by the visual brief.

### Deferred scope

Billing, organizations, real-time collaboration, multi-tier approvals, CRM integrations, research connectors, asset uploads, additional AI providers, and automatic publication are separate product decisions. Dark mode follows a complete light-mode experience if it adds value. Public deployment requires a separate approval after the hosting and data model are concrete.

## 2. Evidence from this checkout

| Area | Observed baseline | Consequence for the upgrade |
| --- | --- | --- |
| Application shell | Dark 250px sidebar, no current-route treatment, generic page and panel hierarchy | Establish a lighter shell, clear location, and consistent actions |
| Dashboard | Three totals and a recent-brief table; no search, filters, or sorting | Prioritize work requiring action and make campaigns easy to locate |
| Brief form | Six short text inputs plus channels, constraints, and context; one dense form | Group related questions, improve guidance and error recovery |
| Review screen | Inputs occupy a fixed 280px column beside a long plan; decisions follow the entire document | Give the plan more space, add section navigation and accessible review controls |
| Responsive behavior | At the observed viewport of roughly 811px, the desktop shell remains active and severely compresses the plan; horizontal overflow is visible | Choose breakpoints from content fit; test the boundary on both sides |
| Feedback | Three-second generation polling already exists | Improve its visible feedback and resilience rather than rebuild it as a missing feature |
| Review recovery | Uncertain review retries already preserve the selected decision | Keep the behavior and verify it through the redesigned controls |
| Export | Approved plans can be copied as Markdown; button says export, no file is downloaded, clipboard failures are unhandled | Distinguish copy from download and provide recovery |
| Provider truth | Runtime adapter/workflow use Groq; settings and some docs still say OpenAI | Make UI, examples, workflow notes, and docs agree with current behavior |
| Callback trust | Callback route does not authenticate callers or check contract version | Harden before allowing shared or externally reachable live operation |
| Showcase access | Host boundary restricts access; SQLite is local; no accounts | Design a separate safe portfolio demonstration rather than exposing the operator app |
| Historical audit | Some listed gaps are already fixed: asynchronous callbacks, polling, decision retry, basic export, Compose volumes/networking | Reconcile the audit against source; do not implement its roadmap blindly |

Relevant implementation: `src/app`, `src/components`, `src/lib/schema.ts`, `src/lib/sqlite-store.ts`, `src/lib/provider-contract.ts`, `scripts/workflow.ts`, and `src/app/api/webhooks/generation-complete/route.ts`.

### Fresh verification performed for this plan

- `npm run typecheck`: passed.
- `npm run lint`: passed with one existing warning: unused `_mode` in `src/lib/sqlite-store.ts:149`.
- `npm run contract:check`: passed.
- `npm test`: 13 passed, zero failed.
- Browser: viewed the dashboard, completed the brief form with fictional Sample Studio data, and opened the generated Needs review plan. Used temporary SQLite storage outside the repository and blanked the generation webhook URL for that process. The temporary server was stopped afterward.
- Production build, production smoke, comprehensive accessibility checks, mobile/device acceptance, and live n8n/Groq delivery were not run for this planning task.

## 3. Research translated into design decisions

Use Apple's principles as a reference for hierarchy, legibility, and material restraint, adapted to a browser application. Native Apple guidance does not prescribe this web app's layout.

| Reference | Application here |
| --- | --- |
| [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines) | Familiar navigation, legible content, purposeful color, adaptable layouts |
| [Apple typography](https://developer.apple.com/design/human-interface-guidelines/typography) | A small, consistent type hierarchy; readable body copy; controlled line lengths |
| [Apple materials](https://developer.apple.com/design/human-interface-guidelines/materials) | Use depth to distinguish controls from content; keep document surfaces calm and opaque; evaluate subtle translucent navigation only if it improves hierarchy |
| [Linear project organization](https://linear.app/docs/projects) | Adapt its separation of overview, contextual properties, and focused views to campaign work |
| [WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Keyboard operation, semantic structure, contrast, reflow, meaningful errors, visible and unobscured focus |
| [Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds) | Set measurable loading, interaction, and layout-stability targets; distinguish lab evidence from field results |

### Recommended visual direction, pending concept review

- **Palette:** soft neutral workspace, white document surfaces, near-black primary text, restrained blue accent. Semantic amber, red, and green carry actual state, always accompanied by text or symbols.
- **Typography:** a system UI stack for a crisp platform-appropriate feel on Windows and Apple devices. Start with readable 16px body text, smaller secondary metadata, and restrained page headings. Validate density with real plan content.
- **Composition:** quiet navigation rail, compact page toolbar, generous document canvas, and contextual information revealed when needed. Favor alignment and whitespace over nested cards.
- **Components:** consistent buttons, fields, segmented filters, status badges, disclosures, alerts, and menus. Use a single coherent SVG icon family with accessible names where needed.
- **Motion:** brief state transitions and precise hover/press feedback. No artificial generation percentages; show only stages the system actually observes. Respect reduced motion.
- **Identity:** retain Campaign Brief Studio. Use the brief-to-reviewed-plan relationship as the signature interaction. A dedicated logo redesign is optional and outside the initial UI milestone.

The user subsequently delegated visual selection and full implementation. The second-pass review selected the native document workspace composition described in `docs/design-direction.md`; there is no pending concept-selection gate.

## 4. Experience by screen

| Surface | Proposed experience | Key behavior |
| --- | --- | --- |
| Dashboard `/` | Campaign workspace with a clear title, one create action, compact status summary, and a useful campaign list | Search business/objective, filter by real state, sort by update time; distinguish an empty workspace from no matching results |
| New brief `/briefs/new` | Guided single-page brief with sections for business, audience/offer, objective/voice, and channels/guardrails | Keep the existing contract; use textareas for narrative answers and channel chips with custom entries; validate without losing inputs |
| Detail `/briefs/[id]` | Main plan document, collapsible brief context, section navigation, and a review action area | Overview, messaging, landing outline, seven-day schedule, and review considerations remain easy to reach; history is secondary but accessible |
| Review queue `/review` | Focused work list with clear reasons for attention | Separate drafts awaiting a decision from failed generations and requested revisions; use Review, Retry, or Continue revision as appropriate |
| Workflow `/settings` | Honest operational status and concise setup guidance | Separate configured, verified, failed, and unknown states; never show secrets or infer connection health from an environment variable |
| Portfolio entry, route decided in M5 | Short explanation and one-click access to a fictional example or an isolated interactive demo | State demo versus live behavior; reviewers can understand the workflow without configuring n8n |

### Important interaction decisions

1. **Brief entry:** prefer grouped sections over a mandatory wizard initially. Add a sample-fill action that clearly replaces only unsaved form fields. Restore unsent input within the current tab using a versioned session draft; explain local retention and provide clear/reset behavior. This is not a new persisted Draft workflow state.
2. **Errors:** connect messages to fields, focus an error summary or first invalid field, preserve submitted values, and explain what the operator can do next. Preserve the exact pending payload and idempotency key during uncertain retries.
3. **Review:** maintain three explicit decisions. Keep risk/context discoverable; do not imply that opening a section proves it was reviewed. Preserve low-confidence acknowledgment and required notes. Avoid a one-click accidental approval while arranging the decision controls.
4. **Plan navigation:** choose anchored sections or accessible tabs in M0 based on realistic document length. Support direct section links and browser navigation. Keep core review actions reachable without hiding content or keyboard focus under sticky UI.
5. **Revisions:** preserve original inputs, instructions, attempts, and previous plans. Start with a clear revision summary and historical viewer; field-level comparison can follow if testing shows it helps.
6. **Export:** offer Copy Markdown, Download Markdown, and content-calendar CSV. Label the plan version and status in exported material. Preserve the approved-only export rule initially. Handle clipboard denial and correctly escape CSV cells, including spreadsheet formula-like values.
7. **Generation:** distinguish submitting a brief, waiting for a result, failure, expiry, and an uncertain submission. Stop polling after a terminal state and pause unnecessary background refreshes; no fake progress or unverified provider-stage claims.

## 5. Implementation milestones

Execute one coherent milestone at a time. Each has a local Conventional Commit after its relevant checks pass. Implementation approval is separate from this planning task; pushes, external notifications, and deployment require their own authorization.

### M0 — product brief and visual concept

**Work:** Capture confirmed product truth in `PRODUCT.md`; map current routes, states, and recovery paths. Reconcile existing documentation against source. Present a small set of equally developed compositions using the dashboard and campaign review screen, including desktop and mobile structure. Complete the Impeccable direction-selection workflow before UI implementation. Ask the image-comp versus direct-code workflow question when applicable; do not store an unanswered preference.

**Deliverables:** Confirmed product brief, selected visual concept, route/state map, design intent, content fixtures, and implementation acceptance checklist. Record proposed tokens; document the implemented design system in `DESIGN.md` after M1 establishes it.

**Gate:** All five routes and important failure states fit the selected concept. User selection was delegated for this run; independent review of the completed implementation replaces the proposed concept-selection pause.

### M1 — design foundation, application shell, and dashboard

**Work:** Replace compressed global styling with readable tokens and bounded component styles. Build shared typography, spacing, surfaces, controls, focus states, statuses, and feedback. Implement active navigation, skip link, small-screen navigation, and the redesigned campaign list. Add working search/filter/sort and a useful empty state. Write `DESIGN.md` from the implemented system.

**Primary files:** `src/app/globals.css`, `src/components/app-shell.tsx`, `src/components/status.tsx`, `src/app/layout.tsx`, `src/app/page.tsx`, and narrowly scoped reusable components.

**Gate:** Consistent shell across existing routes; dashboard actions work; search/filter/sort compose correctly; keyboard navigation works; no page-level overflow at 360, 390, 768, 800, 811, 1024, and 1440px. Existing campaign data and routes remain usable.

### M2 — guided brief creation and input recovery

**Work:** Implement the grouped form, realistic examples, channel input, inline guidance, validation recovery, tab-local input restoration, sample-fill, and precise submit feedback. Apply the same form behavior to revisions.

**Primary files:** `src/components/brief-form.tsx`, `src/components/use-mutation.ts`, `src/app/briefs/new/page.tsx`, and related form components. Keep schema changes out unless an independently justified requirement appears.

**Gate:** A fictional brief can be completed using keyboard alone; all current validation remains effective; invalid submissions retain input; double activation does not create duplicate briefs; uncertain retry replays the original request; revision context survives recoverable errors. Sample-fill never submits automatically.

### M3 — campaign document, review queue, revisions, and export

**Work:** Implement the document layout and section navigation, readable messaging angles and schedule, contextual brief panel, action area, and history. Improve queue triage. Add reliable copy/download exports and export-specific feedback.

**Primary files:** `src/app/briefs/[id]/page.tsx`, `src/app/review/page.tsx`, `src/components/plan-view.tsx`, `review-controls.tsx`, `retry-control.tsx`, `auto-refresh.tsx`, and `export-controls.tsx`.

**Gate:** Create → review → request revision → resubmit → approve → export works. Rejection remains distinct. Low-confidence safeguards, stale decisions, uncertain retries, historic plans, and failed/expired attempts behave correctly. Seven schedule entries and all required plan sections remain accessible on narrow screens. Clipboard failure and CSV safety have meaningful coverage.

### M4 — operational truth and workflow reliability

**Work:** Reconcile provider labels/docs/node notes. Authenticate callbacks with a dedicated server-side credential; validate contract version and full success/error envelopes before store mutations; retain duplicate/stale handling. Report expected stale callbacks separately from internal store failures. Review callback destination restrictions, request size limits, timeout recovery, and callback delivery failure handling. Keep configured status distinct from tested health. Assess best-effort approval notification honestly; do not add a delivery guarantee without durable delivery state.

**Primary files:** Callback route, `src/lib/webhook.ts`, provider/contract code as needed, `scripts/workflow.ts`, regenerated artifacts, `src/app/settings/page.tsx`, `.env.example`, and existing architecture/testing/safety docs. Load the n8n AI skill before editing AI nodes or provider behavior; consult current official provider/n8n documentation then.

**Gate:** Missing/incorrect callback credentials and incompatible contracts fail without changing data; valid callbacks succeed; duplicate and stale results cannot corrupt the current attempt; failures are observable. All existing automated checks and production smoke pass. Live n8n/Groq acceptance remains a separately recorded result using fictional input and authorized credentials.

### M5 — safe portfolio demonstration and presentation

**Work:** Choose the smallest demonstration architecture that supports the core journey without touching operator data. Recommended starting point: a dedicated client-side fixture-backed demo with per-tab, ephemeral interactions and no provider calls. Confirm this architecture before adding the route. Keep it clearly separate from the SQLite operator application and from the existing `DEMO_MODE` bypass, which is not a public-demo security model.

Create a few fictional examples: a normal campaign, a low-confidence review, and a revision history. Improve deterministic fixture quality so channel and format combinations are coherent and examples demonstrate different strategies. Add a short optional walkthrough, reset behavior scoped to the demonstration, useful metadata/favicon, curated screenshots, and a three-minute case-study script. The portfolio case study explains the problem, workflow, design decisions, architecture, limitations, and observed evidence.

**Gate:** A reviewer can understand the product and complete the example journey without credentials. Demo interactions cannot access operator storage, call paid providers, send Slack messages, or weaken host/origin guards. Fictional data and simulated states are labeled. No public hosting or publication occurs as part of this milestone without separate authorization.

If the client-only demonstration cannot be cleanly isolated under current routing/hosting constraints, return a concrete alternative before changing deployment architecture. An interactive shared writable database is not the fallback.

### M6 — acceptance and portfolio release package

**Work:** Run the complete acceptance matrix, address defects in a bounded batch, and record evidence in `docs/testing-checklist.md`. Capture consistent final screenshots and a walkthrough. Update README and the existing audit with current outcomes and remaining limitations. Finish with implementation, verification, manual acceptance, commit, and deployment reported separately.

**Gate:** End-to-end behavior, accessibility, responsive layouts, and production checks pass within the agreed release scope. User accepts the final visual result. Any unavailable device, real-provider, notification-delivery, or public-host check remains explicitly pending.

## 6. Quality and verification contract

### Visual and responsive acceptance

- Use realistic short, long, missing, and multiline content; test zero, one, and many campaigns, long business names, long channel labels, and lengthy review notes.
- Test around breakpoints, especially 800/811px; choose layout transitions according to available reading width rather than device names alone.
- No page-level horizontal scrolling. Any intentionally scrollable data region is clearly bounded, keyboard reachable, and retains its headers/context; prefer a stacked schedule on small screens when it reads better.
- At 200% text zoom and the applicable 400% reflow condition, content remains operable and readable. Sticky navigation and action areas cannot obscure focus or the last content section.
- Inspect desktop and mobile together once per completed visual milestone, batch fixes, then perform at most one confirmation pass. Further changes require a concrete unresolved defect rather than open-ended polishing.

### Accessibility acceptance

- Target WCAG 2.2 AA: semantic landmarks/headings, names and labels, keyboard support, meaningful errors, and visible focus that is not obscured.
- Normal text contrast at least 4.5:1; large text and applicable interface boundaries at least 3:1. State is never conveyed by color alone.
- Meet the 24×24 CSS-pixel AA minimum target criterion or its permitted spacing exceptions; aim for roughly 44px primary touch controls where practical.
- Announce asynchronous results without repeatedly interrupting assistive technology; respect reduced motion. Verify navigation/menu focus behavior and form errors manually as well as with automation.
- Run automated accessibility scans on every route and manually check the core flow with keyboard and a Windows screen reader. A passing scanner alone does not establish compliance.

### Performance acceptance

- Keep data access and rendering on the server where appropriate; add client code only for actual interaction. Avoid a large UI framework or animation dependency without a concrete benefit.
- Reserve loading space, avoid typography shifts, and keep large campaign lists usable; introduce pagination when fixture-scale measurements justify it.
- Target LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 under representative conditions. Field success requires the 75th-percentile real-user evidence described by the Web Vitals guidance; a local Lighthouse run does not prove it.
- Use repeatable production-build lab measurements as a regression signal. Record environment, route, viewport, and limitations. Loading the interface and waiting for an LLM result are measured separately.

### Automated and runtime checks

Run applicable checks per milestone; run the full suite for workflow changes and final acceptance:

```powershell
npm run typecheck
npm run lint
npm test
npm run contract:check
npm run build
npm run test:production
```

Add targeted browser tests for the core journey, filtering, validation/focus recovery, uncertain mutation replay, and exports. Use an isolated temporary database with fictional inputs. Add callback authentication/envelope tests in M4; retain existing persistence/concurrency tests. Select a browser test runner and accessibility tool in M1 based on compatibility with the installed stack, without adding redundant test layers.

Before writing implementation code, read the relevant guides in the installed `node_modules/next/dist/docs/`; this checkout uses Next.js 16.3.5 and its local documentation is authoritative for version-specific behavior.

## 7. Decisions and execution boundary

**Confirmed:** Marketing teams are primary; portfolio reviewers need a guided demo; the desired feel is clean, professional, premium, and Apple-inspired.

**Recommended:** Light-first studio direction; existing stack retained; grouped form; document-focused review; no-cost local demonstration path; isolated client-side showcase if technically clean.

**Decide in M0:** Final visual composition and density, anchored sections versus tabs, visual comparison method, and image-comp versus direct-code workflow. These are concrete design decisions, not blockers to writing this plan.

**Decide before M5:** Public-demo scope and isolation architecture, intended hosting environment, and whether public hosting is required. Shared real-client usage requires a separate architecture/security scope, not just UI changes.

**Execution decision:** The user authorized M0–M6 and delegated design choices. Complete the local upgrade and isolated demonstration with independent review. Public/shared live operation remains outside this run.

Deployment, external notifications, purchases, and production-data use remain outside authorization. Implementation is authorized by the user's subsequent request, not inferred from this plan alone.
