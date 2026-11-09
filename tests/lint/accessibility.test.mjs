// @ts-check
import assert from "node:assert/strict";
import { test } from "node:test";
import { ESLint } from "eslint";

// Lints in-memory markup with the repository's ESLint configuration, so the
// invalid examples never exist as files that `npm run lint` would report.
// eslint-plugin-astro loads the accessibility plugin relative to the working
// directory, so run these tests from the repository root.
const eslint = new ESLint();

/**
 * @param {string} filePath
 * @param {string} code
 */
async function lint(filePath, code) {
  const [result] = await eslint.lintText(code, { filePath });
  // Messages without a rule ID, such as ignored files, show their text instead.
  return result.messages.map(
    ({ line, column, severity, ruleId, message }) =>
      `${line}:${column} ${severity === 2 ? "error" : "warning"} ${ruleId ?? message}`,
  );
}

const cases = [
  {
    filePath: "src/components/TeamPhoto.astro",
    invalid: `<img src="/team.jpg" />
<a href="/about"></a>
`,
    corrected: `<img src="/team.jpg" alt="Our team" />
<a href="/about">About us</a>
`,
    expected: [
      "1:1 error astro/jsx-a11y/alt-text",
      "2:1 error astro/jsx-a11y/anchor-has-content",
    ],
  },
  {
    filePath: "src/components/TeamPhoto.jsx",
    invalid: `export function TeamPhoto() {
  return <img src="/team.jpg" />;
}
`,
    corrected: `export function TeamPhoto() {
  return <img src="/team.jpg" alt="Our team" />;
}
`,
    expected: ["2:10 error jsx-a11y-x/alt-text"],
  },
  {
    filePath: "src/components/MenuToggle.tsx",
    invalid: `export function MenuToggle({ onToggle }: { onToggle: () => void }) {
  return <div onClick={onToggle}>Menu</div>;
}
`,
    corrected: `export function MenuToggle({ onToggle }: { onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle}>
      Menu
    </button>
  );
}
`,
    expected: [
      "2:10 error jsx-a11y-x/click-events-have-key-events",
      "2:10 error jsx-a11y-x/no-static-element-interactions",
    ],
  },
];

for (const { filePath, invalid, corrected, expected } of cases) {
  test(`reports inaccessible markup in ${filePath}`, async () => {
    assert.deepEqual(await lint(filePath, invalid), expected);
  });

  test(`accepts corrected markup in ${filePath}`, async () => {
    assert.deepEqual(await lint(filePath, corrected), []);
  });
}
