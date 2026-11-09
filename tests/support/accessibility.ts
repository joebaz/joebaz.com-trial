import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

// Scans the page's current rendered state with axe's default rules and fails
// if any violations are found. Navigate, interact, and assert that the
// intended state is ready before calling this. The boxed step reports
// failures at the calling line, which identifies the scanned state when a
// test scans more than once.
export async function expectAccessible(page: Page) {
  await test.step(
    "scan for accessibility violations",
    async () => {
      const { violations } = await new AxeBuilder({ page }).analyze();

      // The full results include volatile check details; report what is
      // needed to find and fix each violation.
      const report = violations.map(({ id, impact, help, helpUrl, nodes }) => ({
        rule: id,
        impact,
        help,
        helpUrl,
        elements: nodes.map(({ target, html }) => ({ target, html })),
      }));
      expect(report, "axe found accessibility violations").toEqual([]);
    },
    { box: true },
  );
}
