import { expect, test } from "@playwright/test";
import { expectAccessible } from "../support/accessibility";

// Scans in-memory documents, so the inaccessible example is never part of the
// site. The documents differ only in whether the email field has a label.
function newsletterDocument(field: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <title>Newsletter</title>
  </head>
  <body>
    <main>
      <h1>Newsletter</h1>
      ${field}
    </main>
  </body>
</html>`;
}

test("accessibility helper reports violated rules and affected elements", async ({
  page,
}) => {
  await page.setContent(newsletterDocument('<input type="email" id="email">'));

  const scan = expectAccessible(page);
  await expect(scan).rejects.toThrow('"rule": "label"');
  await expect(scan).rejects.toThrow('"#email"');
});

test("accessibility helper accepts corrected markup", async ({ page }) => {
  await page.setContent(
    newsletterDocument(
      '<label for="email">Email</label> <input type="email" id="email">',
    ),
  );

  await expectAccessible(page);
});
