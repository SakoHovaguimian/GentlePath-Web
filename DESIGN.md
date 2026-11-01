---
version: alpha
name: GentlePath
description: A warm illustrated family space with forest, sage, lavender, and sunlight surfaces, clean outlined botanicals, and editorial typography.
colors:
  surface: '#fffdf8'
  background: '#faf8f2'
  text: '#123e39'
  muted: '#53625b'
  border: '#d9dfd5'
  primary: '#174e46'
typography:
  sans:
    fontFamily: 'DM Sans, system-ui, sans-serif'
    fontSize: '1.125rem'
    lineHeight: '1.75rem'
  mono:
    fontFamily: 'ui-monospace, monospace'
rounded:
  DEFAULT: '0.75rem'
  card: '1.25rem'
  action: '9999px'
spacing:
  panel: '1.5rem'
  field-gap: '1rem'
components:
  button:
    rounded: '9999px'
  card:
    rounded: '1.25rem'
  input:
    rounded: '0.75rem'
  dialog:
    rounded: '1.25rem'
---

# GentlePath Design

## Overview

A reassuring English-language family space for parents navigating autism. Preserve the established forest/ivory identity, Lora/DM Sans hierarchy, softly outlined illustrations, and generous editorial spacing. Public pages introduce the product; family forms stay practical and private; staff tools use the same system at higher information density. The supplied G/P blocks mark and sage/lavender illustrations of family connection, plans, and conversation carry the public identity. The landing opens with the Shared Moments family-drawing scene: a full-bleed forest canvas, left-aligned ivory headline, sunlight action, and fine illustrated wave. The header and hero together fill the initial viewport before the remaining sections scroll naturally. The forest public header offers one Your Account menu and the shared theme toggle at the far right. Family records are introduced within the toolkit, and contact fields stay embedded below their introduction.

Runtime CSS is canonical: [theme.css](src/app/theme.css) owns palette, semantic states, typography, shapes, shadows, and motion. This document records intent; it does not generate a parallel theme. [UI system](docs/UI_SYSTEM.md) owns behavior and component choices.

## Colors

Light roles are oat canvas, paper panels, forest actions, deep green ink, and muted green supporting text. Sage, lilac, sunlight, and clay identify useful regions/tasks rather than tinting every surface green. The forest sidebar keeps dedicated inverse text, hover, selected, divider, and focus tokens under `--dashboard-sidebar-*`, independently of the optional action accent. The Shared Moments artwork and its `--landing-hero-*` foreground/action roles retain their fixed promotional palette in both appearance modes; the remaining landing sections use the active semantic theme.

Dark mode and alternate accents use the existing semantic aliases in theme.css. Selection/hover fill follows the current surface and accent: light/dark selection 8%/14%, emphasized 14%/22%, hover 5%/8%. Do not copy these constants into screens.

Resource ratings use semantic rating tokens: forest filled stars, muted green empty outlines, and a sage hover/focus surface. Summary scores share the same palette on cards and detail headers; rating panels use the neutral border. These aliases follow light/dark brand roles independently of warning colors. Selected heart reactions use the shared destructive/red palette. Destructive/removal actions use the canonical transparent variant with red text/icons and no border or fill. The account-deletion and notification-disable actions use a scoped 15% alpha danger fill, rising to 20% on hover. Promotional artwork may use authored colors; disclosures and controls keep themed contrast.

## Typography

Local DM Sans is the body/control face and local Lora the editorial display face. PageHeader is regular-weight Lora, 24px narrow/32px desktop on a compact colored surface without a leading icon; sections use 24px/28px. Body is 18px/28px, controls 16px/24px, and captions/badges at least 14px/20px. Use named rem-based utilities and preserve wrapping. Technical values use system monospace.

