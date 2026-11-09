# Website coding standards

A customizable starting point for coding informational websites for small and medium-sized businesses. Use the simplest maintainable implementation that meets the agreed requirements.

## Scope and project choices

- Apply relevant standards to the requested change and the code or site content directly affected by it. Conditional rules explain how to implement a capability, not whether to add it.
- Do not add capabilities, refactor unrelated code, or fix pre-existing issues merely to satisfy this document. Flag unrelated issues without changing them.
- If completing the task correctly requires expanding the agreed scope, explain why and obtain the user's authorization.
- Always flag misalignments, contradictions, safety concerns, missing decisions, and trade-offs in the current conversation before implementing affected behavior. This includes conflicts between security, privacy, accessibility, internationalization, performance, maintainability, and visual polish.
- Use approved task requirements and repository configuration for architecture, content sources, editing workflow, and rendering choices.
- Take approved website facts from [website-facts.yaml](website-facts.yaml) and other approved values from repository configuration. When a task depends on an undecided fact, flag it before implementing the dependent behavior.
- Do not introduce or replace systems, frameworks, styling tools, runtimes, dependencies, or services without the user's authorization. Written approval already in the task is sufficient.
- Reuse the components agreed for the task. If one cannot meet the requirements, explain the gap and agree whether to extend it or create a new component. Choices already approved for the task need no further approval.

## Implementation practices

