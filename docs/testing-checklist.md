# Verification record

Release scope: premium local workspace and fictional demonstration, 2026-10-23. No production deployment, real provider call, real customer data, or external notification is part of this run.

## Automated acceptance

| Check | Observed outcome |
| --- | --- |
| TypeScript | Passed |
| ESLint | Passed without errors or warnings after correcting the pre-existing unused argument |
| Node test suite | 29 tests passed, zero failed |
| Generated contract consistency | Passed |
| Production build | Passed with Webpack, `.next-studio/` output |
| Production smoke | Passed against the production build with an isolated SQLite database and local webhook stub |
| Design detector | No findings on the reviewed targets; no automatic design hook was active |

The initial Turbopack build encountered an existing Windows native-module junction cleanup failure. The generated junction was left intact. Local scripts now use Webpack and a separate ignored build directory; Docker standalone paths and build configuration were updated to match. Local production build/start and smoke were verified; a Docker engine run was not performed.

### Regression coverage

- Input normalization; wrong types; null/non-object bodies; missing/unknown fields; nested nonblank requirements; exact three-angle/seven-day output counts.
- Provider transport/HTTP failures, malformed content, refusals/incomplete output, and schema-invalid plans; execution of the generated workflow's shared code against fixtures.
- Transactions, idempotent operation receipts, optimistic versions, cross-process duplicate creation, revision/plan history, low-confidence approval, legacy import rollback, corrupt stored plans, expired attempts, and stale callbacks/decisions.
- Dedicated callback authentication, dispatch/callback secret separation, complete envelope/contract validation, bounded request bytes, fixed callback destinations, duplicate/late callbacks, and observable unexpected store failure.
- Markdown metadata and content, CSV quoting/formula protection, filenames, fictional scenario validity, channel-format coherence, review/export/edit guards, and raw channel normalization.
- Lost create response followed by tab reload: the recovered original request replays the same stored operation instead of creating a second campaign. Denied/malformed session storage does not block same-page operation.

Production smoke additionally checks fresh server-rendered lists, create → revision request → edited resubmission → approve/reject, authenticated failure callback → retry, parallel duplicate mutations, malformed requests, and Host/Origin guards. It disables approval notifications explicitly and makes no real n8n/Groq request.

## Browser acceptance

Used the in-app browser and isolated fictional storage. Initial operator checks used a temporary database and blank generation/notification configuration. Final production checks used `npm run preview`, which creates its own temporary database with three fictional records.

| Flow or surface | Observed result |
| --- | --- |
| Empty brief submission | Eight invalid fields reported; error summary receives focus |
| Sample fill and reload | Values and selected channels restore in the same tab |
| Create → campaign | Saved plan appears with correct source and Needs review status |
| Revision without note | Action is blocked; note field receives focus |
| Revision and edited resubmission | New version shown; old plan and activity remain available |
| Deliberate approval | Confirmation records approval and reveals exports |
| Actual export | Markdown/CSV files downloaded; copied Markdown includes business, revision, status, confidence, and plan |
| Search/filter/sort | No-match state and clear action work; Approved filter returns only the approved fictional record |
| Demo new brief | Draft → edited fictional input → deterministic plan; no provider/API needed |
| Demo raw channels | Typing `Email, LinkedIn` retains the delimiter and creates a two-channel schedule |
| Demo hidden validation | Invalid closed context is opened and the invalid input receives focus |
| Demo low confidence | Approval blocked until acknowledgment and a note; approved exports then appear |
| Demo revision | Prior input/plan snapshot retained and revision number advances |
| Demo rejection and reset | Decision recorded; reset restores the chosen fictional example |
| Keyboard entry | First Tab reaches visible Skip to content; Enter focuses the main content |
| Console | No warning/error entries observed in the final production browser tab during the inspected flows |

Browser downloads were created as fictional test artifacts in the user's Downloads directory. Preview and test databases are separate from `data/campaign-brief-studio.sqlite`.

### Responsive and structural inspection

- Captured all six routes at intended CSS viewport widths 1440 and 390, height 900. Native screenshots exclude scrollbar gutters and can be a few pixels smaller.
- All six routes: one main landmark and one h1, no duplicate IDs, no visible unnamed form controls, no empty visible buttons, and no page-level horizontal overflow in the observed states.
- Campaign and demo reflow checked additionally at widths 320, 360, 768, 800, 811, and 1024. No page-level overflow; the campaign remains a usable document rather than a compressed side column.
- A read-only rendered-style check found no visible-text contrast flags against the sampled opaque ancestor backgrounds on the six routes. This is a scoped contrast check, not formal WCAG certification.
- Full draft and plan content, schedules, status feedback, and revision/rejection states were included in the browser inspection. Source includes reduced-motion handling, field-linked errors, and bounded polling while the page is visible.
- QA captures and JSON matrices are stored locally under ignored `.impeccable/review/`. Selected screenshots for sharing live under `docs/screenshots/`.

## Independent review

A fresh Sol correctness review found three material recovery issues: pending submission identity after reload, raw demo channel entry, and hidden-field validation focus. All were fixed; the reviewer scored all three resolved in source. Targeted tests and browser checks verify the applicable scenarios.

A separate fresh Sol visual review inspected every required desktop/mobile first view and full demo/review captures. It accepted the direction and requested two bounded fixes: channel label/helper separation and earlier campaign content in the mobile demo. Those were applied as one correction batch. The reviewer inspected the affected desktop/mobile captures, scored both resolved, and issued “Ship the local implementation.” This is independent visual review, not user visual acceptance or deployment approval.

## Explicitly pending external/manual evidence

- User visual acceptance, physical phone/tablet/Safari checks, and full screen-reader acceptance.
- Comprehensive WCAG audit, true 200% text-zoom testing, and formal 400% zoom acceptance; narrow-width reflow was observed but does not establish every zoom case.
- Lighthouse/Core Web Vitals lab/field measurements. The plan's LCP/INP/CLS values are targets, not measured release claims.
- Live n8n import, credential mapping, actual Groq round trip/failure delivery, and optional downstream notification delivery.
- Docker runtime acceptance, public hosting, identity/authorization, and shared production use.

These boundaries do not prevent running the completed local application or fictional demonstration. They limit the claims that can be made about deployment and external integration.
