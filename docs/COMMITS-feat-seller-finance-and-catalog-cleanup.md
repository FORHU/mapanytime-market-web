# Branch: `feat/seller-finance-and-catalog-cleanup`

_Off `feat/buyer-checkout-admin-wiring` @ f585cc9 (which itself carries 3
prior unpushed commits — `78d491b`, `0fd0bd0`, `f585cc9`). 9 commits on
top, 2026-08-23._

Full findings list (fixed and flagged-only, across all three repos) live
in
[`mapanytime-market-app/docs/PICKUP-NEXT.md`](../../mapanytime-market-app/docs/PICKUP-NEXT.md)
under "Review session, 2026-08-23".

---

## `refactor: drop unnecessary "use client" from server-renderable components`

None of these files use client-only hooks or handlers at their top level;
marking them client components was forcing extra JS to the browser for no
behavioral benefit.

**Files (15):** `src/app/agent/page.tsx`,
`src/app/seller/{all-stores,analytics,checkout,inventory,orders,properties/products}/page.tsx`,
`src/components/home/{EcosystemSection,HomeFooter}.tsx`,
`src/features/checkout/components/PriceBreakdown.tsx`,
`src/features/landing/components/{LandingCTA,LandingNav,LandingStory}.tsx`,
`src/features/stores/components/{FormSkeleton,MetricCard}.tsx` — 35
deletions

## `refactor(admin): replace framer-motion with a CSS animation`

The only use of `framer-motion` in the app was a staggered fade-in-up on
the admin dashboard's KPI cards. Replaced with a plain CSS keyframe
animation (same easing/delay behavior) and dropped the dependency.

**Files:** `package.json`, `package-lock.json`, `src/app/admin/page.tsx`,
`tailwind.config.ts` — 14 insertions, 728 deletions

## `refactor: remove dead dashboard/posts/products/ai-chat code`

None of these had any remaining callers — confirmed by tracing every
deletion in this diff against current call sites before removing.
Dashboard and posts were superseded feature scaffolding, the two
`products.api.ts` files were unused REST wrappers, `orders.hooks.ts` was
replaced by the orders pipeline hooks, and `aiService.ts`/`useChatSync.ts`
were the old single-socket AI chat integration.

**Files (23 deleted):** all of `src/features/dashboard/**`,
`src/features/posts/**`, `src/features/products/api/{categories,products}.api.ts`,
`src/features/orders/hooks/orders.hooks.ts`, `src/services/aiService.ts`,
`src/shared/hooks/{useChatSync,useInventoryOrderSync}.ts` — 1070 deletions

## `chore(uploads): allow S3 image domain, drop unused AWS upload env`

Uploads presign through the API now, not a local Next.js route handler,
so the web container no longer needs AWS credentials at deploy time.
`next.config.ts` still needs the S3 bucket's hostname allowlisted for
`next/image` to render product/store imagery served from it.

**Files:** `.github/workflows/deploy-production.yml`, `next.config.ts` —
10 insertions, 18 deletions

## `feat(seller): add finance and fulfillment pages`

Earnings & payouts page (settlements, payouts, running totals) and a
returns/fulfillment page, both linked from a new "Payouts & returns"
Sidebar group.

`finance.client.ts` previously called the admin-only
`/settlements/seller/:id` and `/payouts/seller/:id` routes, which 403 for
a regular seller — **found during this session's review, fixed before
committing.** Switched to the seller-scoped `/settlements/me` and
`/payouts/me` endpoints (server resolves the seller from the auth token,
no id needed), and `useSellerEarnings` now exposes `isError` so a failed
fetch shows an actual error state instead of rendering as an empty
account. Also fixed 4 pre-existing `react/no-unescaped-entities` eslint
errors in the new finance page (caught by the pre-commit hook).

**Files:** `src/app/seller/finance/page.tsx` (new),
`src/app/seller/fulfillment/page.tsx` (new),
`src/features/finance/api/finance.client.ts`,
`src/features/finance/hooks/useSellerEarnings.ts`,
`src/shared/components/layout/Sidebar.tsx` — 445 insertions, 20 deletions

## `docs: flag known ADMIN_ROLES duplication and approval-status gate bug`

Inline TODO/FIXME notes only, not fixes: `ADMIN_ROLES` is duplicated
across `AdminAuthGate.tsx`, `SellerLayout.tsx`, and `buyer/layout.tsx`;
the manage-stores store-selection gate blocks legacy stores with
`approvalStatus` undefined + `isActive:true`, which
`StoreManagementDashboard` treats as active. Both tracked in
`mapanytime-market-app/docs/PICKUP-NEXT.md`.

**Files:** `src/app/seller/manage-stores/page.tsx`,
`src/features/auth/utils/resolveHomeRoute.ts` — 4 insertions

## `fix(store-profile): drop unused lucide imports`

`X` and `Plus` were only used by the hardcoded Subcategories chip block,
which was already removed.

**Files:** `src/features/store-profile/components/StoreProfileSettings.tsx`
— 1 insertion, 1 deletion

## `fix(analytics): attach auth token, guard session-id lookup`

`trackEvent` used a bare `fetch()` with no `Authorization` header, so
logged-in users' events never carried `userId`; and `getSessionId()` ran
outside the `try/catch`, so a storage error could throw past the file's
own "must never break navigation" guarantee. Fixed both. Deliberately
still not routed through the shared fetcher: that helper treats a 401 as
a reason to refresh and redirect to `/login`, which a background
analytics call must never trigger.

**Files:** `src/shared/lib/analytics.ts` — 11 insertions, 2 deletions

## `docs: remove stale planning docs superseded by current branch`

Both `docs/TODO-NEXT.md` and `docs/production-readiness.md` referenced a
prior branch (`feat/merchant-revamp`) and commit list that no longer
matches this branch's history — superseded, not live. Confirmed by
content, not assumed.

**Files:** `docs/TODO-NEXT.md`, `docs/production-readiness.md` — 654
deletions

---

## Verification (post-commit, all green)

- `npm run lint` (eslint) — clean
- `npx tsc --noEmit` — clean
- `npx prettier . --check` — 115 pre-existing unformatted files found,
  **none touched by this branch** (confirmed by diffing the warn list
  against every file this branch changed) — left alone per prior
  session's precedent rather than mass-reformatted
- `npx vitest run` — 30/30 pass
- `npm run build` — succeeds, 39 routes generated including the new
  `/seller/finance` and `/seller/fulfillment`