- Before editing, inspect the code being changed and the directly related components, styles, and configuration needed to understand its behavior.
- Review related open and closed GitHub issues for historical context and planned work. Treat them as context; use the current issue and approved task requirements to determine what to implement.
- Follow installed APIs and versions in [package.json](package.json) and [package-lock.json](package-lock.json); do not upgrade packages just to match an online example.
- Keep changes focused: reuse existing code, remove superseded code within the task, and avoid speculative infrastructure or abstractions created only to reduce line count.
- Use `.astro` components for markup that does not need client-side state.
- When implementing primary content and navigation for indexable pages, render them in the initial HTML response. See [JavaScript rendering guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
- Add client-side JavaScript only when HTML and CSS cannot meet the agreed interaction. Use a small Astro client script for simple behavior or a React island when its state model warrants it. See [Astro scripts and event handling](https://docs.astro.build/en/guides/client-side-scripts/).
- Hydrate framework components only when they need client-side behavior. Choose the directive that meets the component's agreed interaction and loading requirements; see [Astro hydration](https://docs.astro.build/en/guides/framework-components/#hydrating-interactive-components).
- Keep browser globals such as `window` out of build-time code and module initialization that also runs on the server.
- Clean up listeners, observers, and timers when the owning component's lifecycle ends.
- Use TypeScript for application logic and component props.
- Preserve strict TypeScript checking. Fix type errors rather than hiding them with `any`, unjustified type assertions, or comments that disable type checking. See [TypeScript types and assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html).
- Use the existing Node.js runtime for repository scripts; plain JavaScript ES modules suit directly executable tooling.
- Use PascalCase for component files and types, camelCase for functions and variables, and lowercase kebab-case for other new filenames, except framework-required names and agreed public URLs. Name route segments by the [URL conventions](#urls-and-metadata).
- Follow the repository's [Prettier](prettier.config.mjs) and [ESLint](eslint.config.mjs) configurations for formatting and linting.
- Write comments to explain constraints or decisions rather than restating the code.
- Prefer native APIs and installed capabilities when they meet the need; a maintained library can be justified for complex behavior.
- Use npm and keep intentional manifest and lockfile changes together.

## Styling and browser support

- Use the project's established styling approach; this repository uses Tailwind and Astro scoped styles.
- Keep shared theme values and intentional global rules in `src/styles/global.css`; keep component-specific rules with their component.
- Reuse existing scales and tokens, adding only those needed by the approved design.
- With Tailwind's CSS-first configuration, keep `@import "tailwindcss"` and use `@theme` for values that should generate utilities; use ordinary custom properties otherwise. See [theme variables and examples](https://tailwindcss.com/docs/theme).
- Map variants to complete, statically discoverable Tailwind class names rather than interpolated fragments. See [class detection and examples](https://tailwindcss.com/docs/detecting-classes-in-source-files).
- Put custom rules in the intended cascade layer: normal unlayered rules, including Astro scoped styles, override normal layered utilities. Resolve conflicts through the [cascade](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Introduction) rather than escalating specificity or `!important`.
- Implement responsive layouts with intrinsic sizing, Grid, Flexbox, and fluid sizing; use container queries for component-width dependencies and media queries for viewport or user preferences.
- Prefer `rem` for shared font sizes. Keep the root font size responsive to the browser's default text-size setting. See [font-size guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-size).
- Preserve browser zoom, including pinch-to-zoom, when configuring the viewport and touch-interaction styles. See [MDN's viewport guidance](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport) and [Tailwind's touch utilities](https://tailwindcss.com/docs/touch-action).
- Allow text to wrap and grow without clipping; avoid fixed text-container heights and manual spacing or line breaks used for layout.
- Use CSS properties that follow the text's writing direction, such as `margin-inline-start` instead of `margin-left`. Use fixed sides only when the design requires them. See [logical properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Logical_properties_and_values).
- Support the current stable versions of Chrome, Edge, Firefox, and Safari on desktop, Safari on iPhone, and Chrome on Android.
- Choose platform features that are [Baseline Widely available](https://web.dev/baseline), using feature-specific compatibility data, and account for [Tailwind's browser requirements](https://tailwindcss.com/docs/compatibility).
- Older browsers need not match the design. Keep essential content and controls usable when an enhancement is unsupported; use feature detection when dependent behavior needs guarding.

## Semantic HTML and interactions

Meet [WCAG 2.2](https://www.w3.org/TR/WCAG22/) level AA. Use [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/practices/) for implementation details and examples.

- When implementing a page, use appropriate landmarks, one page-level `h1`, and a logical heading hierarchy.
- Choose HTML elements by the meaning and purpose of the content; use generic `div` or `span` elements when no semantic element fits. If the intended meaning is unclear, flag it in the current conversation. See [HTML elements guidance](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements).
- Use an anchor with a real destination for navigation and a button for an action.
- Prefer native controls whose semantics fit the agreed interaction rather than clickable `div` or `span` elements.
- Preserve native activation and cancellation behavior for buttons and links.
- For custom pointer interactions, activate on release and implement the agreed cancellation or undo behavior. Follow [WCAG's pointer-cancellation guidance](https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html) for interactions that require activation on press.
- Implement keyboard behavior, focus management, dismissal, and ARIA state together for custom interactions.
- Preserve visible keyboard focus and keep focused controls unobscured by overlays or sticky content.
- Preserve native touch scrolling; do not make functionality available only through hover.
- When implementing custom gestures or dragging, include an agreed simple tap/click alternative unless the gesture is essential. Flag missing alternatives before implementation.
- Implement touch targets using the agreed dimensions and spacing; flag conflicts with accessibility requirements before changing the design. See [WCAG input guidance](https://www.w3.org/WAI/WCAG22/Understanding/input-modalities).
- Respect reduced-motion preferences when implementing motion.
- Associate form controls with their visible labels, instructions, and field errors.
- Announce asynchronous results through the applicable live-region or status mechanism without unexpected focus changes.
- Implement the approved image alternatives, using empty `alt` text for decorative images; flag missing alternatives for informative images.

## Text, fonts, and languages

- Preserve approved text, punctuation, and character widths when implementing it.
- Keep files and output UTF-8, set the page's actual `lang`, and mark passages in another language. Language tagging affects pronunciation and text rendering; see [HTML language guidance](https://www.w3.org/International/questions/qa-html-language-declarations).
- Use the agreed locale for formatted dates and numbers, and an explicit time zone for date/time values that depend on it, so output does not depend on the build machine's defaults.
- Implement the approved typography with language-appropriate fallback fonts and line-breaking behavior; avoid blanket `word-break: break-all` and Latin-specific spacing applied across scripts.
- When pronunciation annotations are required, use native `ruby` and `rt` elements. See [W3C examples](https://www.w3.org/International/articles/ruby/markup.en.html).
- When vertical text is required, implement it with CSS `writing-mode`. See [W3C guidance](https://www.w3.org/International/articles/vertical-text/).
- When implementing custom keyboard actions, respect input-method editor (IME) composition so Enter can confirm a character selection without accidentally submitting. Use composition handling compatible with the [supported browsers](#styling-and-browser-support); see [MDN's IME event guidance](https://developer.mozilla.org/en-US/docs/Web/API/Element/keydown_event#keydown_events_with_ime).
- Load only the font families, weights, and styles required by the approved design. See [Astro font handling](https://docs.astro.build/en/guides/fonts/).
- Flag requested weights or styles that a font does not provide rather than silently substituting or [synthesizing them](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-synthesis).
- When implementing multilingual routes, follow the [localized URL pattern](#urls-and-metadata) and the agreed locale and fallback requirements; use [Astro's i18n helpers](https://docs.astro.build/en/guides/internationalization/) when its i18n routing is configured.
- When implementing a required language switcher, link to published equivalent pages and follow the agreed behavior for unavailable translations.
- Keep translated messages intact rather than assembling sentences from independently translated fragments.

## URLs and metadata

- Use clean page URLs, as configured by `trailingSlash` and `build.format` in [astro.config.mjs](astro.config.mjs): `/` for the homepage and no trailing slash or `.html` suffix for other pages, such as `/about`. Use this form for canonical and `og:url` values, internal page links, and sitemap entries. During builds, `Astro.url.pathname` ends in `.html`, such as `/about.html` or `/index.html`; reuse the path normalization in [BaseLayout](src/layouts/BaseLayout.astro) when deriving page URLs from it.
- Name new path segments and slugs with lowercase letters and hyphens between words where the script has case and word spacing. Approved slugs may use native-language characters, non-Latin scripts, or translated words; English or transliterated versions are not required. Framework-required names and agreed public URLs keep their required or agreed form.
- Reuse [BaseLayout and the shared site configuration](docs/configure-site-and-pages.md) to render the approved copy and configured site values. Consult that guide when configuring a site, changing shared metadata, or adding a page.
- Derive canonical and social URLs from the production URL, `production_url` in [website-facts.yaml](website-facts.yaml), not the preview host.
- Use the [sitemap and robots.txt configuration](docs/configure-sitemap-and-robots.md) for generated crawl-discovery files and explicit sitemap exclusions.
- When a project publishes more than one language, serve every language from the same origin. Default-language pages keep unprefixed paths, such as `/` and `/about`; other languages use `/<locale>` for their homepage and `/<locale>/<path>` for other pages, in the clean form above, where `<locale>` is the locale's path in `i18n.locales`. Configure published languages in `i18n.locales` and the default language in `i18n.defaultLocale` in [astro.config.mjs](astro.config.mjs), and set `i18n.routing.prefixDefaultLocale: false` when enabling i18n routing. The `language` fact in [website-facts.yaml](website-facts.yaml) sets only the HTML `lang` attribute.
- When implementing `hreflang`, use reciprocal, self-inclusive links for published equivalents, with absolute URLs; see [localized-page guidance](https://developers.google.com/search/docs/specialty/international/localized-versions).
- When implementing required structured data, keep its values consistent with the approved content visible on the page. See [Google's structured-data guidance](https://developers.google.com/search/docs/appearance/structured-data/sd-policies).

## Media and performance

- Use Astro image components for local images processed from `src/`; use `public/` for files copied unchanged and the agreed approach for externally managed media. See [Astro images](https://docs.astro.build/en/guides/images/).
- Use Astro's responsive image support or explicit responsive sources and accurate `sizes` for the rendered layout.
- Reserve dimensions or aspect ratio for media and embeds to reduce Cumulative Layout Shift (CLS).
- Do not lazy-load the likely Largest Contentful Paint (LCP) image; lazy-load off-screen media when it can wait until approached.
- Keep event handlers responsive and avoid unnecessary main-thread work to support Interaction to Next Paint (INP).

See [Core Web Vitals](https://web.dev/articles/vitals) for the definitions of these metrics.

## Data, privacy, security, and failures

- When consuming external data, check the fields, types, and allowed values required for its intended use. Reuse existing validation code when available.
- Validate external destinations and inputs in ways aligned with their intent.
- Keep secrets and private personal data out of source, logs, client bundles, and generated HTML, including data serialized during builds.
- Escape content by default; use raw HTML injection only with explicit trusted sources or sanitization. See [Astro's `set:html` behavior](https://docs.astro.build/en/reference/directives-reference/#sethtml).
- Preserve configured security protections when changing scripts, styles, or embeds; resolve [CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP) violations without weakening the policy merely to suppress errors.

> **Pending reference — Template issue [#31](https://github.com/joebaz/web-starter/issues/31):** Repository security and privacy guidance, including requirements for any approved forms, is not yet defined. Use the safeguards and consent behavior approved for the task; flag missing requirements before implementing dependent behavior.

- Handle expected failures explicitly using the project's established error-handling approach.

> **Pending reference — Template issue [#30](https://github.com/joebaz/web-starter/issues/30):** Repository error-handling guidance is not yet defined. Use behavior explicitly approved for the task; flag missing decisions before implementing dependent behavior.
