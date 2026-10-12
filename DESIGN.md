---
version: alpha
name: Portal
description: A readable operational workbench with the reusable LeafLaunch component foundation, shared motion, and accent-aware light and dark surfaces.
colors:
  surface: '#ffffff'
  background: '#f7fafb'
  text: '#111827'
  muted: '#596579'
  border: '#e5e7eb'
  primary: '#17665f'
typography:
  sans:
    fontFamily: 'IBM Plex Sans, system-ui, sans-serif'
    fontSize: '1.125rem'
    lineHeight: '1.75rem'
  mono:
    fontFamily: 'IBM Plex Mono, ui-monospace, monospace'
rounded:
  DEFAULT: '0.625rem'
  card: '0.875rem'
spacing:
  panel: '1.5rem'
  field-gap: '1rem'
components:
  button:
    rounded: '0.625rem'
  card:
    rounded: '0.875rem'
  input:
    rounded: '0.625rem'
  dialog:
    rounded: '1.25rem'
---

# Portal design context

## Overview

Portal is an English-language starter for operators managing people, requests, and conversations. The reusable LeafLaunch Web foundation is part of every new project: shared controls, page patterns, mobile navigation, motion, and theming. Product register governs the authenticated application. `/dev-settings/components` is the protected, local component library; `/experience` remains the optional immersive showcase. Neither preview promises live business integrations.

The signature is a readable operational workbench with an accent-aware rounded sidebar, flat record surfaces, and measured selection motion. Preserve Portal's identity and routes. Aqua remains the default; Leaf green is an optional palette. Existing saved light/dark and accent choices remain valid. Avoid decorative nested cards and marketing effects in routine data entry.

Runtime CSS is canonical (ownership model B). `src/app/theme.css` owns every palette, semantic role, state alpha, type size, radius, shell shadow, and motion token. The former `semantic-tokens.css` overrides are retired. `globals.css` imports focused shared behavior styles. This document mirrors accepted values and intent; it does not generate a second theme.

## Colors

Light mode uses the exact surface/background/text/muted/border values above. The default Aqua action derives from `--color-brand-800` (#17665f); optional accents use their deep palette shade for readable light-mode actions. Dark mode uses #0d141b for the canvas and #141c24 for panels, lighter text, and the selected accent's brighter shade. Leaf green uses #16803c in light mode and #70e69b in dark mode.

Selection fill mixes the selected accent into the current surface: 8% in light mode and 14% in dark mode. Emphasized surfaces use 14%/22%; hover uses 5%/8%; soft selected borders use 50%/55%. These percentages belong to theme.css. Tiles, chips, section cards, sidebar selection, and listbox options share these roles. Never mix an optional accent into a fixed mint background. Focus rings and filled checkbox/radio/switch frames retain strong semantic strokes. Success, warning, and danger remain independent of brand choice.

## Typography

Actions, titles, field labels, navigation, table headers, options, and short statuses use Title Case (every word capitalized); descriptions and validation use sentence case. Follow [copy casing](docs/STRINGS.md#copy-casing), including preserved acronyms and brand spelling.

IBM Plex Sans owns body and headings through Next font variables; IBM Plex Mono owns technical values. Body: 18px/28px. Controls, navigation, labels, and table values: 16px/24px. Captions, badges, and table headers: at least 14px/20px. Use rem-based named utilities, allow labels to wrap, and keep the root font size independent of spacing. All authored display copy belongs in src/strings.ts.

## Layout

AppShell owns a fixed 17rem sidebar at 64rem and above. Short screens scroll the sidebar without trapping the document. Below 64rem, a full-screen Radix navigation menu supplies the same destinations, account block, focus trap, Escape, and safe-area padding. The header shows workspace context and theme control. Screens own their PageHeader h1; the component specimen uses a lower heading level.

Page → PageHeader → content. Directories use DataPanel and DataTable; mobile summaries use MobileRecordRow below 48rem. Tables without summaries keep a labeled, focusable horizontal scroller. Settings use SectionStack/SplitSection; explicit actions use FormActions, with sticky actions only on spacious desktop. Document scrolling remains natural for forms and inactive panels remain mounted for drafts.

Component-library navigation uses one scroll legend. It stays to the left on desktop and becomes a wrapping list at compact widths. There is no second section dropdown.

## Elevation & Depth

Borders and surface contrast carry structure. theme.css owns the subtle shared card shadow, stronger sidebar shadow, and overlay shadow. Primary actions and accented section previews use the established restrained gradients. Avoid arbitrary per-screen shadows or gradients on ordinary inputs and records.

## Shapes

Control corners use 10px; cards use 14px; larger dialogs retain the 20px family. The sidebar uses a 36px outer corner. Selected strokes are inset so state changes preserve geometry. Busy buttons preserve their labels' footprint and accessible name. Overlays stay inside dynamic viewport and safe-area bounds.

## Components

`src/components/ui` and its barrel own reusable primitives. See [UI system](docs/UI_SYSTEM.md) for the inventory and extension workflow. Domain services stay in modules; shared controls receive data and callbacks. Assistant/media components never acquire LeafLaunch backend dependencies.

| Role                  | Canonical runtime path                                                           | Consumers                                                 |
| --------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Palette and surface   | theme.css → --color-accent / --color-surface / --color-bg-*                      | all shared UI                                             |
| Selection alpha       | `--selection-*-opacity` → `--color-selection-*`                                   | tiles, chips, listboxes, section cards, navigation        |
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
