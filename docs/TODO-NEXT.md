# 📋 Pick up here — web

_Written 2026-08-17, end of session._ Everything in this file is **open work**.
What is already done is listed at the bottom so you don't redo it.

Mirrors the convention of
[`mapanytime-api/docs/TODO-NEXT.md`](../../mapanytime-api/docs/TODO-NEXT.md),
which is still the source of truth for API/infra work.

---

## Where things stand

**Nothing is pushed.** Both branches are local only.

| Repo                    | Branch                                                 | Commits ahead |
| ----------------------- | ------------------------------------------------------ | ------------- |
| `mapanytime-market-web` | `feat/merchant-revamp`                                 | 7             |
| `mapanytime-api`        | `feat/store-profile-update-endpoint` (new, off `main`) | 1             |

```
web  69fe213  docs: refresh gate status after the boundary fix
     05c279d  docs: add connection audit and production readiness assessment
     ecce748  fix(store-profile): make the Save button actually save
     41db8a6  refactor(shared): stop the kernel importing from features, fixing eslint
     46b3895  fix(uploads): presign through the API instead of a local route handler
     5354631  perf(web): code-split mapbox, cutting ~500kB from four routes
     d8038b8  fix(auth): store tokens in sessionStorage instead of localStorage

api  40d89bd  feat(stores): add PATCH /v1/stores/:id for seller profile updates
```

Gates on the committed tree: **web** `tsc` clean · `eslint` clean · 30/30 tests ·
build 35 routes. **api** `tsc` clean.

---

## 1. 🔴 First thing: decide what to do with the leftovers

Files still uncommitted in both repos. **None of them contain any of this
session's edits** — verified by grepping every one for the
`connection-audit.md §N` flag markers and finding zero. They are someone else's
in-flight work, left alone on purpose.

### `mapanytime-api` — 4 files, and 2 tests are red because of them

```
src/modules/auth/auth.service.ts
src/modules/products/product.controller.ts
src/modules/products/product.repository.ts
src/modules/products/product.service.ts
```

The products change adds a `sellerId` scoping argument to
`ProductRepository.getMyProducts`, but the test still expects the old
two-argument call:

```
tests/unit/product.service.storeProducts.test.ts
  Expected: "store-1", {…}
  Received: "store-1", "seller-1", {…}
```

`HEAD` passes two arguments, so **the code moved and the test did not**. Since it
looks like seller-scoping on a data read, the _test_ is probably what needs
updating, not the code — but that's the author's call, which is exactly why it
wasn't touched.

This is also why `feat/store-profile-update-endpoint` is green: those four files
are excluded from it.

### `mapanytime-market-web` — an unfinished auth redesign

```
M  src/app/login/page.tsx              ?? src/features/auth/components/AuthCard.tsx
M  src/app/register/page.tsx           ?? public/auth-map-bg.jpg
M  src/features/auth/hooks/useAuth.ts  ?? public/auth-map-daytime.jpg
M  src/features/auth/contracts/auth.contract.ts
                                       ?? public/auth-map-realistic-ph.jpg
M  src/app/admin/layout.tsx            ?? src/app/admin/_components/
M  src/components/home/HomeNavBar.tsx  ?? src/app/buyer/
M  src/app/seller/dashboard/page.tsx
M  src/app/seller/products/page.tsx
M  src/features/orders/api/orders.client.ts
M  src/features/seller-catalog/components/ProductTable.tsx
M  src/shared/contracts/products.contract.ts
M  src/shared/hooks/useProductsPipeline.ts
```

- [ ] **Pick one:** fix the products test so the API branch can absorb those four
      files and stay green (preferred — leaves no red suite), **or** commit the
      leftovers as a separate clearly-labelled WIP commit so at least they're
      captured, **or** leave them for whoever owns them

