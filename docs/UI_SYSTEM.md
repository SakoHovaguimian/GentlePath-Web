# UI System And Interaction Contract

[DESIGN.md](../DESIGN.md) owns visual intent; [theme.css](../src/app/theme.css) owns runtime tokens. This guide owns shared controls, observable behavior, accessibility, and layout. [Product rules](GENTLEPATH.md) and [integration boundaries](INTEGRATIONS.md) remain authoritative for permissions and lifecycle.

Import from `@/components/ui`; inspect `/dev-settings/components` before adding an equivalent control. Feature services own retrieval, persistence, authorization, and invalidation. Generic UI receives data and callbacks. All labels, errors, previews, and accessible names come from [the strings catalog](STRINGS.md).

## Canonical UI Map

| Capability     | Canonical Owner                                         | Source Of Truth     | Allowed Variants                                             | Verification                                            |
| -------------- | ------------------------------------------------------- | ------------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| Select/Listbox | shared Select/MultiSelect, AddressSelect/TimezoneSelect | This Guide + DESIGN | authored trigger; content-sized collision-aware popup        | long options, viewport clamp, keyboard, modal Escape    |
| Date           | DatePicker, Field/Input, shared schedule fields         | This Guide + DESIGN | authored family birthdays; native remaining date/time fields | date-only/instant, themed calendar, keyboard/Escape     |
| Form           | Field/Input, module Zod schema, FormActions             | This Guide + DESIGN | create/edit/read-only; associated validation                 | first invalid focus, success/failure, retained draft    |
| Scrollbar      | globals.css and theme tokens                            | This Guide + DESIGN | document/table/chat/overlay, engine fallbacks                | visible/usable, forced colors, narrow layout            |
| Toast          | PresentationProvider                                    | This Guide + DESIGN | success/info/warning/error                                   | live region; critical errors also inline                |
| CRUD           | domain services, query hooks, guarded navigation        | This Guide + DESIGN | lifecycle from owning product contract                       | full demo flow and recovery                             |
| Rating         | StarRating/RatingSummary                                | This Guide + DESIGN | native 1–5 radios and aggregate summary                      | hover/focus, keyboard, pending/rollback, theme contrast |
| Reactions      | ReactionButton                                          | This Guide + DESIGN | pressed/count, outlined/filled heart                         | confirmed animation, errors, reduced motion             |
| Save/Bookmark  | BookmarkButton, SavedContentButton                      | This Guide + DESIGN | compact bookmark + Save/Saved; filled when saved; card menu  | direct toggle, pending/error, confirmed success         |
| Card Actions   | IconMenu, semantic stretched links/buttons              | This Guide + DESIGN | top-right vertical ellipsis; permission-aware actions        | independent controls, keyboard, modal/details entry     |
| Disclosure     | Accordion                                               | This Guide + DESIGN | accessible multi-open FAQ, retained answers                  | open/close motion, keyboard, reduced motion             |
| Reordering     | ReorderableList                                         | This Guide + DESIGN | pointer, handle arrows, explicit move controls               | stable IDs/content, focus, narrow layout                |

## Compose A Screen

Use Page → one PageHeader → work surfaces. PageHeader keeps a compact sage surface by default; owning intro wrappers can supply lilac or sunlight through `--page-header-tint`. Header icons are omitted; title, supporting copy, and actions remain together. Directories use DirectoryFilters/DirectoryMultiFilters, DataPanel/DataTable where appropriate, and DirectoryPagination. Supply stable keys and visible record links. Use MobileRecordRow for compact summaries; a wide table without one owns a labeled focusable horizontal scroller. Do not put long forms in table-sized frames.

