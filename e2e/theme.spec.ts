import { test, expect } from "@playwright/test";

// The landing page (`/`) is dark-only: src/shared/lib/providers/theme-provider.tsx forces `dark`
// there through next-themes' `forcedTheme`, without touching the visitor's saved preference.
// Every other route follows that preference, defaulting to light.
test.describe("Theme", () => {
  test("the landing page is dark even when light is the saved theme", async ({
    page,
  }) => {
    await page.addInitScript(() => localStorage.setItem("theme", "light"));
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("other pages default to light", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.locator("html")).toHaveClass(/light/);
  });

  test("visiting the landing page keeps the saved theme for the rest of the site", async ({
    page,
  }) => {
    await page.goto("/privacy");
    await page.evaluate(() => localStorage.setItem("theme", "light"));

    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/dark/);
    expect(await page.evaluate(() => localStorage.getItem("theme"))).toBe(
      "light",
    );

    await page.goto("/privacy");
    await expect(page.locator("html")).toHaveClass(/light/);
  });
});
