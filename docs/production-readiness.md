# 🚦 Production readiness — workspace assessment

_Written 2026-08-17._ Covers all four subprojects, with the detail weighted
toward `mapanytime-market-web` and `mapanytime-api` because that is where the
work of the last sessions landed.

Companion documents, not superseded by this one:

| Document                                                                           | Scope                                                                                          |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [`./connection-audit.md`](./connection-audit.md)                                   | Every web→API call matched against every registered route. Sections referenced below as §1–§9. |
| [`../../mapanytime-api/docs/TODO-NEXT.md`](../../mapanytime-api/docs/TODO-NEXT.md) | API/infra handoff backlog, 2026-08-12                                                          |
| [`FLOW_EVALUATION.md`](../../FLOW_EVALUATION.md)                                   | Buyer journey across API + Flutter app                                                         |

---

## 🔴 This is already live

Confirmed 2026-08-17: both repos are in sync with `origin` and the system is
deployed. That reframes everything below — this is **not** a pre-launch
checklist, it is a list of things already running in front of users.

Two consequences that change what to do first:

**1. None of the fixes below are deployed.** Every change from this session is
**uncommitted** in the working tree — 44 files in `mapanytime-market-web` (on
`feat/merchant-revamp`), 7 in `mapanytime-api` (on `main`). Both branches have
zero unpushed commits, so what is live is the code as it was _before_ this
session. In particular **store-profile save is broken in production right now**:
the button is a no-op and the endpoint does not exist.

**2. The upload failure (§2) was probably local-only.** `.env` had blank AWS
values, but `deploy-production.yml` injects `AWS_S3_BUCKET_NAME` and the key
pair into the container, so the presign route most likely _worked_ in
production. Good news — but it means the §2 fix **changes a production path that
currently works**, so it needs testing before it ships, not after.

