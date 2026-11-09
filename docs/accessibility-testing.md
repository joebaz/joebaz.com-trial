# Accessibility smoke tests

`npm test` runs rendered-page accessibility smoke checks with `@axe-core/playwright` alongside the other Playwright tests, locally and in CI. The checks cover the homepage and the custom 404 page reached through a missing URL, in Chromium, Firefox, and WebKit.

These checks scan only the pages and states explicitly exercised by tests; they do not crawl the site.

## Source checks and browser scans

The [source accessibility lint rules](accessibility-linting.md) read markup in Astro and React component files without opening a browser. They can catch mistakes such as a missing `alt` attribute, but cannot inspect the rendered page, its computed colors, or content revealed by an interaction.

Playwright opens the site in an actual browser, where HTML, CSS, and JavaScript produce the rendered page. These smoke tests visit page URLs and inspect the combined result, rather than testing a component in isolation. Existing browser tests already check page content and navigation; the accessibility scans add checks for detectable accessibility barriers in that same rendered result.

## What axe does

[Axe-core](https://github.com/dequelabs/axe-core) is an open-source accessibility testing engine created by [Deque Systems](https://www.deque.com/axe/), an accessibility software and services company. It inspects the browser's rendered document and applies rules to detect problems such as missing control labels and insufficient text contrast. It reports findings; it does not fix them.

`@axe-core/playwright` connects that engine to a Playwright browser page. Playwright navigates and interacts, axe scans the resulting state, and our assertion decides whether the reported findings fail the test.

## Shared scan and assertion

Use `expectAccessible` from [`tests/support/accessibility.ts`](../tests/support/accessibility.ts) after navigating to the intended page and asserting that it is ready. Each call scans the page's current rendered state and fails if axe reports any violations.

The helper uses axe's default enabled rules, including WCAG-related and accessibility best-practice rules. It does not filter by WCAG tags or disable rules. See [Playwright's accessibility-testing guidance](https://playwright.dev/docs/accessibility-testing) for the underlying scan API and its options.

## Add a page

Create a `*.spec.ts` file in `tests/smoke/`, or add a test to an existing spec. For example:

```ts
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
```

An **assertion** compares what the test observed with what it expected. Playwright's `expect(...)` describes the observed value or element; the following matcher, such as `toBe(200)`, states the expectation. A failed assertion fails the test; a successful one lets it continue. In this example:

- `expect(response?.status()).toBe(200)` checks the response already received. A 404 fails immediately.
- `toHaveCount(1)` requires exactly one level-1 heading, and `toBeVisible()` waits for it to be visible before the scan starts.
- The heading text is normalized by collapsing whitespace runs and trimming it. The next assertions require nonempty text and a document title that includes it.
- Inside `expectAccessible`, `expect(report).toEqual([])` requires an empty list of violations. It checks the completed scan once; it does not retry until violations disappear.

These assertions confirm the homepage's structure. Add other readiness assertions when the state being scanned needs more content to load. See [Playwright's assertion guide](https://playwright.dev/docs/test-assertions) for matcher and retry behavior.

For other pages, replace the URL and structural checks with readiness assertions for that page's expected content. Assertions should confirm that the intended page loaded, rather than allowing an error page to pass the scan. For a 404 test, navigate to a missing URL, assert HTTP status 404, and wait for the custom page's heading, as in [`not-found.spec.ts`](../tests/smoke/not-found.spec.ts). Loading `/404` directly does not exercise missing-URL handling.

Tests are discovered by the existing [Playwright configuration](../playwright.config.ts); no separate command or CI job is needed for each new page. Run the full workflow with `npm test`. During development, use `npx playwright test --grep accessibility` to select tests whose titles contain `accessibility`, optionally adding `--project chromium` for a single browser. Playwright manages the test server for both commands.

## Add an interactive state

Navigate, perform the interaction, assert the expected state, and then scan. Scan each important state explicitly: a check on the initial page cannot inspect content that is still hidden or has not rendered.

For example, a project that adds a contact dialog could test its open state like this. This is a hypothetical example; adapt the URL and locators to the implemented interaction.

```ts
import { expect, test } from "@playwright/test";
import { expectAccessible } from "../support/accessibility";

test("open contact dialog has no detected accessibility violations", async ({
  page,
}) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: "Send a message" }).click();

  await expect(page.getByRole("dialog", { name: "Contact us" })).toBeVisible();
  await expectAccessible(page);
});
```

Use separate tests or repeated helper calls for other relevant states, such as expanded navigation, validation errors, or success messages. Wait for meaningful readiness assertions before every scan, including hydration or asynchronous content when applicable. Avoid arbitrary delays. Keep the whole-page scan so that problems outside the newly revealed component are also detected.

## Investigate failures and limits

Failures identify the violated rules and affected elements, with guidance links, selectors, and HTML snippets. The scan step points to the helper's calling line, identifying which state failed when a test scans several states. Use these details to investigate the rendered markup. Review the screenshot and any trace retained in `test-results/`; see the [README testing overview](../README.md#testing-and-ci) for failure artifacts. Fix the cause and rerun the affected tests rather than suppressing rules or excluding content to obtain a pass.

[`accessibility-helper.spec.ts`](../tests/smoke/accessibility-helper.spec.ts) verifies that an unlabeled control fails with its rule ID and selector, and that corrected markup passes. Its example documents exist only in memory and are not published as site pages.

A passing scan does not establish full WCAG conformance. Automated checks cannot establish complete keyboard usability, appropriate focus behavior, a usable screen-reader experience, or whether alternative text conveys the right meaning. Axe can also return inconclusive results that require human investigation; an empty `violations` array does not mean every rule passed. Coverage is limited to the tested content, viewport, browser, and interaction state. These tests run against Astro's development server and do not verify the deployed site's hosting or production behavior.

Human launch review and its completion evidence remain in each project's Wiki. Copying the template Wiki and updating the project's README links are manual setup tasks.
