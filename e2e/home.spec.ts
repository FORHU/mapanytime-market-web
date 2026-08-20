import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads and shows hero headline", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/MapAnytime/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("navigation bar is visible", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation").first();
    await expect(nav).toBeVisible();
  });

  test("primary CTA links are visible", async ({ page }) => {
    await page.goto("/");
    const loginLink = page.getByRole("link", { name: "Login" }).first();
    await expect(loginLink).toBeVisible();
    const joinLink = page.getByRole("link", { name: /join mapanytime/i });
    await expect(joinLink).toBeVisible();
  });

  test("Why MapAnytime nav link scrolls to the benefits section", async ({
    page,
  }) => {
    await page.goto("/");
    const benefitsLink = page
      .getByRole("link", { name: /why mapanytime/i })
      .first();
    await benefitsLink.click();

    // globals.css sets scroll-behavior: smooth; #benefits sits past the
    // full-height hero and how-it-works sections, so the animated scroll
    // needs more than the default couple seconds to land.
    const benefitsSection = page.locator("#benefits");
    await expect(benefitsSection).toBeInViewport({ timeout: 8000 });
  });

  test("footer is visible", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });
});
