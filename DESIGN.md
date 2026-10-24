---
name: Campaign Brief Studio
description: A frosted glass workspace for shaping and reviewing campaign plans.
colors:
  primary: "#3159d8"
  primary-hover: "#2548b8"
  graphite: "#22324a"
  muted-text: "#53647c"
  divider: "rgba(65, 89, 125, .15)"
  document-paper: "rgba(255, 255, 255, .88)"
  workspace-cool: "#e5edf7"
  glass-edge: "rgba(255, 255, 255, .86)"
  canvas-ice: "#cbdff4"
  canvas-mist: "#e6eef8"
  canvas-pearl: "#f0eef4"
  canvas-blue: "#d5e4f1"
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
  sm: "10px"
  md: "16px"
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
    textColor: "#2e51af"
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
    textColor: "{colors.graphite}"
    rounded: "{rounded.md}"
---

# Design System: Campaign Brief Studio

## Overview

**Creative North Star: "The Frosted Studio"**

Campaign Brief Studio uses the glassmorphism explicitly requested by the user on 2026-10-24. A static ice-blue and pearl background sits beneath frosted surfaces. Bright rim highlights, restrained diffusion, and soft cast shadows make the navigation and document feel suspended above the workspace. Navy text and more opaque fields keep the work readable. The host system font and cobalt actions preserve the native character.

The campaign document is the visual center. Navigation stays compact, source context can be disclosed when needed, and review decisions sit beside the work they affect. Small geometric icons and restrained motion support orientation without competing with copy. Fictional examples and simulated behavior remain visibly identified.

**Key Characteristics:**
- Frosted panels over an ice-blue and pearl canvas
- Document-led hierarchy and calm navigation
- Cobalt actions, light-catching edges, and precise state feedback
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

Home introduces the plan outputs with primary brief creation and a fictional demo, followed by simple task links. Campaigns live at `/campaigns`. Repeated branding bars and tagline footers are removed.

The wide workspace pairs a floating 224px sticky navigation rail with a flexible reading area, separated by a 16px gap and 16px canvas inset. Main content is centered within a 1360px maximum. Brief creation and revision use one frosted wizard within an 840px maximum form width. Within a campaign, the document receives the largest reading area and contextual brief details remain collapsible. Section anchors preserve direct navigation through long plans.

At 1200px, outer spacing and multi-column content tighten. At 960px wide or 600px high, the rail becomes a top surface with horizontal navigation, keeping all destinations reachable in short landscape windows. At 640px, navigation compacts, headers stack, fields become single-column, and tabular campaign and content-day data reflow into readable rows. The brief form also switches its section and field grids at 720px and 520px. Keep controls and document text within the viewport; do not introduce a fixed side panel that competes with the campaign canvas.

The spacing rhythm is built from compact control gaps through broad document section padding. Use the established spacing tokens for repeated gaps and preserve larger page-specific breathing room where the current layout uses it.

## Elevation & Depth

Glass surfaces share `--glass-bg`, `--glass-border`, `--glass-shadow`, and `--glass-filter` from the global stylesheet. The material blends white at 83% to 53% opacity with 20px backdrop blur and 135% saturation. A soft downward cast shadow and inset top highlight establish depth. Fields use 88% white and a darker boundary. Blur belongs on outer surfaces, not on every nested control or text section. The canvas is static; there is no animated blur.

**The Glass Legibility Rule.** Keep text crisp and controls opaque enough to read. Unsupported blur and reduced-transparency preferences use solid pale surfaces. Retain visible keyboard focus and reduced-motion support.

Reduced transparency follows the browser preference automatically; no appearance control or appearance storage is used.

## Shapes

Controls use 10px corners, document and panel surfaces use 16px, and the desktop navigation rail uses 20px. Small navigation items and status labels retain tighter corners. Forms keep a clear border at rest, strengthen it on hover or focus, and use a visible outline for keyboard focus. Status chips remain compact and pair their fill with a written state.

## Components

### Buttons
- **Character:** Direct, compact actions with clear hierarchy.
- **Primary:** A subtle cobalt gradient, white text, inset highlight, compact horizontal padding, and a 10px corner. Hover deepens the cobalt; press feedback shifts down by one pixel. Disabled controls lower opacity and use a not-allowed cursor.
- **Secondary:** White fill, graphite text, and a light neutral border; hover adds a pale gray fill and strengthens the border.
- **Tertiary:** Transparent at rest with muted text; hover adds a restrained neutral fill.
- **Focus:** A visible blue outline with an offset. Preserve it for keyboard use.

### Chips
- **Style:** Compact status labels use a pale semantic fill, darker text, and a small dot that inherits the label color.
- **State:** Needs review, approved, failed, rejected, revision requested, and generating states have distinct fills and text colors. Keep the written status as the primary label and never rely on color alone.

### Cards / Containers
- **Character:** Frosted surfaces that keep the campaign readable against the cool workspace.
- **Background and border:** Translucent white with a bright rim. The campaign document, brief wizard, common panels, and library share the 16px corner and glass material. Input steps are sections within one surface, not separate floating cards.
- **Internal padding:** Panels use a broad inset on desktop and reduce it on smaller screens. Campaign document sections are separated by rules rather than nested shadow cards.
- **Shadow:** Shared soft cast shadow and inset highlight; see Elevation & Depth.

### Inputs / Fields
- **Style:** Global fields use 88% white fill, a visible blue-gray stroke, navy text, and 10px corners, with a 42px minimum height. The new-brief form locally uses 14px text and a 44px minimum height. Labels and helper text stay visually adjacent to their fields.
- **Focus:** A visible outline and accent-colored border identify the active control.
- **Error / Disabled:** Invalid fields use a red border and a linked error message; read-only fields use a muted fill and text. Preserve associated labels and helper copy.

### Navigation
- **Style:** Quiet links within a floating frosted rail. The current route receives a white-to-ice highlight, darker cobalt text, and subtle elevation.
- **Responsive behavior:** The side rail becomes a horizontal top navigation at tablet width, then the links compact vertically within their top-surface tabs on narrow screens. Keep the active state visible and preserve the skip-to-content link.

### Campaign Document
The signature component is a frosted reading surface with crisp navy text. A compact row of section anchors sits above the plan; business, objective, status, revision, and generation context precede the strategy. Each major section has generous vertical space and a fine top rule. Content days become stacked rows on small screens, with their labels kept beside the day number.

### Brief Context
The source brief is a native disclosure above the campaign document, rather than a competing permanent column. Its open state reveals labeled values in a responsive grid; on mobile that grid becomes a single column.

### Guided Brief

Use the confirmed sequence Business → Campaign → Channels → Review. Progress navigation stays in one row, compacting labels and numbers on phones. Each input step uses one reading column with labels above controls. The active step heading is 22px, reducing to 21px on phones. Back preserves answers, forward navigation checks prerequisites, and Review displays grouped summaries with contextual Edit controls. Only the final action generates a draft. Optional source context is disclosed within Channels. Creation and revision use the same component; original pending submissions remain authoritative during retries.

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
- **Don't** add blur to nested controls, animate backdrop filters, or lower text opacity to imitate glass.
