import { test, expect } from "@playwright/test";

test.describe("Theme toggle", () => {
  test("dark mode is active by default", async ({ page }) => {
    await page.goto("/");
    // RootLayout configures <ThemeProvider defaultTheme="dark" />, so dark class should be applied on first load.
    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/, { timeout: 3000 });
  });

  test("clicking the theme toggle switches to light mode", async ({ page }) => {
    await page.goto("/");

    // Find the theme toggle button
    const toggleBtn = page.locator('button[aria-label="Toggle theme"]').first();
    await toggleBtn.click();

    const html = page.locator("html");
    // After toggle, dark class should be removed (light mode)
    await expect(html).not.toHaveClass(/dark/, { timeout: 2000 });
  });

  test("clicking the theme toggle twice returns to dark mode", async ({
    page,
  }) => {
    await page.goto("/");

    const toggleBtn = page.locator('button[aria-label="Toggle theme"]').first();
    await toggleBtn.click(); // → light
    await toggleBtn.click(); // → dark again

    const html = page.locator("html");
    await expect(html).toHaveClass(/dark/, { timeout: 2000 });
  });
});
