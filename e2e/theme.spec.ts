import { test, expect } from "@playwright/test";

test.describe("Theme toggle", () => {
  test("light mode is active by default", async ({ page }) => {
    await page.goto("/");
    // RootLayout configures <ThemeProvider defaultTheme="light" />, so light class should be applied on first load.
    const html = page.locator("html");
    await expect(html).toHaveClass(/light/, { timeout: 3000 });
  });

  test("clicking the theme toggle switches to dark mode", async ({ page }) => {
    await page.goto("/");

    // Find the theme toggle button
    const toggleBtn = page
      .locator('button[aria-label="Toggle dark mode"]')
      .first();
    await toggleBtn.click();

    const html = page.locator("html");
    // After toggle, dark class should be applied (dark mode)
    await expect(html).toHaveClass(/dark/, { timeout: 2000 });
  });

  test("clicking the theme toggle twice returns to light mode", async ({
    page,
  }) => {
    await page.goto("/");

    const toggleBtn = page
      .locator('button[aria-label="Toggle dark mode"]')
      .first();
    await toggleBtn.click(); // → dark
    await expect(page.locator("html")).toHaveClass(/dark/);
    await toggleBtn.click(); // → light again

    const html = page.locator("html");
    await expect(html).toHaveClass(/light/, { timeout: 2000 });
  });
});
