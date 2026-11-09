import { expect, test } from "@playwright/test";

// The Playwright web server uses the default fixture's facts file,
// tests/fixtures/website-facts.yaml, which sets the production URL to
// https://example.com and the language to `en`, and leaves the site name
// undecided.
test("fixture page renders shared document metadata", async ({ page }) => {
  await page.goto("/test-fixtures/about");

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("meta[charset]")).toHaveAttribute(
    "charset",
    "UTF-8",
  );
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
    "content",
    "width=device-width, initial-scale=1",
  );
  await expect(page).toHaveTitle("About");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "About page description.",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://example.com/test-fixtures/about",
  );
  await expect(
    page.locator('link[rel="icon"][href="/favicon.ico"]'),
  ).toHaveCount(1);
  await expect(
    page.locator('link[rel="icon"][href="/favicon.svg"]'),
  ).toHaveCount(1);

  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute(
    "content",
    "website",
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    "About",
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    "content",
    "About page description.",
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    "https://example.com/test-fixtures/about",
  );
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary_large_image",
  );
  await expect(page.locator('meta[property="og:site_name"]')).toHaveCount(0);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://example.com/images/about.png",
  );
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute(
    "content",
    "About image description.",
  );
});

test("homepage canonical URLs use the production root", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://example.com/",
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    "content",
    "https://example.com/",
  );
});

test("no-image fixture uses a summary card", async ({ page }) => {
  const response = await page.goto("/test-fixtures/no-image");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle("No image");
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveCount(0);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    "content",
    "summary",
  );
});
