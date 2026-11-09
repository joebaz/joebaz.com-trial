# Accessibility linting

`npm run lint` checks component markup for accessibility problems that can be detected in source code. Reported problems are errors, so the command fails and lists each problem's file, line, column, and rule ID.

## Enabled coverage

[eslint.config.mjs](../eslint.config.mjs) enables two recommended presets, both backed by [`eslint-plugin-jsx-a11y-x`](https://www.npmjs.com/package/eslint-plugin-jsx-a11y-x):

| Files             | Preset                                                | Rule IDs                |
| ----------------- | ----------------------------------------------------- | ----------------------- |
| `.astro`          | `eslint-plugin-astro`'s `jsx-a11y-recommended` config | `astro/jsx-a11y/<rule>` |
| `.jsx` and `.tsx` | `eslint-plugin-jsx-a11y-x`'s `recommended` config     | `jsx-a11y-x/<rule>`     |

Both presets apply the same rules, marked as recommended in the [`eslint-plugin-jsx-a11y-x` rule list](https://github.com/es-tooling/eslint-plugin-jsx-a11y-x/blob/v0.2.0/README.md#supported-rules). The Astro plugin's [accessibility extension rules](https://ota-meshi.github.io/eslint-plugin-astro/rules/#a11y-extension-rules) adapt them to Astro templates. Rules that are not recommended upstream are off.

## Limits

- The rules read source markup. They cannot evaluate rendered pages, CSS such as color contrast or focus indicators, runtime state, or values that are only known at build time or run time, such as content from props or `set:html`.
- They check native HTML elements written in the file. Where a component is used, it is not checked as the elements it renders.
- They cover only `.astro`, `.jsx`, and `.tsx` files. Write React components that contain JSX as `.jsx` or `.tsx`.
- Passing lint does not establish accessibility conformance. Manual review and rendered-page checks remain part of QA.

## Maintain the configuration

`eslint-plugin-astro` loads its accessibility rules from `eslint-plugin-jsx-a11y` when that package is installed, and from `eslint-plugin-jsx-a11y-x` otherwise. Do not add `eslint-plugin-jsx-a11y`: it does not support the repository's ESLint version.

`npm run test:lint`, which also runs as part of `npm test`, lints representative invalid and corrected Astro, JSX, and TSX markup in memory and checks the reported rule IDs and locations. Run it from the repository root, where `eslint-plugin-astro` can resolve `eslint-plugin-jsx-a11y-x`.
