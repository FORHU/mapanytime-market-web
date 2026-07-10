import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads and shows hero headline", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/MapAnytime/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("navigation bar is visible", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("Explore Live Map button is visible and clickable", async ({ page }) => {
    await page.goto("/");
    const btn = page.getByRole("button", { name: /explore live map/i });
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test("How It Works nav link scrolls to the how-it-works section", async ({
    page,
  }) => {
    await page.goto("/");
    const howItWorksLink = page.getByRole("link", { name: /how it works/i });
    await howItWorksLink.click();

    // Section becomes visible after in-page anchor scroll
    const howItWorksSection = page.locator("#how-it-works");
    await expect(howItWorksSection).toBeInViewport({ timeout: 2000 });
  });

  test("footer is visible", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });
});
