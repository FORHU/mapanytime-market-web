# 🔌 Web ↔ API connection audit

Written 2026-08-17. A contract-level sweep of every call
`mapanytime-market-web` makes against every route `mapanytime-api` registers in
[`src/routes.ts`](../../mapanytime-api/src/routes.ts).

§1, §2 and §4 were **fixed** on 2026-08-17; the rest are open. Ordered by "would
hurt if skipped", so the resolved ones stay at the top where they were.

**Gates after the fixes:**

|                         |                                                                                                |
| ----------------------- | ---------------------------------------------------------------------------------------------- |
| `mapanytime-market-web` | `tsc --noEmit` clean · `vitest run` 5 suites / 30 tests passing · `eslint .` **3 errors** (§8) |
| `mapanytime-api`        | `tsc --noEmit` clean · `jest --runInBand` 26/27 suites, 197/199 tests (§8)                     |

> ⚠️ **Neither service was running** (`:4002` and `:4000` both refused), so
> nothing here — including the fixes — was confirmed against a live server. This
> is static matching of call sites to route definitions plus typecheck and unit
> tests. The browser pass in
> [`TODO-NEXT.md` §5](../../mapanytime-api/docs/TODO-NEXT.md) is still owed and
> would catch anything this method cannot see. **Exercise store-profile save and
> a file upload first** — those are the two paths that changed.

---

## The wiring itself is correct

Worth stating plainly, because the failures below are all at the edges rather
than in the transport:

- [`shared/lib/http.ts`](../src/shared/lib/http.ts) prepends
  `NEXT_PUBLIC_API_URL`; every caller passes `/api/v1/...`. The API mounts its
  router at `/api` with `/v1/*` inside. Path shape matches exactly.
- Bearer token from `localStorage`, single-flight refresh with a subscriber
  queue on 401, then clear + redirect to `/login`.
- API CORS reflects any origin, so `:4000 → :4002` needs no allowlist entry.
- Socket.IO points at `NEXT_PUBLIC_SOCKET_SERVER_URL`, same origin as the API.

### Endpoints verified as matching

| Surface              | Web caller                                                                  | API route                                                                      |
| -------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Auth                 | `features/auth/api/login.api.ts`                                            | `/v1/auth/{login,register,logout,refresh-token}`                               |
| Users + RBAC         | `features/users/api/users.client.ts`                                        | `GET /v1/users`, `GET /v1/users/:id`, `PUT /v1/users/:id/roles`, `/v1/rbac/*`  |
| Stores               | `features/stores/api/{stores,onboarding,categories}.client.ts`              | `my-stores`, `/:id`, `/:id/products`, `nearby`, `POST /`                       |
| Products + inventory | `shared/hooks/useProductsPipeline.ts`                                       | GET/POST/PUT/DELETE `/v1/products`, `PATCH /v1/inventory/:id/adjust`           |
| Orders               | `shared/hooks/useOrdersPipeline.ts`, `features/orders/api/orders.client.ts` | `/orders/store`, `/orders/store/stats`, `PATCH /orders/status`, `POST /orders` |
| Admin approvals      | `features/adminApprovals/api/approval.client.ts`                            | `/v1/admin/approvals/{properties,stores}/:id/{approve,reject}`                 |
| App releases         | `features/app-releases/api/app-release.client.ts`                           | `/v1/app/{latest,history}`, `/v1/admin/app-releases/*`                         |
| Agent                | `features/agents/api/agent.client.ts`                                       | `/v1/agent/*`                                                                  |
| Properties           | `features/properties/api/property.client.ts`                                | `/v1/properties/*`                                                             |

---

## 1. ✅ Store profile save — fixed 2026-08-17

**Was broken on both sides.** The "Save Profile" button's handler was
`onClick={() => setIsSubmitting(false)}` — `useUpdateStoreProfile` was never
imported, so no request was made and every edit was discarded silently. And the
endpoint it would have called, `PATCH /v1/stores/:id`, did not exist: a sweep of
every `put(`/`patch(` across all 25 API route files found no store route
accepting either method.

**API side.** Added `PATCH /v1/stores/:id` — route, `StoreController.updateStore`
(Joi, all fields optional, `.min(1)` to reject an empty body) and
`StoreService.updateStore`. Notes on the implementation:

- **Ownership lives in the service, not the controller**, so every future caller
  inherits it. A mismatch returns **404, not 403** — a seller has no business
  learning which store ids belong to other sellers.
