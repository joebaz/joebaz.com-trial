# QA reference

This reference sets the repository-wide bar that every test plan must meet. An agent designs each test plan from the issue's intent, using test-driven development or otherwise; this reference sets constraints on that plan, not the steps to follow.

Run the required commands for the change type in [Validate your change](../CONTRIBUTING.md#validate-your-change). When a check below cannot be done, report it as not done and why rather than claiming a pass.

## Browsers

The supported visitor browsers and the platform-feature policy are in [Styling and browser support](../coding-standards.md#styling-and-browser-support). Choose browser coverage from that range.

- The Chromium, Firefox, and WebKit engines configured in [playwright.config.ts](../playwright.config.ts) are test engines, not the supported range. Passing them does not show that a change works in branded desktop browsers or on phones.
- The Node.js and build requirements in [package.json](../package.json) apply to development and build machines, not to visitors.

## Accessibility

The bar is [WCAG 2.2 level AA](../coding-standards.md#semantic-html-and-interactions) for whatever the change touches.

- Existing automated coverage is [accessibility linting](accessibility-linting.md) in `npm run lint` and [axe smoke tests](accessibility-testing.md) in `npm test`. Passing them does not establish AA.
- When a change touches something interactive, test it using only the keyboard: everything is reachable, focus is visible, and the focus order makes sense.
- Do not claim screen-reader results. Flag "needs a VoiceOver check" for the maintainer.

## Performance

This policy supports LCP (Largest Contentful Paint) and CLS (Cumulative Layout Shift) from Google's "good" [Core Web Vitals](https://web.dev/articles/vitals) thresholds, and TBT (Total Blocking Time) from Lighthouse.

| Metric | Target   | In Lighthouse   |
| ------ | -------- | --------------- |
| LCP    | ≤ 2.5 s  | Lab measurement |
| CLS    | ≤ 0.1    | Lab measurement |
| TBT    | ≤ 200 ms | Lab measurement |

Performance measurement constraints:

- When a change could affect speed, such as images, fonts, scripts, or layout, measure the affected pages on the built site (`npm run build`, then `npm run preview`), not the development server.
- Use [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview)'s default mobile settings. Run it temporarily with `npx lighthouse`; do not add it to `package.json`.
- Report the numbers and the settings used, including the Lighthouse and Chrome versions. Flag any measured value that misses its target as an open problem.
- Report INP as "not measured". TBT indicates main-thread blocking in a lab run; it does not substitute for INP, so do not claim a Core Web Vitals pass from Lighthouse results.
- If you cannot measure, report "not measured" and do not claim a pass. This does not block the change; the maintainer decides.
- CI has no performance check.

## Phones and screenshots

- For any change visible on screen, check emulated phones at a narrow (about 375 px) and a wide (about 430 px) width. Label the results "emulated, not a real phone". No specific device models are required.
- Emulation approximates a phone's viewport, pixel density, and touch input in a desktop browser. It does not reproduce a phone's browser, on-screen keyboard, toolbars, safe areas, or performance; see [Playwright device emulation](https://playwright.dev/docs/emulation) and [Chrome DevTools' mobile simulation limitations](https://developer.chrome.com/docs/devtools/device-mode#limitations).
- When a change depends on real phone behavior, such as the on-screen keyboard, sticky elements, notch or safe areas, or shrinking toolbars, flag "needs a real-phone check" and list what to look at. The maintainer checks flagged items on real phones before merge. If a required device is unavailable, report the affected real-phone checks as "not done: no device".
- Attach screenshots of what changed, at desktop and phone width, for a person to review. There is no automated screenshot comparison or mobile browser project.

## Report results

Post the detailed test plan, results, and evidence in chat. Keep the pull request's Validation section a concise summary. For each check, include:

- What was checked.
- How: the tool, the settings, and whether the device was emulated or real.
- The result, with numbers or screenshots where there are any.
- What was not checked and why, including items flagged for the maintainer.
- Any open problems.

This lists what to include, not a format.
