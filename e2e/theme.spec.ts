import { test, expect } from "@playwright/test";

test.describe("Theme toggle", () => {
  test("light mode is active by default", async ({ page }) => {
    await page.goto("/");
    // RootLayout configures <ThemeProvider defaultTheme="light" />, so light class should be applied on first load.
    const html = page.locator("html");
    await expect(html).toHaveClass(/light/, { timeout: 3000 });
  });

  // The landing page (src/features/landing) has no theme toggle — it is a
  // fixed-dark design. There is currently no route under test that renders
  // one, so there is nothing here to click.
});