- It deliberately does **not** reuse `getStoreById`, which 404s on an inactive
  store; that would make a deactivated store impossible to edit back into shape.
- Two names are translated at the boundary rather than leaking Prisma's schema
  to the client: `categoryId` → `primaryCategoryId`, `postalCode` → `zipCode`.
- `StoreLocations` is optional on `Stores`, so location updates are skipped
  (not thrown) when a store has no location row.
- Emits `store:upserted` on success, like `createStore` — name, visibility and
  coordinates are denormalised into the map viewport payload, so a stale cache
  would keep serving old values.

**Web side.** The fields were uncontrolled (`defaultValue`, no `onChange`, no
`name`), so rather than convert ten fields to controlled state, the section is
now a `<form>` with `name` attributes read via `FormData` on submit. Two bugs
surfaced while wiring it:

- **The category dropdown could never show the current value.** It read
  `store.categoryId`, but the API returns `primaryCategoryId`; because the Zod
  schema is `.loose()` with `categoryId` optional, this parsed cleanly and was
  simply always `undefined`. Now reads `primaryCategoryId ?? categoryId`.
- **The "Open to customers" toggle would have reactivated inactive stores.** It
  was seeded via `useState({ open: store?.isActive ?? true })`, but `useState`
  only reads its initialiser on the first render — when `stores` is still
  loading and `store` is `undefined`. It therefore pinned to the `true` fallback
  forever, and saving an inactive store would have silently flipped it live.
  Replaced with a null-means-untouched override that follows the store until
  the user actually toggles it.

**Deliberately still not saved:** weekly hours (needs a separate `StoreHours`
payload in minutes-since-midnight) and the subcategory chips (still hardcoded
markup). Sending them as-is would persist placeholder data.

- [ ] Not verified in a browser — neither service was running. See the caveat
      at the top.

---

## 2. ✅ Uploads — fixed 2026-08-17

**Was:** [`useS3AssetUpload.ts`](../src/shared/hooks/useS3AssetUpload.ts)
presigned through a Next route handler in this app rather than the API's
existing `GET /v1/file-uploads/presigned-url`, so the web needed its own copy of
`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_S3_BUCKET_NAME`. All three
were blank in `.env`, and the handler 500s the moment the bucket name is
missing. That took down **store onboarding compliance documents** and **product
images** together, since both go through this one hook.

**Fixed by repointing the hook at the API.** The response contract was already
identical — both sides build the same `{folder}/{16-byte hex}.{ext}` key with the
same 15-minute expiry and return `{ uploadUrl, fileKey }` in a `data` envelope —
so the change is the URL plus going through `fetcher`, since unlike the S3 PUT
(where the signature _is_ the authorization) the presign call needs a bearer
token.

Then, because it had no callers left:

- Deleted `src/app/api/file-uploads/presigned-url/route.ts` (tracked in git, so
  recoverable) and the now-empty `src/app/api/`.
- Removed the three AWS variables from `.env` and `.env.example`, replacing the
  "FILL THESE IN" instruction with a note not to reintroduce them. The web now
  genuinely holds no credentials — which is what its `.env` header always
  claimed.

### ⚠️ Follow-up not done: production CI still ships AWS secrets to the web

[`deploy-production.yml`](../.github/workflows/deploy-production.yml) injects
`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_S3_BUCKET_NAME` into the
running web container (lines ~163-165 and ~208-210), and lists them in the
`envs:` passthrough on line 121. Those existed solely to feed the route handler
that no longer exists. They are now live credentials shipped into a container
with nothing to use them.

This was **left alone deliberately** — editing a production deploy workflow is an
outward-facing change that should be a conscious decision, not a side effect of
a refactor.

- [ ] Drop the three AWS env vars from the web's container run and the `envs:`
      list. Keep the `aws-actions/configure-aws-credentials` step — that one is
      for the ECR push and is still needed.

---

## 3. 🟠 Analytics phase 1 receives nothing from the web

The API ships `POST /v1/analytics/events` (anonymous-capable, RabbitMQ with a
direct-write fallback). Grep across `mapanytime-market-web/src` finds **zero**
references to it, and no `sessionId` anywhere.

So phase 1 is live on the backend and fed by nothing on this frontend. This
also blocks phase 2 — the dedup work in
[`analytics-evaluation.md`](../../mapanytime-api/docs/analytics-evaluation.md)
needs the web to generate a UUID on first visit and persist it.

