---
name: Campaign Brief Studio
description: A calm document workspace for shaping and reviewing campaign plans.
colors:
  primary: "#3159d8"
  primary-hover: "#2548b8"
  graphite: "#24262b"
  muted-text: "#686b73"
  divider: "#e6e6e9"
  document-paper: "#ffffff"
  workspace-cool: "#f7f7f9"
  danger: "#ab313b"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(28px, 3.5vw, 38px)"
    fontWeight: 650
    lineHeight: 1.2
    letterSpacing: "-0.035em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "21px"
    fontWeight: 620
    lineHeight: 1.35
    letterSpacing: "-0.025em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 550
    lineHeight: 1.5
    letterSpacing: "normal"
  navigation:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.6
    letterSpacing: "normal"
  status:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "normal"
  field:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.document-paper}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.document-paper}"
    rounded: "{rounded.sm}"
  button-secondary:
    backgroundColor: "{colors.document-paper}"
    textColor: "{colors.graphite}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
  text-field:
    backgroundColor: "{colors.document-paper}"
    textColor: "{colors.graphite}"
    typography: "{typography.field}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
  nav-current:
    backgroundColor: "#edf0fc"
    textColor: "#3153b7"
    typography: "{typography.navigation}"
    rounded: "7px"
    padding: "11px 13px"
  status-needs-review:
    backgroundColor: "#fff3dc"
    textColor: "#805a17"
    typography: "{typography.status}"
    rounded: "5px"
    padding: "4px 9px"
  campaign-document:
    backgroundColor: "{colors.document-paper}"
    textColor: "{colors.graphite}"
    rounded: "{rounded.md}"
---

# Design System: Campaign Brief Studio

## Overview

**Creative North Star: "The Daylit Document Studio"**

Campaign Brief Studio is a quiet working surface for moving a business brief into a considered campaign plan. The cool, near-white workspace gives the white document a clear reading edge; graphite text and fine neutral rules keep attention on the strategy. The host system font makes the interface feel at home on the operator's Windows machine, while a single cobalt family marks actions and active wayfinding.

The campaign document is the visual center. Navigation stays compact, source context can be disclosed when needed, and review decisions sit beside the work they affect. Small geometric icons and restrained motion support orientation without competing with copy. Fictional examples and simulated behavior remain visibly identified.

**Key Characteristics:**
- Cool, daylit neutrals with a white document surface
- Document-led hierarchy and calm navigation
- Cobalt actions, thin rules, and precise state feedback
- System UI typography and small geometric icons

## Colors

The palette uses one cobalt action family within a neutral workspace; semantic state colors add meaning only where a status or message requires it.

### Primary
- **Studio Cobalt** (`colors.primary`): Primary buttons, links, focused form controls, and active document wayfinding.
- **Cobalt Press** (`colors.primary-hover`): Hover state for primary actions.

### Neutral
- **Graphite** (`colors.graphite`): Main text, headings, and high-emphasis labels.
- **Soft Graphite** (`colors.muted-text`): Supporting copy, metadata, and secondary navigation.
- **Fine Rule** (`colors.divider`): Panel edges, table separators, and document section dividers.
- **Document White** (`colors.document-paper`): Campaign pages, cards, and form fields.
- **Cool Workspace** (`colors.workspace-cool`): The app canvas behind white working surfaces.

### Semantic
- **Validation Red** (`colors.danger`): Invalid field borders and error messages. Pair it with an error label or message; color alone does not communicate the state.

**The One Cobalt Rule.** Use the cobalt family for action and active wayfinding. Reserve separate semantic colors for statuses and validation, and pair those states with text or shape.

## Typography

**Display Font:** Host system UI stack (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, sans-serif)
**Body Font:** The same host system UI stack

**Character:** Compact, familiar system typography keeps the tool practical and native-feeling. Tight, balanced headings distinguish the plan's structure while body copy remains open enough for long-form campaign content.

### Hierarchy
- **Display** (650, responsive clamp, 1.2 line-height): Page titles and the main campaign heading.
- **Title** (620, 21px, 1.35 line-height): Section headings and major document divisions.
- **Body** (400, 15px, 1.6 line-height): Default interface copy; campaign prose uses a more open line-height and a readable measure up to 75ch.
- **Label** (550, 13px, 1.5 line-height): Buttons and compact interactive labels. Navigation uses a lighter 500 weight; status labels use a compact 600 weight. Small metadata may step down in size, but it remains secondary to the content it describes.

## Layout

The wide workspace pairs a quiet, sticky side rail with a flexible reading area. The rail is 224px; the main content is centered within a 1360px maximum and keeps generous outer padding. Within a campaign, the document receives the largest reading area and contextual brief details remain collapsible. Section anchors preserve direct navigation through long plans.

