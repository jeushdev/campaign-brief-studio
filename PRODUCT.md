# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Small marketing teams preparing and reviewing campaign plans. Portfolio reviewers are a secondary audience and need a clear fictional demonstration without provider setup. The current operator application is local and single-user; team-oriented design does not imply shared accounts.

## Product Purpose

Turn a structured business brief into a validated campaign draft, support revisions and deliberate human review, and export an approved plan for use elsewhere.

## Positioning

The product makes the full brief-to-reviewed-plan workflow inspectable: inputs, generation attempts, schema validation, review decisions, revisions, and historical plans remain connected. Generated audience insights are hypotheses, not verified research.

## Operating Context

Next.js and TypeScript application with transactional local SQLite persistence. Blank generation webhook configuration selects deterministic local generation. Configured n8n generation uses Groq and asynchronous callbacks. A separate fictional portfolio demo must not read operator storage or contact providers.

## Capabilities and Constraints

Five operator routes: dashboard, new brief, campaign detail, review queue, workflow settings. Outputs include three messaging angles, a landing outline, seven content days, assumptions, risks, confidence, and review questions. Approval, rejection, and revision requests are distinct. No automatic publishing, user accounts, billing, verified market research, or delivery guarantees.

## Brand Commitments

Keep the name Campaign Brief Studio. The user requested a clean, professional, premium, Apple-inspired design and delegated completion and design decisions on 2026-10-23. On 2026-10-24, the user explicitly replaced the flat material treatment with glassmorphism. Use frosted surfaces, floating navigation, light-catching edges, and soft depth while keeping text and fields crisp. Respect reduced transparency by default and offer an explicit Glass effects choice. Do not add commercial claims or implied customers.

## Evidence on Hand

Current source, tests, exported n8n workflow, and documentation. Only fictional demonstration content is authorized. Existing automated verification is not evidence of a real provider round trip or production deployment.

## Product Principles

- Make the next task clear.
- Keep the campaign content central.
- Preserve inputs and decisions through recoverable failures.
- Make simulated and live behavior distinguishable.
- Human approval precedes export or external use.

## Accessibility & Inclusion

Target WCAG 2.2 AA, keyboard-complete operation, responsive reflow, legible contrast, and reduced-motion support. Automated scans support but do not replace manual acceptance.