Settings/forms use SplitSection, SectionStack, Field, and FormActions. Light/Dark previews use the fixed target palette tokens, independent of the current active theme. HorizontalCarousel owns manual, scroll-snapped card rails with previous/next controls, touch/trackpad scrolling, keyboard operation, and reduced-motion scrolling. Other canonical owners include Button/IconButton, UiIcon/IconTile, badges/chips, QueryBoundary/EmptyState, Modal/AlertModal/SheetPanel, Markdown/media controls, Stepper, and persistent segmented panels. Optional reviewed assistance stays callback-driven; no generation, microphone request, or save occurs automatically.

## Navigation And Async State

Query failures and route errors share ErrorState: a neutral paper surface, a small amber warning icon, clear title/supporting copy, and a compact forest Try Again action. The action wraps below the copy in narrow panels and keeps its natural width. Omit redundant Error badges and large pink fills for recoverable reads. Retain alert semantics and specific authentication/permission/not-found messages. A query retry keeps its panel and previous message mounted, exposes pending state, and prevents duplicate clicks; failure restores keyboard focus to the retry action unless the user has moved elsewhere. Initial loads keep the normal loading treatment. Community and poll directory changes keep previous results mounted while fetching. Their Posts/Polls navigation prepares the target query and ballots before committing the route, preserving history and unsaved-choice guards; busy surfaces use a progress cursor. Shared ContentTransition animates confirmed content changes without remounting forms, and respects both motion preferences.

Use shared NavigationLink with the navigation guard for guarded links. Clean forms retain synchronous Next Link history/prefetch and modifier-click semantics. Committed client filters/pages use the supported History API; server-prop filters use router pushes. Back/Forward restores the previous page and filters. Private journal search stays local.

Guard registration alone does not intercept every arbitrary link or browser-history action. Register dirty/busy refs through useUnsavedFormGuard, pass guarded navigation to relevant actions, and clear dirty state only after successful save/discard. A confirmed discard releases the dirty ref immediately so navigation can continue while the destination loads; Keep Editing retains both the draft and its guard. Never persist private drafts in browser storage.

Place visible field labels above text fields, dropdowns, and search inputs, including directory filters. Shared Field has one vertical layout.

Show initial loading, background refresh, empty/no-results, and recoverable errors distinctly. Cancel/ignore superseded searches; debounce composition-safe remote search, clear immediately, and restore input focus. Keep safe mounted forms during transient refresh failures. Do not retain inaccessible content after 401/403/404. Mutations prevent duplicate submissions and retain inputs on failure; success feedback follows server confirmation.

PublicImageField in `services/media/components` composes the shared Field/Input/FileInput/Button controls with the container-owned upload hook. Guide covers/steps and milestone editors share URL validation, image preview/failure fallback, replacement/removal, public-visibility copy, file limits, cancellation, and busy behavior. Pending uploads retain the current preview and disable saving/navigation; failures keep the draft and current image available for recovery.

## Controls, Icons, And Destruction

MultiSelect’s selection formatter receives the count and selected labels. Its optional maximum selection count disables only unselected choices at the limit, leaving selected choices removable and Clear available; Select All is unavailable if the full set exceeds that limit. A visible Field label supplies the accessible name without a duplicate aria-label. Directory filters may summarize the count; form fields such as journal feelings show comma-separated labels. Both use the same keyboard-operable popup and clear action.

Button loading preserves dimensions and accessible name. Badge/Chip content and UiIcon keep icons inline with text; do not add block wrappers that stack a leading icon over its label. Every icon-only action needs an accessible name.

