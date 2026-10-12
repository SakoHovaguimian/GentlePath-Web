# Add a dashboard resource

Add its independent metadata/domain models, transport mapping, and dashboard service request. Define a query key and render loading/error/empty/data states using shared primitives. Add the same resource to the demo model registry and compute record counts from current authorized state after mutations. Dashboard authorization belongs to the backend and demo API. User-facing model and field labels belong in `src/strings.ts` or backend-provided display metadata. Update [BACKEND_CONTRACT.md](../BACKEND_CONTRACT.md).

Author model/field labels, headings, filters, and actions in Title Case per [copy casing](../STRINGS.md#copy-casing). Capitalize every word, preserve acronyms and brand spelling, and keep supporting prose in sentence case. Preserve external backend display metadata as supplied.
