# Studio workspace direction

## Authority and plan review

The user delegated design choices and full implementation on 2026-10-23, superseding the proposed plan's M0 selection gate and its implementation stop. No deployment, external messages, real customer data, or paid services are authorized. The project remains local. Code-led execution is selected for this run; no standing preference is stored.

The second pass retains the stack and contracts, moves visual review to a completed browser implementation, and treats callback trust and demo isolation as independent acceptance gates. A sample is never inserted into the operator database automatically. Public hosting and authenticated multi-user operation remain separate projects.

## Candidate directions

1. Printed creative brief: editorial document with a project index.
2. Campaign newsroom: compact assignment lists and a story editor.
3. Calendar desk: content days as the primary entry to a campaign.
4. Creative presentation board: strategy and message comparisons lead.
5. Approval inbox: pending decisions dominate the workspace.
6. Native document workspace: quiet navigation, expansive document canvas, contextual inspector, explicit review decisions.
7. Production checklist: sequence and requirements lead every screen.

Seed `01d1058d` assigned candidate 6. This direction also follows the user's Apple-inspired brief. The warm consumer-app challenger is competitive on approachability; it loses document density. The vertical-feed challenger loses audience identification and document clarity; borrow only its discipline of one clear focal task. The emission-line rail challenger loses audience identification and text readability; borrow only consistent, distinguishable state forms. No decorative vocabulary transfers.

## WORLD

Update 2026-10-24: the user explicitly replaced the flat material treatment with glassmorphism. The layout and workflow remain document-led. Floating frosted navigation and 16px glass panels use a static ice-blue/pearl backdrop, bright rim highlights, shared soft cast shadows, 20px backdrop blur, crisp navy text, and more opaque fields. Solid fallbacks support unavailable blur and reduced transparency. This request supersedes the flat-surface material description below.

A daylit marketing studio. Cool near-white working surface, white document paper, graphite text, one cobalt action color, thin neutral rules. The interface uses the host's system UI font so it feels native on the user's Windows machine. Navigation remains quiet; text is the primary material. Small geometric SVG icons share a 1.7px stroke. No illustrative stock imagery is needed for this operating tool.

## STRUCTURE

Update 2026-10-24: the user chose a guided Business → Campaign → Channels → Review input flow. New briefs and revisions now use one glass wizard with one reading column, local step validation, Back/Edit controls, preserved answers and progress, and a final editable summary before generation.

The main workspace is a responsive two-part shell. The campaign document occupies the largest reading area. Input context is collapsible above the document, not a competing fixed-width column. Anchored sections preserve browser navigation and allow users to search the full document. On narrow screens navigation becomes a compact top surface, sections stack, and content days become readable rows.

## FIRST VIEWPORT

Home explains the three plan outputs and offers brief creation and a fictional demo, followed by task links to Campaigns, Review, and Workflow. The searchable campaign library lives at `/campaigns`, with a focused empty state. The shell has no appearance switch, repeated branding bar, or tagline footer. The campaign screen names the business, objective, state, revision and generation source before showing the strategy. The demo has an explicit simulation label and an immediately readable fictional campaign.

## SIGNATURE

Brief and campaign remain connected through a context disclosure and document sections. The deliberate review action changes the plan's state and records history. Subtle page settling and controlled button feedback support this transition. No false progress, automatic approval, or decorative animated dashboards.

## GUARDRAILS

All existing review, low-confidence acknowledgment, idempotency, and stale-result rules remain. Color is paired with text and icon form. Every action has pending, failure, and recovery feedback. Focus remains visible; no sticky control covers document content. Fictional examples and deterministic generation are labeled.

## FINISH

Build the whole route/state family, run static/contract/persistence and production smoke checks, inspect desktop/mobile/breakpoint layouts in a bounded batch, run the design detector once, and send captures plus this contract to a fresh Sol finish reviewer. Document actual tokens and components in DESIGN.md and .impeccable/design.json. Record live-provider, screen-reader, physical-device and deployment acceptance honestly if unavailable.
