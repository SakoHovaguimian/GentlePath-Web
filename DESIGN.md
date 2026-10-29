---
version: alpha
name: GentlePath
description: A warm illustrated family space with forest, sage, lavender, and sunlight surfaces, watercolor botanicals, and editorial typography.
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

A reassuring English-language family space for parents navigating autism. Preserve the established forest/ivory identity, Lora/DM Sans hierarchy, watercolor botanicals, and generous editorial spacing. Public pages introduce the product; family forms stay practical and private; staff tools use the same system at higher information density. The winding path toward sunlight is the visual signature.

Runtime CSS is canonical: [theme.css](src/app/theme.css) owns palette, semantic states, typography, shapes, shadows, and motion. This document records intent; it does not generate a parallel theme. [UI system](docs/UI_SYSTEM.md) owns behavior and component choices.

## Colors

Light roles are oat canvas, paper panels, forest actions, deep green ink, and muted green supporting text. Sage, lilac, sunlight, and clay identify useful regions/tasks rather than tinting every surface green. The forest sidebar keeps dedicated inverse text, hover, selected, divider, and focus tokens under `--dashboard-sidebar-*`, independently of the optional action accent.

Dark mode and alternate accents use the existing semantic aliases in theme.css. Selection/hover fill follows the current surface and accent: light/dark selection 8%/14%, emphasized 14%/22%, hover 5%/8%. Do not copy these constants into screens.

Gold resource ratings use the existing warning/gold utility palette with readable text; a rating is not a warning banner. Selected heart reactions use the shared destructive/red palette. Destructive/removal actions remain visibly red through the canonical button variant. Promotional artwork may use authored colors; disclosures and controls keep themed contrast.

## Typography

Local DM Sans is the body/control face and local Lora the editorial display face. PageHeader is regular-weight Lora, 32px narrow/40px desktop; sections use 24px/28px. Body is 18px/28px, controls 16px/24px, and captions/badges at least 14px/20px. Use named rem-based utilities and preserve wrapping. Technical values use system monospace.

[Copy casing](docs/STRINGS.md#copy-casing) distinguishes Title Case labels/actions from sentence-case prose. Every authored string and alt description lives in `src/strings.ts`.

## Layout

Page → one PageHeader → purposeful work surfaces. The shell header supplies context, not a second title. Desktop uses a fixed 17.5rem forest sidebar from 64rem; navigation scrolls independently above the account. The sidebar has no promotional/care-note card. Below 64rem use the shared full-screen navigation with safe areas, Escape, focus trap, and restoration.

Directories reuse shared filtering/paging and responsive record patterns; wide tables own a labeled horizontal scroller. Long forms scroll naturally, with actions sticky only where space permits. Community combines Posts/Polls through the shared segmented controller. Inbox content uses separated ivory cards and a clear unread hierarchy instead of a dense tinted wall. Parallel staff work cards stretch content and align their CTAs.

## Elevation & Depth

Borders and surface contrast carry structure. Reuse theme-owned card, shell, and overlay shadows. Primary actions retain the established restrained accent treatment; ordinary fields/records do not acquire arbitrary gradients or shadows.

## Shapes

Fields use 12px corners, cards/dialogs 20px, actions the shared capsule radius, and IconTile round pastel surfaces. Large illustration regions may have organic corners. Selected strokes stay inset; pending states preserve geometry. Overlays stay within dynamic viewport/safe-area bounds.

## Components

Import shared owners from `@/components/ui`. Their runtime path is theme tokens → shared styles/components → domain screens. Preference services and providers own saved light/dark/accent/motion choices; ThemeScript applies validated values before hydration.

Use StarRating/RatingSummary for gold resource feedback, ReactionButton for confirmed heart reactions, and Accordion for animated disclosures. Dropdown triggers retain their layout width; popups size to the longest option, at least the trigger width, clamped to the viewport. See the [canonical map](docs/UI_SYSTEM.md#canonical-ui-map).

Motion uses shared 90/140/200/240ms press/feedback/selection/entrance tokens. Device and saved reduced motion suppress CSS/JavaScript movement while state, focus, and placement still update. Keep interactions purposeful: FAQ open/close, star feedback, heart confirmation, and reordering, rather than continuous decoration.

## Illustrations And Fonts

Original PNG illustrations and bundled fonts came from the supplied product reference. The three `*-v2.png` botanical scenes were generated for GentlePath. Keep the files as maintained assets; generation transcripts and interface screenshots are not runtime dependencies.

| Asset Group | Use |
| --- | --- |
| `public/gentlepath/brand-mark.svg` | Shared brand identity |
| `winding-path`, `care-notes`, `care-folder`, `caregiver-community`, `growing-together`, `parent-and-child` PNGs | Existing product illustrations |
| `path-landscape-v2.png` | Sunlit landscape for public/auth/family/admin regions |
| `reading-garden-v2.png` | Journal, reading, and resource regions |
| `community-garden-v2.png` | Community/communication regions |
| `public/gentlepath/fonts/` | Local DM Sans and Lora; no font network dependency |

All PNG names above are under `public/gentlepath/`. Use responsive images and catalog alt text. Never embed phone/UI reference mockups as the product interface.

## Do's And Don'ts

Reuse the palette, typography, shared controls, semantic states, and motion ownership. Check a sibling screen before introducing a variant. Do not redesign identity for one feature, add fixed feature palettes, recreate shared controls locally, or let artwork reduce control/disclosure contrast. Verify [keyboard, themes, narrow layouts, and recovery](docs/VERIFICATION.md).
