import { expect, test } from "@playwright/test";
import { expectAccessible } from "../support/accessibility";

test("homepage renders with no detected accessibility violations", async ({
  page,
}) => {
  const response = await page.goto("/");

  expect(response?.status()).toBe(200);
  const heading = page.getByRole("heading", { level: 1 });
  await expect(heading).toHaveCount(1);
  await expect(heading).toBeVisible();
  const headingText = (await heading.innerText()).replace(/\s+/g, " ").trim();
  expect(headingText).not.toBe("");
  expect(await page.title()).toContain(headingText);

  await expectAccessible(page);
});