> ⚠️ Three already-committed files **do** carry other people's work, because
> their edits were interleaved with this session's in the same hunks:
> `Sidebar.tsx`, `SellerLayout.tsx`, `StoreProfileSettings.tsx` (the "Global
> Seller Context" feature). Both commit bodies say so. Worth mentioning to
> whoever owns it before they rebase.

---

## 2. 🔴 Deploy order — two constraints that bite if ignored

**The store-profile fix spans both repos.** The web half calls
`PATCH /v1/stores/:id`, which exists only on the API branch. Ship the **API
first**, or the Save button 404s in production.

**Do not strip the AWS secrets from `deploy-production.yml` yet.** Lines ~163-165
and ~208-210 (plus the `envs:` list on line 121) inject
`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_S3_BUCKET_NAME` into the web
container. They're now dead — the presign route that used them is deleted — but
they must only be removed **after** the uploads commit is live, or uploads break.

- [ ] Push both branches, open PRs
- [ ] Merge + deploy API first, then web
- [ ] Only then, strip the three AWS vars from the web deploy workflow

---

## 3. 🟠 Verify in a browser — nothing was

Neither service ran during any of this work, so every fix is typecheck- and
unit-test-verified only. **Start with the two paths that changed:**

- [ ] **Store profile save** — edit each field, save, reload, confirm it stuck.
      Specifically check the **category dropdown shows the current value** (it
      read the wrong field name before) and that **saving an inactive store does
      not reactivate it** (the toggle used to pin to `true`).
- [ ] **File upload** — a compliance document and a product image. This path now
      presigns through the API instead of the web's own route handler.
- [ ] Everyone will be **signed out once** by the sessionStorage change, and a
      new tab now starts signed out. Expected, not a bug.

---

## 4. 🟡 Then — from `production-readiness.md`

Full detail and rationale in
[`production-readiness.md`](./production-readiness.md). Headlines only:

- **B1** 🔴 A staging deploy can take production down — staging and production
  still share container name, port, env-file path and docker network. Checklist
  in the API's `TODO-NEXT.md` §1. **Highest-severity item in the workspace**;
  needs no human error beyond pressing the button it was built for.
- **B2** 🔴 No payment gateway — orders settle via `POST /v1/payments/mock-webhook`
- **B3** 🔴 `next.config.ts` sets `eslint.ignoreDuringBuilds: true`, so the build
  cannot fail on lint. Now that lint is green, this is a good moment to drop it.
- **B4** 🔴 `/admin`, `/admin/categories`, `/admin/orders` render hardcoded data
- **P1.3** 🟠 Analytics phase 1 receives nothing from the web — no `sessionId`
- **P2.3** 🔵 89 of 105 components are `"use client"`; 4 of 35 pages are server
  components. The structural one — plan it properly.

### Small, self-contained, good warm-up tasks

- [ ] Lift the ~90-line `navLinks` array out of `Sidebar.tsx` into a
      `nav.config.ts`. Skipped deliberately — it would have made a large diff
      against uncommitted work in the same file. **Do this once the Global Seller
      Context work lands.**
- [ ] `/admin` is still 253 kB — `framer-motion` + `recharts` for a page whose
      data is fake. Worth revisiting when B4 is done.
- [ ] Delete or build `mapanytime-market-admin` — a whole Next.js project with
      one page, zero API calls, untouched since 2026-06-22, while `/admin`
      already lives in this app.
- [ ] Decide per feature: build screens for `features/finance` and
      `features/fulfillment`, or delete them. Both are complete client +
      contract + hook with no `components/` at all.

---

## ✅ Done this session — don't redo

|                        |                                                                                                                                                                                                                                                                                                                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Store-profile save** | Was a no-op button with no endpoint behind it. `PATCH /v1/stores/:id` added (ownership in the service, 404-not-403 on mismatch); button wired via `<form>` + `FormData`. Fixed two further bugs found while wiring: the category dropdown read `categoryId` when the API returns `primaryCategoryId`, and the "open to customers" toggle would have reactivated inactive stores. |
| **Uploads**            | Repointed from the web's own presign route to the API's `GET /v1/file-uploads/presigned-url`. Route handler and `src/app/api/` deleted; AWS vars removed from `.env`/`.env.example`. The web now holds no credentials.                                                                                                                                                           |
| **Tokens**             | `localStorage` → `sessionStorage`, with a legacy purge. Locked by `token.test.ts` — 8 tests, mutation-checked, including a guard that no token ever reaches `localStorage`.                                                                                                                                                                                                      |
| **Bundles**            | ~500 kB off each of four routes: 653→131, 651→148, 646→151, 646→152 kB. Mapbox is now behind a `next/dynamic` boundary inside `MapSelection` itself, the onboarding route loads one form instead of three, and the `@/features/stores` barrel no longer re-exports the heavy form.                                                                                               |
| **`eslint` green**     | Was 3 `no-restricted-imports` errors. One dead import; the other two a real inversion — `shared/` no longer reaches into `features/`. `Sidebar` declares an `ActiveStoreSummary` shape structurally and the data is supplied by `SellerAuthGate`.                                                                                                                                |
| **First paint**        | Both auth gates render a skeleton instead of `null`. `AdminAuthGate` blocks on a `/users/me` round-trip, so it used to be a blank white page for the whole request.                                                                                                                                                                                                              |
| **Sign-out bug**       | `localStorage.clear()` wiped the saved theme and in-progress onboarding drafts. Now removes only the two seller-context keys.                                                                                                                                                                                                                                                    |
| **Docs**               | `connection-audit.md` (§1-§9, referenced by ~14 in-code flags — renumber together), `production-readiness.md`, and this file.                                                                                                                                                                                                                                                    |

### Two traps worth carrying forward

1. **`npx jest` is unreliable on this machine.** A full parallel run reported 4
   failing API suites; 3 of them pass in isolation after burning 300-400s each.
   **`npx jest --runInBand` is the trustworthy signal** — 26/27 suites, 197/199.

2. **`npm pkg delete dependencies.socket.io` silently corrupts `package.json`.**
   It reads the dot as a nested path and leaves a stray `"socket": {}` key behind
   while not removing what you asked for. Edit `package.json` directly for any
   dependency whose name contains a dot.