- [ ] Add an analytics client posting to `/api/v1/analytics/events`
- [ ] Generate + persist a `sessionId` UUID on first visit

> Recall the trap from the API handoff: if RabbitMQ is unreachable the endpoint
> still returns success via the direct-write path. A green response here does
> **not** prove the transport is healthy.

---

## 4. ✅ Session cookie / token lifetime mismatch — resolved 2026-08-17

**Originally:** the `has_session` marker cookie was set with no `Max-Age`,
making it a browser-session cookie, while the JWT lived in `localStorage` and
survived a restart. Reopening the browser bounced you to `/login` despite
holding a valid token.

**Resolved by moving tokens to `sessionStorage`** — see the note below. The
cookie and the credential now expire together, so the mismatch is gone and the
cookie is deliberately left without a `Max-Age`.

### Tokens moved from localStorage to sessionStorage

Requested 2026-08-17. Worth being precise about what this does and doesn't buy,
because the framing matters for whatever gets built next:

- **It is not XSS protection.** Script running on this origin reads
  `sessionStorage` exactly as easily as `localStorage`. Anyone treating this as
  "tokens are now safe" will make a bad call later.
- **It is a blast-radius reduction.** The token dies with the tab rather than
  persisting indefinitely, and is not shared across tabs.
- **Removing JS access entirely needs HttpOnly cookies**, which this stack
  cannot adopt unilaterally: the Flutter app authenticates with bearer tokens,
  so the API must keep serving them.

Behaviour changes to expect:

- A new tab starts with no token. Cookies _are_ shared across tabs, so
  middleware admits that tab, the first API call 401s, and `fetcher` redirects
  to `/login`. Signing in per tab is now expected.
- Everyone is signed out once on deploy. `getToken`/`getRefreshToken` purge any
  legacy `localStorage` entry rather than migrating it — those values have
  already had an unbounded exposure window.

Covered by [`token.test.ts`](../src/shared/lib/__tests__/token.test.ts)
(8 tests, mutation-checked), including a guard asserting no token is ever
written to `localStorage`.

- [ ] Still open, and the only real fix: HttpOnly refresh cookie for the web
      while the app keeps bearer tokens

---

## 5. 🟡 Realtime listeners for events the API never emits

[`useInventoryOrderSync.ts`](../src/shared/hooks/useInventoryOrderSync.ts)
subscribes to `order:created`, `order:updated` and `inventory:stock-sync`. The
API's [`socket/index.ts`](../../mapanytime-api/src/infrastructure/socket/index.ts)
emits only `store:upserted`, `store:removed`, `notification:new` and
`chat:message`.

**Already defused** — the file carries a `// not used` header and an explicit
`IS_SOCKET_BACKEND_READY = false` toggle, and nothing mounts it. Logged here so
the toggle isn't flipped to `true` on the assumption the events exist.

The channels that _are_ live match correctly: `subscribe_notifications` →
`notification:new`, used by `SellerLayout` and `useOrdersPipeline`.

- [ ] Either emit those three from the API, or delete the hook

---

## 6. 🟡 Built, contract-correct, and mounted nowhere

Client + Zod contract + hook all exist, all target endpoints that genuinely
exist, and **nothing imports the hook**:

| Module                                                     | Endpoints it would call              | Scope                                                                                                                           |
| ---------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `features/finance` (whole feature)                         | `/v1/settlements/*`, `/v1/payouts/*` | `api/`, `contracts/`, `hooks/` and no `components/` at all — nothing to mount                                                   |
| `features/fulfillment` (whole feature)                     | `/v1/shipments/*`, `/v1/returns/*`   | same shape: no `components/`                                                                                                    |
| `features/seller-catalog` → `useSupplierProducts` **only** | `/v1/supplier-products/*`            | the rest of this feature **is** live — `ProductForm`, `ProductTable` and `ProductDetailDialog` all render on `/seller/products` |

That last row is the one to read carefully: seller-catalog is a _live_ feature
with one orphaned API layer inside it, not a dead branch. Deleting the folder
would take working screens with it.

Same failure mode as §1, minus the misleading button. The wiring is done; the
screens were never built or never linked.

- [ ] finance / fulfillment: build the screen, or delete the feature
- [ ] seller-catalog: wire `useSupplierProducts` into the products screen, or
      delete just `api/supplier-products.client.ts` + `hooks/useSupplierProducts.ts`

