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
    const loginLink = page.getByRole("link", { name: "Log in" }).first();
    await expect(loginLink).toBeVisible();
    const installLink = page
      .getByRole("link", { name: /install the app/i })
      .first();
    await expect(installLink).toBeVisible();
  });

  test("How it works nav link scrolls to its section", async ({ page }) => {
    await page.goto("/");
    // Scoped to the primary nav: the footer has its own "How it works" link.
    await page
      .getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "How it works" })
      .click();

    // globals.css sets scroll-behavior: smooth and #how sits below the hero,
    // so the animated scroll needs more than the default couple seconds.
    await expect(page.locator("#how")).toBeInViewport({ timeout: 8000 });
  });

  test("footer is visible", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });
});
