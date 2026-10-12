# Reusable UI foundation

Every Portal project starts with the LeafLaunch Web component foundation in `src/components/ui`. Open the authenticated `/dev-settings/components` route to inspect foundations, motion, page patterns, controls, states, tables, reordering, Markdown, and media. Examples use local state only. Appearance and the library share the same theme/motion controls. The component page has one scroll legend and no duplicate section dropdown.

## Ownership and inventory

Import components from `@/components/ui`. Search this library before creating another control. Keep independent models under `src/components/ui/models`; feature models and server orchestration remain in their domains. All labels, previews, accessibility text, and formatters belong in `src/strings.ts`.

| Family                 | Shared building blocks                                                                                                                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundations            | UiIcon, IconTile, InitialsAvatar, Button/IconButton, Spinner, semantic color/type/radius/motion tokens                                                                                                                 |
| Forms                  | Field, Input/PasswordInput, TextArea, Select/MultiSelect, ColorInput, MoneyInput, AddressSelect, TimezoneSelect, Checkbox/Radio/Switch, RadioCard, SelectionTile/SelectionChip, ConfirmationChoice, FileInput/DropZone |
| Page composition       | Page, PageHeader, Breadcrumbs, PageSection, SectionStack/SplitSection, FormSection/SectionCard/SectionCardView, FormActions, DescriptionList, Card/CardView, DataPanel                                                 |
| Records and navigation | DataTable, MobileRecordRow, TableRowLink, DirectoryFilters/DirectoryMultiFilters, DirectoryPagination, ListGroup/ListRow, ReorderableList, Stepper, responsive segmented navigation and persistent panels              |
| Feedback and layers    | Message, Badge/Chip, QueryBoundary/InlineLoading, EmptyState/ErrorState/RecoveryButton, Tooltip, InfoPopover, IconMenu, Modal, AlertModal, SheetPanel, ToastStack                                                      |
| Media and editing      | ImageMosaic/ImagePreview, RecordThumbnail, MarkdownEditor/MarkdownContent, location/timezone schedule summaries and local-time fields                                                                                  |
| Reviewed assistance    | FloatingAssistantProvider, FloatingAssistant, ReviewedDraftAssistant/ReviewedDraftChat, typed suggestion review, optional browser dictation                                                                            |
| App shell              | AppSidebar, SidebarLinks, SidebarSwitcherDisclosure, MobileNavigationMenu, AppShell                                                                                                                                    |

LeafLaunch's product upload, product image generation, marketing persistence, business roles, and backend-specific widgets are not coupled into this base library. Generic controls receive data and callbacks. A consuming module owns authorized file retrieval, generation, validation, persistence, and query invalidation. The reviewed-assistant callback must use the existing domain service → API client → authenticated proxy architecture.

## Start a screen

Use Page → one PageHeader → work surfaces. The shell header supplies workspace context, not a duplicate page title. PageHeader's lower heading level is reserved for component specimens.

Directories use DataPanel, DirectoryFilters, embedded DataTable, and DirectoryPagination. Supply stable row keys, a visible record link, and optionally MobileRecordRow for narrow browsers. Rows preserve modifier-click and keyboard link behavior. A wide table without a mobile renderer has its own labeled, focusable horizontal scroller. DirectoryFilters owns 300ms debounce, IME-safe submission, immediate clearing, and input focus restoration; domains own committed URL state and stale-request handling.

Forms/settings use SplitSection and FormActions. Do not constrain a long form to a table's viewport frame. Button loading retains geometry and accessible copy. Field associates native and authored controls explicitly. Date/time controls intentionally retain their platform popup; Select/MultiSelect own popup geometry, typeahead, keyboard selection, and collision through React Aria.

## Theme and state

`src/app/theme.css` is the only runtime color source. The old secondary token overrides are removed. Aqua remains the default and 16 accent presets are supported, including Leaf green. ThemeScript validates stored values before hydration. The container constructs preference services; providers apply saved preferences and synchronize browser tabs. Blocked storage produces an inline failure without pretending the choice was saved.

Selection uses `--color-selection-fill`, `--color-selection-hover`, and `--color-selection-border`. Their opacity changes with light/dark mode and their hue follows the selected accent. Tiles, chips, listboxes, navigation, and section-card hover/selected states share these roles. Checkbox and focus semantics retain stronger strokes. Keep state opacity in theme.css, not in per-component constants.

## Motion, panels, and steppers

`styles/motion.css` and theme timing tokens own presses, switches, checkbox marks, segmented movement, list transitions, popups, and overlays. JavaScript animation uses `motionPreferences.ts` and `useListMotion`. Both device reduced motion and the saved Reduced preference win. Positioning, visibility, state, and focus still update immediately.

SegmentedTabs is a native radio choice group. Two choices stay as a capsule on mobile; longer groups use the authored Select below 600px. The indicator measures actual labels and responds to resizing and font changes. SegmentedPanels keeps inactive drafts mounted with hidden/inert semantics.

Stepper uses the LeafLaunch horizontal bars by default. Pass `orientation="vertical"` for connected stacked stages or `orientation="responsive"` for container-driven switching at 34rem. The library shows horizontal and vertical examples together. Completed/current/upcoming state and disabled eligibility come from the caller. Stages are real buttons with `aria-current="step"`, numbered/check markers, full descriptions, visible focus, and 44px targets.

## Overlays and guarded drafts

Use PresentationProvider for queued alerts, sheets, and toasts; use Modal for composed forms. Preserve focus restoration, Escape, safe actions first, dynamic viewport bounds, and safe-area spacing. The direct react-aria dependency is pinned to the exact version used by react-aria-components so they share PortalProvider context. Keep these versions aligned during upgrades. React Aria popup portals in Modal stay inside its focus scope; closing a popup with Escape does not close the parent modal. Toasts sit above the overlay stack.

NavigationGuardProvider and useUnsavedFormGuard are available to forms. The shell navigates through useGuardedNavigate. Register dirty/busy refs, pass guarded navigation to breadcrumbs/links, and clear dirty state only after successful save/discard. Guard registration does not automatically intercept every arbitrary Next Link or browser history action. Never store private drafts or credentials in browser storage. Optional dictation starts only after an explicit user action; generated suggestions require review and a separate save.

## Verification and extension

`npm run check` runs ESLint with zero warnings allowed, route-aware TypeScript, the Next.js editor plugin diagnostics, centralized-copy checks, semantic-color checks, the shared-control guard, and Tailwind canonical-class checks. Native button/input/select/textarea/table authoring belongs inside the library.

Server Components import `@/components/ui` (for example `not-found.tsx`), so every interactive file the barrel exports keeps `'use client'`; removing it pulls hooks into the server graph and fails the build. Next's plugin warns when a `'use client'` export declares function props in an inline object type, so those components declare a named props `interface`. Files imported only by client modules, such as providers, internal hooks, and sub-parts, do not need the directive. Literal colors/fixed palettes outside theme.css are rejected. Run `DEMO_MODE=true npm run build`, `git diff --check`, and focused demo workflows. Do not write tests.

Add preview states for new reusable controls here. Verify desktop/narrow layout, keyboard, light/dark accents, disabled/busy/error states, popups, and reduced motion. Keep domain integration evidence distinct from component previews. See [verification](VERIFICATION.md), [design context](../DESIGN.md), and [UX contract](../UX-CONTRACT.md).

## Address data attribution

Country/region labels in `src/strings.ts` retain the country-region-data notice:

```text
The MIT License (MIT)

Copyright (c) 2022 Benjamin Keen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
