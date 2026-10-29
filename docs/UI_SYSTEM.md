# UI System And Interaction Contract

[DESIGN.md](../DESIGN.md) owns visual intent; [theme.css](../src/app/theme.css) owns runtime tokens. This guide owns shared controls, observable behavior, accessibility, and layout. [Product rules](GENTLEPATH.md) and [integration boundaries](INTEGRATIONS.md) remain authoritative for permissions and lifecycle.

Import from `@/components/ui`; inspect `/dev-settings/components` before adding an equivalent control. Feature services own retrieval, persistence, authorization, and invalidation. Generic UI receives data and callbacks. All labels, errors, previews, and accessible names come from [the strings catalog](STRINGS.md).

## Canonical UI Map

| Capability     | Canonical Owner                                         | Source Of Truth     | Allowed Variants                                                   | Verification                                           |
| -------------- | ------------------------------------------------------- | ------------------- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| Select/Listbox | shared Select/MultiSelect, AddressSelect/TimezoneSelect | This Guide + DESIGN | authored trigger; content-sized collision-aware popup              | long options, viewport clamp, keyboard, modal Escape   |
| Date           | Field/Input and shared schedule fields                  | This Guide + DESIGN | native date/time/datetime-local, OS popup geometry/locale accepted | date-only versus instant, keyboard/browser             |
| Form           | Field/Input, module Zod schema, FormActions             | This Guide + DESIGN | create/edit/read-only; associated validation                       | first invalid focus, success/failure, retained draft   |
| Scrollbar      | globals.css and theme tokens                            | This Guide + DESIGN | document/table/chat/overlay, engine fallbacks                      | visible/usable, forced colors, narrow layout           |
| Toast          | PresentationProvider                                    | This Guide + DESIGN | success/info/warning/error                                         | live region; critical errors also inline               |
| CRUD           | domain services, query hooks, guarded navigation        | This Guide + DESIGN | lifecycle from owning product contract                             | full demo flow and recovery                            |
| Rating         | StarRating/RatingSummary                                | This Guide + DESIGN | native 1–5 radios and aggregate summary                            | hover/focus, keyboard, pending/rollback, gold contrast |
| Reactions      | ReactionButton                                          | This Guide + DESIGN | pressed/count, outlined/filled heart                               | confirmed animation, errors, reduced motion            |
| Disclosure     | Accordion                                               | This Guide + DESIGN | accessible multi-open FAQ, retained answers                        | open/close motion, keyboard, reduced motion            |
| Reordering     | ReorderableList                                         | This Guide + DESIGN | pointer, handle arrows, explicit move controls                     | stable IDs/content, focus, narrow layout               |

## Compose A Screen

Use Page → one PageHeader → work surfaces. Directories use DirectoryFilters/DirectoryMultiFilters, DataPanel/DataTable where appropriate, and DirectoryPagination. Supply stable keys and visible record links. Use MobileRecordRow for compact summaries; a wide table without one owns a labeled focusable horizontal scroller. Do not put long forms in table-sized frames.

Settings/forms use SplitSection, SectionStack, Field, and FormActions. Other canonical owners include Button/IconButton, UiIcon/IconTile, badges/chips, QueryBoundary/EmptyState, Modal/AlertModal/SheetPanel, Markdown/media controls, Stepper, and persistent segmented panels. Optional reviewed assistance stays callback-driven; no generation, microphone request, or save occurs automatically.

## Navigation And Async State

Use shared NavigationLink with the navigation guard for guarded links. Clean forms retain synchronous Next Link history/prefetch and modifier-click semantics. Committed client filters/pages use the supported History API; server-prop filters use router pushes. Back/Forward restores the previous page and filters. Private journal search stays local.

Guard registration alone does not intercept every arbitrary link or browser-history action. Register dirty/busy refs through useUnsavedFormGuard, pass guarded navigation to relevant actions, and clear dirty state only after successful save/discard. Never persist private drafts in browser storage.

Show initial loading, background refresh, empty/no-results, and recoverable errors distinctly. Cancel/ignore superseded searches; debounce composition-safe remote search, clear immediately, and restore input focus. Keep safe mounted forms during transient refresh failures. Do not retain inaccessible content after 401/403/404. Mutations prevent duplicate submissions and retain inputs on failure; success feedback follows server confirmation.

## Controls, Icons, And Destruction

Button loading preserves dimensions and accessible name. Badge/Chip content and UiIcon keep icons inline with text; do not add block wrappers that stack a leading icon over its label. Every icon-only action needs an accessible name.

Use `variant="destructive"` for delete, remove, archive, unpublish, discard, and disabling/reducing access. Conditional save/unlike controls use destructive colors only in the removal state. Confirm consequential actions through PresentationProvider with danger tone, object/scope/consequence, and the safe action initially focused. Do not style ordinary filter clearing or cancellation as destructive.

Select/MultiSelect keep the trigger's authored width. The popup uses the longest option's intrinsic width, at least the trigger width, capped inside the viewport; wrap only when the viewport requires it. Preserve selected/disabled/highlight/focus states, visible scrolling, typeahead, and keyboard selection. Address/timezone/compact-segmented choices use this same owner.

Date of birth is date-only and serialized at UTC midnight; observations/schedules are instants displayed in the browser timezone with en-US formatting. Native picker geometry/language remains platform-owned. Use noValidate and schema messages, label/error associations, masked passwords with proper autocomplete, and first-invalid-field focus. Textareas stay within layout with sufficient writing space.

## Layers, Focus, And Motion

Use Modal for composed forms and PresentationProvider for queued confirmations, sheets, and toasts. Honor Escape, focus trap/restoration, safe areas, and reachable actions in long content. Modal supports initialFocusRef. React Aria popups portal inside the modal's focus scope; Escape closes the popup before its parent. Higher confirmation layers must not dismiss/reopen the underlying dialog. Dirty guards share one pending discard decision.

Segmented choices use native radio semantics; more than two choices become Select below 600px. Persistent SegmentedPanels keep inactive drafts mounted/hidden/inert. Stepper eligibility and current/completed state belong to the caller; orientation does not change state. Reordering preserves handle focus after moves, including Safari.

Shared motion CSS/helpers read theme timing and device/saved reduced-motion preferences. React Aria DisclosurePanel owns measured open/close height and exit timing. Rating/reaction feedback uses their shared owners. Do not introduce per-screen timing constants or animate when reduced motion is active.

## Extending Shared UI

Interactive components exported from the UI barrel retain `'use client'` and named props interfaces; server consumers import that barrel too. Internal client-only subparts need no redundant boundary. Keep react-aria and react-aria-components on compatible shared PortalProvider versions.

Extend the canonical owner before adding a local equivalent. Add component reference states where relevant and verify a sibling workflow. [Verification](VERIFICATION.md) covers checks, keyboard, popups, narrow layouts, themes, and recovery; static audits supplement browser evidence.

## Address Data Attribution

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