Use `variant="destructive"` for delete, remove, archive, unpublish, discard, and disabling/reducing access. It renders red text/icons on a transparent surface without a border or selection stroke; keyboard focus remains visible. Browser notification disabling and the account-deletion entry action are explicit exceptions: their destructive color has a 15% alpha background, with a 20% hover fill. Bookmark toggles retain their ordinary tone: a close-set bookmark + Save becomes a filled bookmark + Saved, and a second click unsaves directly without removal confirmation or removal toast. BookmarkButton owns the confirmed unsaved-to-saved particle burst; initial loading, saved hydration, failure, and unsaving do not animate. The animation surface stays mounted outside the button's busy content. Submit saves use BookmarkButton without toggle semantics and may show Saved while their clean confirmed draft remains mounted. Vote submission uses Cast Vote through an ordinary Button, keeping the bookmark action separate. General Save Changes actions retain the primary variant; platform-impact warnings belong to the confirmation. Selected heart reactions retain filled red hearts and Like/Liked copy. Confirm consequential actions through PresentationProvider with danger tone, object/scope/consequence, and the safe action initially focused. Do not style ordinary filter clearing or cancellation as destructive.

Record cards open their details/editor through a native stretched link or button; sibling actions remain above the stretched target and independently keyboard reachable. The shared `ui-card-open` utility is available for ordinary Card surfaces. Card actions live in the top-right IconMenu, whose default trigger is a vertical ellipsis without a chevron. Items support disabled/selected state and the destructive variant. Keep edit/delete out of card bodies and footers, and expose deletion inside editable record flows where the domain permits deletion. Account settings, preferences, and role administration keep their established lifecycle and ownership limits.

Resource rating removal has no destructive button. Selecting the currently selected star opens an app-owned confirmation with Keep Rating focused; confirming clears the rating. Arrow-key changes continue to select a new rating normally.

Select/MultiSelect keep the trigger's authored width. The popup uses the longest option's intrinsic width, at least the trigger width, capped inside the viewport; wrap only when the viewport requires it. Preserve selected/disabled/highlight/focus states, visible scrolling, typeahead, and keyboard selection. Address/timezone/compact-segmented choices use this same owner.

Date of birth is date-only and serialized at UTC midnight; observations/schedules are instants displayed in the browser timezone with en-US formatting. Family profile birthdays use the shared React Aria DatePicker: typed date segments plus an app-owned, accent-colored calendar with en-US labels, disabled future dates, keyboard navigation, and nested Escape/focus restoration. Other date/time fields retain their accepted native popup geometry/language. Use noValidate and schema messages, label/error associations, masked passwords with proper autocomplete, and first-invalid-field focus. TextArea defaults to one initial row and auto-grows for typed or restored content and width changes; editor callers retain that default. Names remain single-line Input fields.

## Layers, Focus, And Motion

Help FAQs use the shared Accordion with the plum tone: hover and expanded titles are purple, with the same measured panel animation and reduced-motion behavior. Notification inbox records use compact linked titles, explicit read toggles, and unboxed destructive archive icons. Mark All As Read is always visible beside Notification Settings in the page header and applies to the whole inbox independently of active filters; Manage retains scoped bulk operations.

Use Modal for composed forms and PresentationProvider for queued confirmations, sheets, and toasts. Consecutive alerts start with the safe action focused and preserve the original workflow trigger for restoration. Honor Escape, focus trap/restoration, safe areas, and reachable actions in long content. Modal supports initialFocusRef. React Aria popups portal inside the modal's focus scope; Escape closes the popup before its parent. Higher confirmation layers must not dismiss/reopen the underlying dialog. Dirty guards share one pending discard decision.

Segmented choices use native radio semantics; more than two choices become Select below 600px. Persistent SegmentedPanels keep inactive drafts mounted/hidden/inert. Stepper eligibility and current/completed state belong to the caller; orientation does not change state. Reordering preserves handle focus after moves, including Safari. ReorderableList supports separate card rows; guide steps use this variant inside a bare SplitSection to avoid nested panels.

Shared motion CSS/helpers read theme timing and device/saved reduced-motion preferences. React Aria DisclosurePanel owns measured open/close height and exit timing. Rating/reaction feedback uses their shared owners. SuccessCelebration adds a bounded confetti/particle burst after confirmed save, vote, and discussion submissions; it never animates initial hydration or failure. Do not introduce per-screen timing constants or animate when reduced motion is active.

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
