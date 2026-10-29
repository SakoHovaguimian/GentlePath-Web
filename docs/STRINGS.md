# Strings and content

**Every authored user-visible string belongs in the single [src/strings.ts](../src/strings.ts) file.** This includes JSX text, labels, placeholders, page metadata, buttons, table headers, validation/error messages, empty/loading states, toasts, dialog copy, accessible names, static demo content, and visible enum labels. English is the current language; browser locale is used only for the platform-owned date picker.

Import `strings` and, when needed, `labels` from `@/strings`. Both exports are defined directly in `src/strings.ts`. GentlePath domain groups also use named `*Strings` exports in that same catalog; they receive the same title-case checks. Organize copy with nested domain/screen keys inside that file. Do not create additional catalog files, a strings directory, or re-export shims. Shared accent, tone, and panel labels belong in the same file.

```tsx
import { strings } from '@/strings';
<Button>{strings.chat.send}</Button>;
```

Use a named formatter for variable copy, with typed parameters when adding new messages. Keep complete sentences together. Do not build sentences from translated fragments or use raw domain enum values as labels.

Technical identifiers are not display strings: routes, API keys/field names, protocol verbs and headers, schema enums, storage keys, analytics event names, CSS classes/tokens, SVG paths, and external user/backend content retain their original values. Sample credentials and authored fixture names are display/demo content, never production secrets. Real credentials must never enter the catalog.

## Copy casing

Use **Title Case** for actions and CTAs, page/section/card/dialog titles, text-field labels, navigation and tabs, table headers, filter/selection options, badges, short statuses, and toast titles. Apply the same case to accessible action names. This project's UI style capitalizes **every word**, including short words: `Save Changes`, `Date Of Birth`, `Back To Workspace`, and `Choose A Country`. Capitalize hyphenated words (`Dashboard-First Surfaces`), keep contractions together (`Doesn't`), and preserve acronyms and canonical brand spelling (`API`, `AI`, `iOS`, `macOS`).

Use sentence case for supporting descriptions, help/hints, complete validation/error messages, notification bodies, descriptive alt text, and instructional placeholders. Preserve the original case of user/backend content, geographic names, credentials, email addresses, URLs, version identifiers, units, and example Markdown/code. Do not transform copy at render time or use CSS capitalization; author the right case in the catalog.

The ESLint error rule `copy/title-case` checks `strings` and `labels` in `src/strings.ts`, including arrays, formatter template segments, and conditional output. `npm run check:strings` runs the same casing check alongside the inline-copy guard. The `addressCountries` dataset keeps its geographic spelling. Dynamic formatter parameters keep the caller's original data; formatter arguments such as locale codes and separators are not title-cased.

New catalog entries default to Title Case, so a new CTA key is checked even if its name is unfamiliar. Keys ending in `Title`, `Label`, `Heading`, `Header`, `Caption`, `Action`, `CTA`, `Button`, or `Column` are title roles. Description/hint/help/body/guidance/placeholder/alt/paragraph/explanation keys use sentence case, and sample/example/syntax keys preserve data spelling. Prefer semantic names such as `emptyTitle` and `emptyHint` when adding copy.

For a key whose role is ambiguous, put a reasoned annotation immediately before its property. An annotation on a group applies to its contents; keep exemptions narrow and never exempt an action or heading merely to silence lint.

```ts
saveChanges: 'Save Changes',
emptyTitle: 'No Requests Yet',
emptyHint: 'Create your first request to get started.',
// @sentence-case: Complete validation message.
invalidEmail: 'Enter a valid email address.',
// @preserve-case: Demo credential; casing must stay exact.
password123: 'password123',
```

`@title-case: Reason.` explicitly selects title casing when needed. Preserve mixed-case brand terms in the lint helper's canonical-word set before using them in title copy. The checker reviews authored literal output, not arbitrary computed expressions or external content; review those manually.

`npm run check:strings` statically finds JSX text, display attributes, and common string-literal patterns outside `src/strings.ts`. Only that exact file is exempt from the inline-copy check; the catalog itself is checked for casing. It is a guardrail, not a complete localization parser. Review interpolated copy, computed labels, metadata, validation, and externally supplied strings manually. Do not weaken its rules to permit new inline copy; identify technical identifiers explicitly when necessary.

Zod/service validation shown in product UI must use catalog messages or a catalog-backed error translation. Backend-provided messages are external content; never put them into the catalog dynamically. Avoid exposing unknown server exception text.
