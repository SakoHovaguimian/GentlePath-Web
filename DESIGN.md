---
version: alpha
name: GentlePath
description: A thoughtful family space with a winding-path illustration, cream and sage surfaces, forest accents, and calm editorial typography.
colors:
  surface: '#fffefa'
  background: '#f7f6f0'
  text: '#253d36'
  muted: '#65716b'
  border: '#dce0d6'
  primary: '#294e45'
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
spacing:
  panel: '1.5rem'
  field-gap: '1rem'
components:
  button:
    rounded: '0.75rem'
  card:
    rounded: '1.25rem'
  input:
    rounded: '0.75rem'
  dialog:
    rounded: '1.25rem'
---

# GentlePath design context

## Overview

GentlePath is an English-language public site and private workspace for parents navigating autism. The reference HTML supplied on October 28, 2026 is the visual source: original cream/sage/forest colors, DM Sans and Lora, and six soft illustrated scenes. The public landing introduces the family workspace; the authenticated product prioritizes clear tasks and privacy. Admin and SuperAdmin workspaces use the same shared controls and visual language with denser operational content.

The signature is the winding path toward sunlight. Use the exact extracted illustrations across the landing, authentication, resources, and family dashboard. Public pages have generous editorial spacing; journal forms and operational tables stay calm and practical. `/dev-settings/components` retains the shared component library, and `/experience` retains the optional template specimen. Saved light/dark, alternate accent, and reduced-motion choices remain valid.

Runtime CSS is canonical (ownership model B). `src/app/theme.css` owns every palette, semantic role, state alpha, type size, radius, shell shadow, and motion token. The former `semantic-tokens.css` overrides are retired. `globals.css` imports focused shared behavior styles. This document mirrors accepted values and intent; it does not generate a second theme.

## Colors