At 1200px, outer spacing and multi-column content tighten. At 960px, the rail becomes a top surface with horizontal navigation and the workspace top bar drops away. At 640px, navigation compacts, headers stack, fields become single-column, and tabular campaign and content-day data reflow into readable rows. The brief form also switches its section and field grids at 720px and 520px. Keep controls and document text within the viewport; do not introduce a fixed side panel that competes with the campaign canvas.

The spacing rhythm is built from compact control gaps through broad document section padding. Use the established spacing tokens for repeated gaps and preserve larger page-specific breathing room where the current layout uses it.

## Elevation & Depth

The system is flat by default and does not use box shadows. Depth comes from the contrast between the cool workspace and white document surfaces, fine borders, and subtle state fills. A short page-settling animation and restrained button transitions provide feedback; they are removed when reduced motion is requested.

**The Surface Contrast Rule.** Use tonal contrast and a fine border to separate a working surface; do not add a shadow layer to cards or panels.

## Shapes

Controls use gently rounded corners, while document and card containers use a slightly broader radius. Small navigation items and status labels use tighter corners. Forms keep a clear border at rest, strengthen it on hover or focus, and use a visible outline for keyboard focus. Status chips remain compact and pair their fill with a written state.

## Components

### Buttons
- **Character:** Direct, compact actions with clear hierarchy.
- **Primary:** Cobalt fill, white text, compact horizontal padding, and an 8px corner. Hover deepens the cobalt; press feedback shifts down by one pixel. Disabled controls lower opacity and use a not-allowed cursor.
- **Secondary:** White fill, graphite text, and a light neutral border; hover adds a pale gray fill and strengthens the border.
- **Tertiary:** Transparent at rest with muted text; hover adds a restrained neutral fill.
- **Focus:** A visible blue outline with an offset. Preserve it for keyboard use.

### Chips
- **Style:** Compact status labels use a pale semantic fill, darker text, and a small dot that inherits the label color.
- **State:** Needs review, approved, failed, rejected, revision requested, and generating states have distinct fills and text colors. Keep the written status as the primary label and never rely on color alone.

### Cards / Containers
- **Character:** White, bordered surfaces that keep the campaign readable against the cool workspace.
- **Background and border:** White paper with a thin neutral rule. The campaign document uses a 12px corner; common panels and library surfaces share this family.
- **Internal padding:** Panels use a broad inset on desktop and reduce it on smaller screens. Campaign document sections are separated by rules rather than nested shadow cards.
- **Shadow:** None; see Elevation & Depth.

### Inputs / Fields
- **Style:** Global fields use white fill, a neutral stroke, graphite text, and softly rounded corners, with a 42px minimum height. The new-brief form locally uses 14px text and a 44px minimum height. Labels and helper text stay visually adjacent to their fields.
- **Focus:** A visible outline and accent-colored border identify the active control.
- **Error / Disabled:** Invalid fields use a red border and a linked error message; read-only fields use a muted fill and text. Preserve associated labels and helper copy.

### Navigation
- **Style:** Quiet links with small geometric line icons and compact labels. The current route receives a pale cobalt tint and darker cobalt text.
- **Responsive behavior:** The side rail becomes a horizontal top navigation at tablet width, then the links compact vertically within their top-surface tabs on narrow screens. Keep the active state visible and preserve the skip-to-content link.

### Campaign Document
The signature component is a white, bordered reading surface. A compact row of section anchors sits above the plan; business, objective, status, revision, and generation context precede the strategy. Each major section has generous vertical space and a fine top rule. Content days become stacked rows on small screens, with their labels kept beside the day number.

### Brief Context
The source brief is a native disclosure above the campaign document, rather than a competing permanent column. Its open state reveals labeled values in a responsive grid; on mobile that grid becomes a single column.

## Do's and Don'ts

### Do:
- **Do** keep the campaign text as the main visual material and make the next action easy to find.
- **Do** use cobalt for primary actions, links, focus, and current wayfinding.
- **Do** label simulated examples and distinguish fictional content from operator workspace state.
- **Do** pair status color with a written label and a distinct form.
- **Do** preserve keyboard focus, reduced-motion support, and responsive reflow.
- **Do** keep review actions explicit and close to the plan they change.

### Don't:
- **Don't** add decorative imagery, dashboards, or motion that competes with campaign copy.
- **Don't** use color as the only way to indicate status, confidence, or validation.
- **Don't** add a fixed inspector that takes the campaign document's reading space.
- **Don't** imply that generated audience insights are verified research or that simulated work is live.
- **Don't** introduce shadows to cards or panels.