> ⚠️ **Ordering trap:** P1.4 (stripping AWS secrets from the web's deploy) must
> land **after** the §2 presign repoint is deployed. Doing it first breaks
> uploads in production.

---

## Verdict

**Live, but not production _ready_.** The architecture is sound and the
transport layer is genuinely well built — the gaps are in _finishing_ and in
_deploy safety_, not in design. Nothing here is a reason to re-architect. It is
a punch list.

But being live promotes two items from "would hurt" to "is currently exposed":

|                                        | Now that it's live                                                                                                                                                          |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **B1** staging/production collision    | A landmine. Anyone running the Staging workflow takes production down. Needs no human error beyond pressing the button it was built for. **Defuse today.**                  |
| **B2** no payment gateway              | If checkout is reachable by real users, orders settle against a mock webhook — marked paid with no money taken. **Confirm whether checkout is exposed; if it is, gate it.** |
| **P1.4** AWS keys in the web container | Live credentials sitting in a running container with no consumer.                                                                                                           |
| **B4** fabricated admin numbers        | Operators may already be reading invented figures as real and acting on them.                                                                                               |

### ⚠️ How this was assessed — read before trusting any of it

**Neither service was running** during any of this work (`:4002` and `:4000`
both refused connections). Everything below comes from:

- static matching of call sites against route definitions,
- typecheck, unit tests and a full production build,
- reading configuration and deploy workflows.

**Nothing was verified in a browser or against a live database.** Bundle sizes
are real (build output); the _runtime_ lag attribution is inference from those
sizes plus architecture, and is unmeasured. The browser pass owed in
[`TODO-NEXT.md` §5](../../mapanytime-api/docs/TODO-NEXT.md) is still the thing that
would catch what this method cannot.

---

## Gate status

| Project                 | Typecheck | Tests                        | Lint            | Build        |
| ----------------------- | --------- | ---------------------------- | --------------- | ------------ |
| `mapanytime-market-web` | ✅ clean  | ✅ 5 suites / 30 tests       | ❌ **3 errors** | ✅ 35 routes |
| `mapanytime-api`        | ✅ clean  | ❌ **26/27 suites, 197/199** | —               | —            |

Both failures come from **other people's uncommitted in-flight work**, not from
the changes described below — see [Not ours](#not-ours) for the evidence.

> ⚠️ `npx jest` (parallel) is unreliable on this machine: a full run reported 4
> failing suites, 3 of which pass in isolation after burning 300–400s each.
> **`npx jest --runInBand` is the trustworthy signal.**

> ⚠️ `next.config.ts` sets `eslint: { ignoreDuringBuilds: true }`. That is why
> the build is green while lint is red. **The build cannot currently fail on a
> lint error.**

---

## Fixed this session

Recorded so nobody redoes them. Detail in the linked audit sections.

|        | What was wrong                                                                                                                                                                                                            | Status                                                                                                                                               |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **§1** | Store-profile Save button was `onClick={() => setIsSubmitting(false)}` — a no-op — and `PATCH /v1/stores/:id` did not exist in the API at all                                                                             | ✅ Endpoint added (route + controller + service, ownership enforced in the service, 404-not-403 on mismatch); button wired via `<form>` + `FormData` |
| **§1** | Category dropdown read `store.categoryId`; the API returns `primaryCategoryId`. `.loose()` Zod made it parse cleanly as always-`undefined`                                                                                | ✅ Reads `primaryCategoryId ?? categoryId`                                                                                                           |
| **§1** | "Open to customers" toggle seeded from `useState({ open: store?.isActive ?? true })` on a render where `store` is still `undefined` — it pinned to `true`, so saving an inactive store would have silently reactivated it | ✅ Null-means-untouched override                                                                                                                     |
| **§2** | Uploads 500'd before starting: the web presigned via its own route handler needing AWS keys that were blank in `.env`                                                                                                     | ✅ Repointed at the API's `GET /v1/file-uploads/presigned-url`; web route handler deleted; AWS vars removed from both env files                      |
| **§4** | Tokens in `localStorage`; `has_session` cookie expired first, bouncing valid sessions to `/login`                                                                                                                         | ✅ Moved to `sessionStorage` + legacy purge, locked by 8 mutation-checked tests                                                                      |

**Not browser-verified.** When the services are next up, exercise **store-profile
save** and **a file upload** first — those are the two paths that changed.

---

## <a name="blockers"></a>P0 — blockers

### B1. 🔴 A staging deploy can take down production

`deploy-staging.yml` and `deploy-production.yml` still resolve to the same
host-level names. Verified 2026-08-17, unchanged since
[`TODO-NEXT.md` §1](../../mapanytime-api/docs/TODO-NEXT.md) flagged it on 2026-08-12:

|                  | staging                             | production       |
| ---------------- | ----------------------------------- | ---------------- |
| `CONTAINER_NAME` | `mapanytime-api`                    | `mapanytime-api` |
| `APP_PORT`       | `4002`                              | `4002`           |
| env file         | `mapanytime-api.env` (7 references) | same             |
| docker network   | `mapanytime` (3 references)         | same             |

Only `ECR_REPOSITORY` and `NODE_ENV` differ. The one thing separating the two is
which host `secrets.EC2_HOST` points at. Aimed at the same box, a staging deploy
overwrites production's env file, `docker rm`s its container and rebinds its
port — **and nothing about that looks like a mistake until production is down.**

This is the highest-severity item in the workspace because it needs no human
error to fire. Full remediation checklist already written in `TODO-NEXT.md` §1.

### B2. 🔴 There is no payment gateway

[`payment.route.ts`](../../mapanytime-api/src/modules/payments/payment.route.ts)
exposes exactly two endpoints:

```
GET  /v1/payments/qr-payload/:orderId
POST /v1/payments/mock-webhook
```

Orders settle by calling a mock webhook. GCash/Bank produce a renderable QR
payload but no processor is behind it. A marketplace cannot take real money in
this state.

### B3. 🔴 The build cannot fail on lint

`eslint.ignoreDuringBuilds: true` in
[`next.config.ts`](../next.config.ts). Three real
architecture-boundary errors are red right now and the build shipped anyway.
Either fix the violations and remove the flag, or accept that lint is advisory
and stop calling it a gate.

### B4. 🔴 Admin surfaces are fabricated

[`/admin`](../src/app/admin/page.tsx) (KPIs, revenue chart,
pending stores, recent orders),
[`/admin/categories`](../src/app/admin/categories/page.tsx)
and [`/admin/orders`](../src/app/admin/orders/page.tsx) are
hardcoded arrays. They render convincingly. An operator will read invented
numbers as real ones and act on them.

Both category and order endpoints already exist and are consumed elsewhere in
the app, so these are wiring jobs, not new features.

---

## P1 — fix before real traffic

### P1.1 🟠 API CORS reflects any origin, with credentials

[`app.ts`](../../mapanytime-api/src/app.ts):

```ts
cors({ origin: (origin, callback) => callback(null, true), credentials: true, … })
```

Because tokens now live in `sessionStorage` rather than cookies this is not
directly exploitable — a third-party page cannot ride a user's session. It is
still an open door with no reason to be open. Replace with an allowlist driven
by `CORS_ORIGIN`, which is already a deploy secret.

### P1.2 🟠 `next/image` cannot serve real product imagery

`images.remotePatterns` allows only `images.unsplash.com`. Product images come
from S3/CDN, so they cannot be optimized — and any `<Image>` pointed at the real
bucket will throw at runtime. Add the S3/CDN hostname.

### P1.3 🟠 Analytics phase 1 receives nothing

The API ships `POST /v1/analytics/events` with RabbitMQ batching. The web has
**zero** references to it and generates no `sessionId`. Phase 1 is live and
being fed by nothing; phase 2 (dedup) is blocked on the `sessionId` the web
never creates. Audit §3.

> Carry the trap forward: if RabbitMQ is unreachable the endpoint still returns
> success via the direct-write fallback. **A green response does not prove the
> transport is healthy.**

### P1.4 🟠 Production CI ships AWS secrets to a container that no longer uses them

[`deploy-production.yml`](../.github/workflows/deploy-production.yml)
injects `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_S3_BUCKET_NAME`
into the running web container (~lines 163–165 and 208–210, listed in the
`envs:` passthrough on line 121). These existed only to feed the presign route
deleted in §2. Live credentials, zero consumers.

Keep the `aws-actions/configure-aws-credentials` step — that one is for the ECR
push and is still needed. Left unedited deliberately: changing a production
deploy workflow should be a conscious decision, not a refactor side effect.

---

## P2 — the navigation lag

### ✅ P2.1 / P2.2 / P3 — fixed 2026-08-17, measured

Baseline shared JS is ~103 kB and was always healthy. Four routes were roughly
**6×** that. Before and after, both from `next build`:

| Route                       | Before | After      | Cut                  |
| --------------------------- | ------ | ---------- | -------------------- |
| `/seller/onboarding/[type]` | 653 kB | **131 kB** | −80%                 |
| `/seller/manage-stores`     | 651 kB | **148 kB** | −77%                 |
| `/seller/onboarding`        | 646 kB | **151 kB** | −77%                 |
| `/agent/registerSeller`     | 646 kB | **152 kB** | −76%                 |
| `/admin`                    | 253 kB | 253 kB     | unchanged — see P2.5 |

Roughly half a megabyte of JavaScript off each of the four heaviest routes.
`tsc` clean, 30/30 tests still passing.

**What changed:**

- **`MapSelection` is now a lazy boundary.** The old component became
  `MapSelectionImpl.tsx`, and `MapSelection.tsx` is a `next/dynamic` wrapper
  around it. Splitting _inside_ the feature rather than at the four call sites
  keeps the import path identical — no consumer needed editing, and no future
  consumer can reintroduce the static import by accident.
- **`/seller/onboarding/[type]` loads one form, not three.** It renders exactly
  one of three onboarding forms based on a URL segment but imported all three
  statically. Now each is `dynamic()`, so a visitor pays only for the form they
  opened.
- **The `@/features/stores` barrel no longer re-exports `StoreOnboardingForm`.**
  It had zero remaining consumers, so the heavy export is gone and the file now
  documents why it must stay leaf-level only. `manage-stores` imports the modal
  from its own path.
- **Dropped three unused dependencies:** `@aws-sdk/client-s3`,
  `@aws-sdk/s3-request-presigner` (their only consumer was deleted in §2) and
  `socket.io` — the _server_ package; only `socket.io-client` is used.

> ⚠️ `npm pkg delete dependencies.socket.io` mis-parses the dot as a nested path
> and silently leaves a stray `"socket": {}` key. It was removed by hand. Worth
> knowing before anyone repeats the command.

### ✅ Blank first paint — partially fixed

`SellerAuthGate` returned `null` while hydrating, so every seller route was a
blank white frame until JS landed. It now renders a sidebar-plus-content
skeleton occupying the same layout, so the page assembles instead of appearing
from nothing.

`AdminAuthGate` has the same flaw and is **worse** — it blocks on a network
round-trip to `/api/v1/users/me` before rendering anything. Left alone because
the file has other uncommitted edits. See P2.6.

### P2.5 `/admin` is still 253 kB

Unchanged by the above: it pulls `framer-motion` and `recharts` for a page whose
data is entirely hardcoded (B4). Wiring it to real endpoints and dropping the
animation library would likely halve it. Low priority while the page is fake.

### ✅ P2.6 — boundary violation fixed, `eslint` now green

**`npx eslint .` exits 0 for the first time.** All three errors are gone.

One was trivial: `Sidebar.tsx` imported `useActiveStore` and **never used it** —
a dead import failing the build's own rule.

The other two were a real dependency inversion. `Sidebar` and `SellerLayout`
both called `useStoreProfiles()` to turn `activeStoreId` into a store name,
which meant the `shared/` kernel depended on a feature. Fixed by inverting it:

- `shared/components/layout/Sidebar.tsx` exports an `ActiveStoreSummary`
  interface — declaring the _shape_ it needs **structurally**, rather than
  importing the type from `features/`.
- `SellerLayout` takes `stores` as a prop and resolves `activeStore` once,
  passing it down to `Sidebar`.
- `SellerAuthGate` — which lives in `features/` and may legitimately use feature
  hooks — calls `useStoreProfiles()` and supplies the data.

No extra request: React Query serves every `useStoreProfiles` caller from one
cache entry, so lifting the call up costs nothing.

This was done **without disturbing the in-flight "Global Seller Context" work**
in those files (the role-based portal switcher, the removal of the forced
redirect to `/seller/manage-stores`, `requiresStore` nav gating). Those changes
are preserved as written — only the data source moved.

Also fixed while in there: `Sidebar`'s sign-out called `localStorage.clear()`,
wiping the saved theme and any in-progress onboarding drafts along with the
session. It now removes only the two seller-context keys; `clearToken()` already
handles credentials.

**Not done:** lifting the ~90-line `navLinks` array out of `Sidebar` into a
`nav.config.ts`. It is worth doing — that array is configuration living as code,
and adding a route means editing a 460-line component — but it would create a
large diff against uncommitted work in the same file for no functional gain.
Best done once the Global Seller Context work lands.

Historical detail on the original findings follows.

### P2.1 A barrel file drags Mapbox into a page with no map

[`manage-stores/page.tsx`](../src/app/seller/manage-stores/page.tsx)
imports `StoreTypeSelectionModal` — a small portal modal — from the
`@/features/stores` barrel. That barrel also re-exports `StoreOnboardingForm`,
which statically imports `MapSelection` → `mapbox-gl`. A store **list** page
ships an entire map engine.

**Fix:** import the modal from its own path. ~651 kB → ~110 kB. One line.

### P2.2 `mapbox-gl` is statically imported

[`MapSelection.tsx`](../src/features/stores/components/MapSelection.tsx)
imports it at module scope. `LiveHeroMap` already avoids this correctly via
`next/dynamic`; `MapSelection` never got the same treatment. Separately,
`/seller/onboarding/[type]` statically imports **all three** onboarding forms
when it renders exactly one.

**Fix:** `dynamic(() => import(...), { ssr: false })` for `MapSelection`, and
for the three onboarding stubs.

### P2.3 Almost nothing renders on the server

89 of 105 `.tsx` files are `"use client"`. Only **4 of 35** pages are server
components (`login`, `register`, `buyer/register`, `store/[id]`). Combined with
[`SellerAuthGate`](../src/features/auth/components/SellerAuthGate.tsx)
returning `null` until `mounted`, every seller and admin route paints blank
until JS arrives and hydrates.

This is the structural one and the only item here that is a real project rather
than an afternoon.

### P2.4 Queries refetch on most navigations

`staleTime: 30s` with both `refetchOnMount` and `refetchOnWindowFocus` enabled.
Deliberate, and documented in
[`query-provider.tsx`](../src/shared/lib/providers/query-provider.tsx)
— worth revisiting per-query once the bundle work is done, not before.

---

## P3 — dead weight

### Unused dependencies

| Package                         | Why it can go                                                           |
| ------------------------------- | ----------------------------------------------------------------------- |
| `@aws-sdk/client-s3`            | Only consumer was the presign route deleted in §2 — zero imports remain |
| `@aws-sdk/s3-request-presigner` | Same                                                                    |
| `socket.io`                     | The **server** package. Only `socket.io-client` is used                 |

### Dead modules

No importers anywhere. Most already carry accurate `// not used` headers; all
are flagged in-code with a pointer to audit §9.

`features/orders/api/reviews.api.ts` · `features/dashboard/api/analytics.api.ts`
· `features/dashboard/api/dashboard.api.ts` · `services/aiService.ts` ·
`features/products/` (whole folder) · `features/orders/hooks/orders.hooks.ts` ·
`features/posts/` (template leftover) · `shared/hooks/useChatSync.ts` ·
`shared/hooks/useInventoryOrderSync.ts`

### Built, contract-correct, mounted nowhere

`features/finance` (settlements, payouts) and `features/fulfillment` (shipments,
returns) — full client + contract + hook, no `components/` directory at all.

⚠️ **`features/seller-catalog` is NOT in this list.** Only its
`useSupplierProducts` hook is orphaned; `ProductForm`, `ProductTable` and
`ProductDetailDialog` all render on `/seller/products`. Deleting the folder
would take working screens with it.

---

## <a name="not-ours"></a>Not ours — other people's in-flight work

Both red gates trace to uncommitted changes that were in the tree before this
assessment began. Verified against `HEAD`, not assumed:

**`mapanytime-market-web` — 3 eslint errors.** `SellerLayout.tsx` and
`Sidebar.tsx` import from `features/` inside the `shared/` kernel, violating the
project's own boundary rule. Those imports **do not exist in `HEAD`**.
→ Invert the dependency (pass the active store in as a prop, or lift the hook
into `shared/`) rather than relaxing the rule.

**`mapanytime-api` — 2 test failures.**
`tests/unit/product.service.storeProducts.test.ts` expects
`getMyProducts('store-1', {…})` but receives `('store-1', 'seller-1', {…})`. The
tree has uncommitted `product.service.ts` / `product.repository.ts` /
`product.controller.ts` changes adding a `sellerId` scoping argument; `HEAD`
still passes two. The code moved and the test did not.
→ It looks like seller-scoping on a data read, so **the test is probably what
needs updating, not the code** — author's call.

---

## Suggested order of attack

Reordered for a **system that is already live**. Risk-to-users first, cheap wins
second, structural work last.

### 🔴 Today — live exposure

1. **B1** — isolate the staging workflow. A landmine that fires on a normal
   button press. Checklist already written in `TODO-NEXT.md` §1.
2. **B2** — establish whether checkout is reachable by real users. If it is,
   gate it until a real processor exists; orders currently settle against a mock
   webhook.
3. **B4** — at minimum label the three admin pages as sample data, so nobody
   makes a decision on invented numbers while the wiring is done properly.

### 🟠 This week — commit and ship what is already fixed

4. Review the 44 + 7 uncommitted files. **They mix this session's work with
   other people's in-flight changes** (see [Not ours](#not-ours)) — stage
   deliberately, do not `commit -a`.
5. Deploy the §1 store-profile fix. That path is broken in production today.
6. Test and deploy the §2 presign repoint — it changes a production path that
   currently works.
7. **Then, and only then**, P1.4 — strip the dead AWS secrets from the web's
   deploy. See the ordering trap above.
8. **P1.1** — CORS allowlist from `CORS_ORIGIN`.
9. **B3** — fix the 3 boundary errors, drop `ignoreDuringBuilds`.
10. Fix the products test (or the products code) and get the API suite green.

### 🟡 Cheap and highly visible — the lag you noticed

11. **P2.1** — one-line import change, 651 kB → ~110 kB.
12. **P2.2** — `dynamic()` for `MapSelection` and the three onboarding stubs.
13. **P3** — `npm rm @aws-sdk/client-s3 @aws-sdk/s3-request-presigner socket.io`.

### ⚪ Then

14. **B4 properly** — wire the admin pages to the endpoints that already exist.
15. **P1.3** — analytics client + `sessionId`.
16. **P1.2** — S3/CDN hostname for `next/image`.
17. The browser pass owed in `TODO-NEXT.md` §5 — **start with store-profile save
    and file upload**, the two paths changed this session.
18. Decide per feature: build the screens for `finance` / `fulfillment`, or
    delete them.

### 🔵 Structural — plan it properly

19. **P2.3** — move read-only pages to server components and shrink the
    `"use client"` surface.