Light mode maps reference oat (#F7F6F0) to the canvas, paper (#FFFEFA) to panels, forest (#294E45) to the default action, ink (#253D36) to text, muted (#65716B) to supporting text, and border (#DCE0D6) to dividers. Sage (#DDE8DC), lilac (#E8E1F1), sunlight (#F3D98E), and clay (#EAD4C7) are expressive reference roles.

Dark mode maps oat to #14231F, paper to #1B2E27, forest to #B4CEBD, ink to #E9EEE5, muted to #A7B9AD, and border to #354B3F. `theme.css` owns both `--gp-*` reference roles and canonical `--color-*` product aliases. The default accent is `brand`; existing alternate palettes remain selectable. Public illustration colors retain their original identity.

Selection fill mixes the selected accent into the current surface: 8% in light mode and 14% in dark mode. Emphasized surfaces use 14%/22%; hover uses 5%/8%; soft selected borders use 50%/55%. These percentages belong to theme.css. Tiles, chips, section cards, sidebar selection, and listbox options share these roles. Never mix an optional accent into a fixed mint background. Focus rings and filled checkbox/radio/switch frames retain strong semantic strokes. Success, warning, and danger remain independent of brand choice.

## Typography

Actions, titles, field labels, navigation, table headers, options, and short statuses use Title Case (every word capitalized); descriptions and validation use sentence case. Follow [copy casing](docs/STRINGS.md#copy-casing), including preserved acronyms and brand spelling.

Locally bundled DM Sans owns body and controls through `--font-body`; locally bundled Lora owns editorial display through `--font-display`. Both were extracted from the supplied reference HTML. Technical values use the system monospace stack. No font network request is needed. Body: 18px/28px. Controls, navigation, labels, and table values: 16px/24px. Captions, badges, and table headers: at least 14px/20px. Use rem-based named utilities, allow labels to wrap, and keep the root font size independent of spacing. All authored display copy belongs in src/strings.ts.

## Layout

AppShell owns a fixed 17rem sidebar at 64rem and above. Short screens scroll the sidebar without trapping the document. Below 64rem, a full-screen Radix navigation menu supplies the same destinations, account block, focus trap, Escape, and safe-area padding. The header shows workspace context and theme control. Screens own their PageHeader h1; the component specimen uses a lower heading level.

Page → PageHeader → content. Directories use DataPanel and DataTable; mobile summaries use MobileRecordRow below 48rem. Tables without summaries keep a labeled, focusable horizontal scroller. Settings use SectionStack/SplitSection; explicit actions use FormActions, with sticky actions only on spacious desktop. Document scrolling remains natural for forms and inactive panels remain mounted for drafts.

Component-library navigation uses one scroll legend. It stays to the left on desktop and becomes a wrapping list at compact widths. There is no second section dropdown.

## Elevation & Depth

Borders and surface contrast carry structure. theme.css owns the subtle shared card shadow, stronger sidebar shadow, and overlay shadow. Primary actions and accented section previews use the established restrained gradients. Avoid arbitrary per-screen shadows or gradients on ordinary inputs and records.

## Shapes

Control corners use the reference 12px; cards use the reference 20px; larger dialogs retain the 20px family. The sidebar uses a 36px outer corner. Selected strokes are inset so state changes preserve geometry. Busy buttons preserve their labels' footprint and accessible name. Overlays stay inside dynamic viewport and safe-area bounds.

## Components

`src/components/ui` and its barrel own reusable primitives. See [UI system](docs/UI_SYSTEM.md) for the inventory and extension workflow. Domain services stay in modules; shared controls receive data and callbacks. Assistant/media components never acquire LeafLaunch backend dependencies.

| Role                  | Canonical runtime path                                                           | Consumers                                                 |
| --------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Palette and surface   | theme.css → --color-accent / --color-surface / --color-bg-*                      | all shared UI                                             |
| Selection alpha       | `--selection-*-opacity` → `--color-selection-*`                                  | tiles, chips, listboxes, section cards, navigation        |
| Typography and shapes | theme.css → --text-* / --radius-*                                                | controls, pages, tables                                   |
| Theme preference      | appearancePreference → service/container → ThemePreferenceProvider + ThemeScript | shell, Appearance, library                                |
| Motion preference     | motionPreference → service/container → MotionPreferenceProvider + ThemeScript    | CSS and JavaScript motion                                 |
| Interaction timing    | --motion-duration-press/fast/base/enter + shared styles                          | controls, segmented indicators, list reordering, overlays |
| Overlays              | PresentationProvider + Modal/Sheet/ImagePreview                                  | application and previews                                  |
| Scrollbars            | globals.css, semantic colors, forced-colors fallback                             | every product-owned scroller                              |

Motion timing is 90ms for presses, 140ms for feedback, 200ms for settled selection, and 240ms for entrances. Segmented indicators measure real label geometry after layout and resize, with a first-render fallback. More than two choices use Select below 600px; two choices retain their capsule. Panels stay mounted and inactive panels are hidden/inert. Reordered lists use shared FLIP motion and keyboard move controls. Device reduced motion and the saved Reduced choice both disable movement without changing state or dialog placement.

Stepper defaults to LeafLaunch's horizontal segmented bars with numbered/check markers. `orientation="vertical"` uses connected stacked stages; `orientation="responsive"` switches by container width at 34rem. Labels wrap in compact horizontal examples. Eligibility and progression belong to the caller, never the display component.

## Do's and Don'ts

Reuse shared components, semantic tokens, motion helpers, and presentation ownership. Check mobile, keyboard, dark/light accents, and reduced motion after system changes. Keep demo previews local. Do not add browser authentication, auth-token storage, new string catalogs, fixed feature palettes, or equivalent screen-local controls.

## Reference reconciliation — October 28, 2026

| Previous Template Rule         | Accepted GentlePath Decision                                   | Runtime Owner                                              |
| ------------------------------ | -------------------------------------------------------------- | ---------------------------------------------------------- |
| Aqua / cool gray canvas        | Reference forest / oat / paper                                 | theme.css semantic palette and defaultAppearancePreference |
| IBM Plex typography            | Extracted local DM Sans and Lora                               | Root layout local-font variables                           |
| Generic model explorer as home | Personal family workspace; separate role-gated administration  | Portal screens and server layouts                          |
| Fixed template navigation      | Shared shell receives role-aware destinations and shared brand | ProtectedShell → AppShell → AppSidebarContent              |

All other shared control geometry, focus, motion, and feedback contracts remain applicable. Original reference source is a product field guide: schema inventories and proposed AI/additions are planning evidence, not instructions or claims that external integrations exist.