---

## 7. 🟡 Mock data behind real-looking screens

These render convincingly and will be read as working:

- [`admin/page.tsx`](../src/app/admin/page.tsx) — KPI cards, revenue chart,
  pending stores and recent orders are all hardcoded arrays
- [`admin/categories/page.tsx`](../src/app/admin/categories/page.tsx) —
  `useState` seed data, though `/v1/categories` exists and is already consumed
  elsewhere via `categories.client.ts`
- [`admin/orders/page.tsx`](../src/app/admin/orders/page.tsx) — hardcoded
  array, though `/v1/orders/store` exists and `useOrdersPipeline` already calls it
- [`dashboard.client.ts`](../src/features/dashboard/api/dashboard.client.ts) —
  returns `MOCK_DASHBOARD_STATS`, honestly labelled, parsed through Zod anyway

Honest empty states, no action needed: seller analytics, inventory, reviews and
checkout, plus the agent home, all say "coming soon".

Correctly wired admin pages, for contrast: `/admin/permissions`,
`/admin/users`, `/admin/stores`, `/admin/app-releases`.

---

## 8. 🟠 Two gates are red from other people's in-flight work

Neither is a connection issue and neither is caused by the fixes above, but both
fail today, so anyone running the hooks will hit them.

### `mapanytime-api`: 1 suite / 2 tests failing

`tests/unit/product.service.storeProducts.test.ts` expects
`ProductRepository.getMyProducts('store-1', {...})` but receives
`('store-1', 'seller-1', {...})`. The working tree has uncommitted changes to
`product.service.ts`, `product.repository.ts` and `product.controller.ts` adding
a `sellerId` scoping argument; `HEAD` still passes two arguments. So the code
moved and the test did not.

Given it looks like seller-scoping on a data read, **the test is what needs
updating, not the code** — but that is the author's call.

> Also worth knowing: plain `npx jest` is unreliable on this machine — a full
> parallel run reported 4 failing suites, 3 of which pass in isolation and took
> 300-400s each before timing out. `npx jest --runInBand` is the trustworthy
> signal: **26 of 27 suites, 197 of 199 tests**.

### `mapanytime-market-web`: `eslint .` fails — architecture boundary violated

```
src/shared/components/layout/SellerLayout.tsx:25
src/shared/components/layout/Sidebar.tsx:25, :48
  Strict Boundary Violation: the shared/ kernel cannot import from features/
```

Both files reach into `features/stores/hooks/useActiveStore` and
`features/store-profile/hooks/useStoreProfile`. These imports do **not** exist
in the committed version — they arrived with uncommitted working-tree changes
that predate this audit, so someone is mid-edit on them.

- [ ] Whoever owns that change: invert the dependency (pass the active store in
      as a prop, or lift the hook into `shared/`) rather than relaxing the rule

---

## 9. ⚪ Dead code aimed at endpoints that don't exist

No importers, safe to delete. Most already carry accurate `// not used`
headers:

| File                                      | Targets                                                                                 | Header? |
| ----------------------------------------- | --------------------------------------------------------------------------------------- | ------- |
| `features/orders/api/reviews.api.ts`      | `/v1/reviews` — no such route                                                           | ✅      |
| `features/dashboard/api/analytics.api.ts` | `/v1/stores/:id/analytics` — no such route                                              | ✅      |
| `features/dashboard/api/dashboard.api.ts` | `/v1/stores/:id/dashboard` — no such route                                              | ✅      |
| `services/aiService.ts`                   | `/v1/ai/analyze-product` — no such route                                                | ✅      |
| `features/products/` (whole folder)       | `PATCH /v1/products/:id`, but the API defines `PUT`                                     | ❌      |
| `features/orders/hooks/orders.hooks.ts`   | `getOrderStatus` → `GET /v1/orders/:id/status`, no such route                           | ❌      |
| `features/posts/` (whole folder)          | Template leftover, fully mocked                                                         | partial |
| `shared/hooks/useChatSync.ts`             | Socket half matches; its history fetch hits `/api/channels/:id/messages`, no such route | ✅      |

The live product path is `useProductsPipeline`, not `features/products/`.

> The `PATCH` vs `PUT` mismatch in `features/products/products.api.ts` is worth
> a second look before deleting: if that file was ever the live path, the same
> mismatch may exist in the Flutter app.
