import { test, expect } from "@playwright/test";

test.describe("Theme toggle", () => {
  test("light mode is active by default", async ({ page }) => {
    await page.goto("/");
    // RootLayout configures <ThemeProvider defaultTheme="light" />, so no
    // dark class should be applied on first load.
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/, { timeout: 3000 });
  });

  test("clicking the theme toggle switches to dark mode", async ({ page }) => {
    await page.goto("/");

    // Find the theme toggle button (contains Sun or Moon icon)
    const toggleBtn = page.locator("nav button").first();
    await toggleBtn.click();

    const html = page.locator("html");
    // After toggle, dark class should be applied
    await expect(html).toHaveClass(/dark/, { timeout: 2000 });
  });

  test("clicking the theme toggle twice returns to light mode", async ({
    page,
  }) => {
    await page.goto("/");

    const toggleBtn = page.locator("nav button").first();
    await toggleBtn.click(); // → dark
    await toggleBtn.click(); // → light again

    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/, { timeout: 2000 });
  });
});