[Copy casing](docs/STRINGS.md#copy-casing) distinguishes Title Case labels/actions from sentence-case prose. Every authored string and alt description lives in `src/strings.ts`.

## Layout

Page → one PageHeader → purposeful work surfaces. The shell header supplies context, not a second title. Desktop uses a fixed 17.5rem forest sidebar from 64rem; navigation scrolls independently above the account. The sidebar has no promotional/care-note card. Below 64rem use the shared full-screen navigation with safe areas, Escape, focus trap, and restoration.

Family, journal, Milestones, document, and community screens move directly from the compact colored page header to their controls and content, without a second promotional banner. My Path combines application and follow-up cards in one responsive grid immediately below the page header, with clear calendar-day countdowns and direct completion actions. Card footer actions retain their natural width on one line when they fit, wrapping only as space requires; the grid collapses when empty. A dismissible illustrated welcome sits below the For Your Family tools, followed by the full-width weekly activity panel and a horizontal reflection carousel. Recent reflections reuse the journal's gradient headers, bordered cards, metadata divider, and overflow actions in a compact variant. Resource and community list/detail screens use the same shell content width as sibling pages.

Directories reuse shared filtering/paging and responsive record patterns; wide tables own a labeled horizontal scroller. Long page forms scroll naturally. Scrolling modals keep actions outside the scrolling body at every viewport, with native form association for submit buttons. Carousels use native scrolling and a partial next card instead of chevron controls. Community combines Posts/Polls through prominent editorial tabs with an animated selection marker. Inbox content uses separated ivory cards and a clear unread hierarchy instead of a dense tinted wall. Parallel staff work cards stretch content and align their CTAs.

Required onboarding uses a centered branded header and shared four-step progress owner above an illustrated two-column stage. Each step pairs its own botanical/family artwork and editorial introduction with a focused paper form; narrow layouts stack the stage and keep all actions in natural document flow. Child names and birthdays form a tight two-line group. Confirmed completion reveals an illustrated community welcome with an eight-second shared fireworks scene: rising trails, successive mint/lilac/sunlight/peach/sky pastel bursts, and falling confetti. The welcome text and artwork stay stationary while the fireworks play. The scene waits for the eagerly loaded welcome artwork to decode or fail; completed-account reloads and explicit replays never animate the welcome content. Continue remains available throughout; Skip Celebration stops the scene, and Celebrate Again explicitly replays it. Reduced motion retains the welcome without animation. Discovery preferences reuse shared checkboxes in selectable outlined tiles. Setup and completion artwork stays padded inside positioned image frames, with text and actions outside those frames. The shared `--gp-artwork-canvas` mixes light oat and themed clay for a visible warm organic backdrop in both themes, preserving the original transparent illustrations without duplicate assets. Family birthday metadata is a quiet calendar/date line aligned with the profile name, without a separate tinted tile. State-benefit artwork fits wholly inside its reserved image region.

## Elevation & Depth

Borders and surface contrast carry structure. Reuse theme-owned card, shell, and overlay shadows. Primary actions retain the established restrained accent treatment; ordinary fields/records do not acquire arbitrary gradients or shadows.

Recoverable error states use a quiet paper panel with the neutral border, a small amber warning icon, editorial title, and a compact forest retry action. Keep red emphasis for destructive actions and field validation. Query and route errors share this presentation, with natural-width actions that wrap alongside the copy.

## Shapes

Fields use 12px corners, cards/dialogs 20px, actions the shared capsule radius, and IconTile round pastel surfaces. Large illustration regions may have organic corners. Selected strokes stay inset; pending states preserve geometry. Overlays stay within dynamic viewport/safe-area bounds.

## Components

Import shared owners from `@/components/ui`. Their runtime path is theme tokens → shared styles/components → domain screens. Preference services and providers own saved appearance values; the Appearance screen exposes two illustrated Light/Dark choice tiles, with no accent or motion selectors. ThemeScript applies validated values before hydration.

Use StarRating/RatingSummary for resource feedback, ReactionButton for confirmed heart reactions, and Accordion for animated disclosures. Dropdown triggers retain their layout width; popups size to the longest option, at least the trigger width, clamped to the viewport. See the [canonical map](docs/UI_SYSTEM.md#canonical-ui-map).

Family birthday, application Applied On, and initial follow-up fields use shared DatePicker with an accent-colored calendar popup and typed date segments. Other existing date/time fields retain native pickers. Goal cards without an available cover show the opaque green G/P mark centered on the active accent background, preserving the same 16:9 cover region as selected images. Goal status badges use the shared semantic palette consistently in list and detail views: blue for Active, green for Completed, and gray for Archived. CardOpenButton owns stretched card actions without the transform used for ordinary pressed buttons, so the full card remains the target.

Motion uses shared 90/140/200/240ms interaction tokens, a 520ms reaction celebration token, and an 8000ms onboarding celebration token. The onboarding variant of SuccessCelebration owns the finite canvas sequence and reads semantic celebration colors from theme.css; ordinary save/vote bursts retain their compact timing. Device and saved reduced motion suppress CSS/JavaScript movement while state, focus, and placement still update. Keep interactions purposeful: FAQ open/close, star feedback, heart confirmation, and reordering, rather than continuous decoration. The Shared Moments hero and its public header are entirely static, including hover/press movement and section-anchor scrolling; the artwork, text, and controls have no entrance, ambient, or particle animation.

Record cards have a single semantic details/editor entry surface and a top-right vertical ellipsis for secondary actions. Bookmark saves keep the icon and label close together and use a filled bookmark with Saved after confirmation. Confirmed bookmark saves share the bounded particle burst across modules. Family cards span the content width, pairing a larger avatar with the name and calendar age, birthday on its own row below the name/avatar and above optional gender, and a responsive summary grid of every completed support answer. Reflection cards use a translucent feeling-gradient header and a full border, with date, child, and feeling tokens together below the divider. Milestones uses independent cards with optional full-bleed 32:9 image headers, child tokens, and a segmented overview of answered and unanswered milestones. Moderation cards pair a compact status/date row with an editorial title, report reason, and a divided action footer; completed reports keep their resolution note visible and remain fully clickable. Guided Steps and Family Tips keep independent cards with divider actions and a prominent trailing save. Community uses one discussion per row and shares vote/result bars between poll cards and readers. Vote shares fill the option from left to right at 15% opacity; selected options use an opaque fill with contrasting text clipped to the filled region. Confirmed community actions may use a brief shared confetti burst, suppressed by reduced motion.

## Illustrations And Fonts

The illustration direction follows `winding-path`, `care-folder`, `care-notes`, `community-messages`, `community-polls`, and `resource-library`: rounded graphic shapes, fine forest outlines, restrained paper grain, and a sage/lilac/ivory palette with small yellow accents. New artwork uses clean transparent silhouettes and sparse botanical details. Avoid realistic watercolor scenery, dense foliage, glowing halos, and heavy dimensional shading. Keep the files as maintained assets; generation prompts and review sheets are not runtime dependencies. The shared wordmark and browser icons use the opaque forest `app-icon` variant of the original G/P mark. Apple touch previews use its 180px export. `share-preview.png` pairs the exact local typography with a spacious illustrated path for social and browser previews; `node scripts/generate-brand-assets.mjs` exports these maintained raster assets. The original `family-connection.png` and `parent-and-child.png` remain preserved. Active family-reading placements use `family-connection-blonde.png`; auth, public-purpose, family blog covers, and the bundled demo drawing scene use `parent-and-child-blonde.png`. The shared brand mark clips its opaque green image inside rounded corners, with a small optical gap before the wordmark.

| Asset Group                                                                                 | Use                                                                                      |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `shared-moments-hero.png`                                                                   | 3200×2000 family-drawing hero artwork without embedded text, controls, or botanicals     |
| `public/gentlepath/brand-blocks.png`                                                        | Preserved original transparent brand identity                                            |
| `winding-path`, `care-notes`, `care-folder`, `caregiver-community`, `parent-and-child` PNGs | Existing product illustrations                                                           |
| `path-landscape-v2.png`                                                                     | Transparent outlined path, hills, butterfly, and sun for public/family/admin regions     |
| `parent-and-child-blonde.png`                                                               | Active welcome/sign-up drawing scene; original `parent-and-child.png` is preserved       |
| `reading-garden-v2.png`                                                                     | Transparent open ivory book, lilac cover, and sparse leaves for reading/resource regions |
| `community-garden-v2.png`                                                                   | Transparent sage/lilac conversation bubbles on a small botanical base                    |
| `off-the-path.png`                                                                          | Transparent path and blank lilac signpost for the root 404 screen                        |
| `family-connection.png`, `community-messages.png`                                           | Matching transparent illustrations for the public feature overview                       |
| `guided-steps.png`                                                                          | Transparent folded route guide with checks and a sprout for support/setup                |
| `milestone-garden.png`                                                                      | Transparent trio of potted plants at different growth stages                             |
| `community-polls.png`, `resource-library.png`                                               | Approved poll and resource illustrations and style references                            |
| `growing-together-v2.png`                                                                   | Landing invitation and Growth blog-cover sprout with a fully visible eight-ray sun       |
| `onboarding-state-garden.png`                                                               | Transparent simplified US silhouette, lilac location pin, and leaves for state setup     |
| `public/gentlepath/fonts/`                                                                  | Local DM Sans and Lora; no font network dependency                                       |

All illustration names above are under `public/gentlepath/`. Replaced artwork URLs are owned by [gentlePathIllustrations](src/models/gentlePathIllustrations.ts); static image imports give them content-hashed URLs so optimized images refresh automatically when the PNGs change. Reuse those URLs for local demo media. Use responsive images and catalog alt text. Preserve complete illustration silhouettes with contain sizing in headers, banners, and resource cards; transparent artwork does not need landscape edge-fade overlays. Never embed phone/UI reference mockups as the product interface.

Milestone guidance remains an ordinary illustrated catalogue with an optional private child context. Milestone details occupy their own page: the milestone image is the header, with a complete botanical fallback, then the title/actions and naturally stacked sections. Compact wrapping jump links provide orientation without nested segmented controls. Related content reuses existing community, poll, resource, guide, and article cards, preserving the single-column community feed and responsive editorial grids. Related editorial grids have one column on mobile and no more than two on desktop; guide and article titles use the full card width, with artwork above the copy rather than a competing inner text column. Each section has its own bounded loading, recovery, empty, and pagination state; empty states span the full available width with centered icon, text, and actions. State coverage and source-check metadata are quiet text beside existing resource metadata; no new visual trust seal implies a clinical review. Public community profiles reuse the family shell and existing author identity patterns, showing only anonymous summary context. The five state-benefit category illustrations use the same outlined botanical identity and complete contain-sized silhouettes.

## Do's And Don'ts

Reuse the palette, typography, shared controls, semantic states, and motion ownership. Check a sibling screen before introducing a variant. Do not redesign identity for one feature, add fixed feature palettes, recreate shared controls locally, or let artwork reduce control/disclosure contrast. Verify [keyboard, themes, narrow layouts, and recovery](docs/VERIFICATION.md).
