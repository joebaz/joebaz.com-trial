# Make the Template copy cleanly into new repositories: implementation plan

Issue: [#86](https://github.com/joebaz/web-starter/issues/86)

## Requirements

- Approved requirements: [parent contract](../specs/45-bootstrap-website-repos.md), originally approved at SHA-256 `0a03551c7d88833bec1ab19736099fda12d666ee59baac56a1732e0288328a90` in [the Maintainer's spec approval](https://github.com/joebaz/web-starter/issues/45#issuecomment-6619338739), with the [approved approach and split](https://github.com/joebaz/web-starter/issues/45#issuecomment-6618952948). Current repository snapshot: blob `2affdb71fb5dc8ccc431218050b1422d08025abc` at baseline `e3aa1b5da573bd0f91c66ef024c7e90cc395845b`, including the recorded #85 decisions. Relevant requirements are Stories 2–3, 12, 23–27 and Testing Decisions seams 1–2; #87 implements the bootstrap steps that consume this work.
- Acceptance criteria: the eight checkboxes in [#86's body](https://github.com/joebaz/web-starter/issues/86#acceptance-criteria), in their existing order. Body snapshot: SHA-256 `e3007aae357178d4dd22711e9c899e516d33cab97cea545807e57f98e027c239`, calculated from `gh issue view 86 --json body --jq .body` including its final output newline, on 2026-11-04. The criteria were accepted with the parent split; no new interview is needed.
- Additional scope approved on 2026-11-05: the Maintainer selected **"Include all three fixes (Recommended)"** for R1 fixture-route/sitemap isolation, R2 an independent no-image fixture, and R4's three additional documentation paths. Evidence: Coordinator message `918c8c0e-7d5b-4b41-bf85-4b0e99e968a8` relaying that decision. After the Planner's impact report `effd83fe-e3ef-44fe-b971-026c9407c337`, Coordinator message `0f4f674c-ef6b-43ee-ba5a-e712ec90eb28` confirmed it matched the approval and cleared this plan revision. This scope approval does not approve the final plan, README outline, or implementation. The parent contract is not edited.
- Dependency #85 is closed and merged through [#90](https://github.com/joebaz/web-starter/pull/90). Baseline and fetched `origin/main` are both `e3aa1b5`; branch: `feature/template-copy-portability`.
- One Vertical Slice: a copied repository tolerates valid website facts and homepage Content changes while retaining meaningful tests and portable repository instructions. No site behavior, dependencies, GitHub settings, live labels, bootstrap script, or runbook is implemented here. No commits, pushes, merges, or approvals by agents.

## Existing coverage to retain

#85 already supplies default, all-undecided, named-site, invalid-production-url, and missing-key facts fixtures. Their configs call the site's `createConfig` through `createFixtureConfig`. The default browser fixture sets `production_url: https://example.com`, `language: en`, and no site name; the named-site fixture sets `Example Site`, `https://example.com`, and `fr`. All-undecided coverage already checks warnings, omitted tags, no sitemap, and robots.txt without a sitemap reference. Configured coverage already checks metadata, normalized paths, sitemap exclusions, social images, and robots.txt. Invalid-input tests already exercise build failures.

Reuse those inputs and tests. Their expected values remain literal test expectations; do not read facts, config exports, or component source to derive expected output. It is legitimate for the site under test to consume a fixture's facts file. The known incidental validation of the root facts file during config import stays documented; removing it belongs to [#89](https://github.com/joebaz/web-starter/issues/89), not this issue.

The fixture at `tests/fixtures/about.astro` already owns independent page props: title `About`, description `About page description.`, image `/images/about.png`, and alt `About image description.`. Reuse it, moving its injected routes away from ordinary Project paths. Add only the independent no-image page required by R2; do not add another facts reader.

## Fixture routes and inputs

All injected routes live under the test-only `/test-fixtures` prefix, reserved for these fixtures. Only the fixture config injects them; the normal production config does not. Real Project pages such as `/about` stay untouched. Update route comments, canonical/social URL literals, generated-file reads, and sitemap expectations together:

| Route                           | Entrypoint                            | Built HTML path                     | Sitemap expectation with a configured URL      |
| ------------------------------- | ------------------------------------- | ----------------------------------- | ---------------------------------------------- |
| `/test-fixtures/about`          | existing `tests/fixtures/about.astro` | `test-fixtures/about.html`          | Included                                       |
| `/test-fixtures/articles/index` | existing `tests/fixtures/about.astro` | `test-fixtures/articles/index.html` | Included, retaining the nested `index` segment |
| `/test-fixtures/excluded`       | existing `tests/fixtures/about.astro` | `test-fixtures/excluded.html`       | Excluded, but the page still builds            |
| `/test-fixtures/no-image`       | new `tests/fixtures/no-image.astro`   | `test-fixtures/no-image.html`       | Included                                       |

The new no-image page uses BaseLayout with title `No image`, description `No-image fixture description.`, no `image` prop, and a `<main>` containing `<h1>No image</h1>`. Its title and metadata assertions use those literal test inputs. The image-bearing page retains `/images/about.png` and `About image description.` as its image inputs; moving its route does not change those values.

## Operations

### 1. Isolate fixture routes and make browser checks independent of homepage Content

- Owner: Coder, assigned by the Coordinator.
- Files and actions:
  - `tests/fixtures/astro.config.mjs`: inject the four routes from the table. Reuse the existing image-bearing page for the first three, and resolve the new no-image entrypoint alongside it. Change the module-level exclusion push and its comment from `/excluded` to `/test-fixtures/excluded`, retaining the once-per-module behavior. Do not edit the exclusion declaration in root `astro.config.mjs`, duplicate the fixture factory, or inject `/about`, `/articles/index`, or `/excluded` anymore. Existing default/named/undecided/invalid fixture configs keep using this factory unchanged.
  - `tests/fixtures/no-image.astro` (new): create the independent no-image page described above, importing the existing BaseLayout. No new dependency, asset, or runtime component is needed.
  - `tests/smoke/example.spec.ts`: replace exact Template title and heading expectations with a check that `/` responds with HTTP 200, has exactly one level-1 heading, that heading is visible, and the document title contains its nonempty text after collapsing whitespace runs to single spaces and trimming. Add the one-line comment `// The approved structural rule requires the homepage title to include its h1.` Retain an axe scan of the loaded homepage through `expectAccessible`. The heading text is observed page structure for this smoke check, not a configuration value used as its own expected value. Do not require exact title/heading equality or weaken the test to merely finding any heading or any nonempty title.
  - `tests/smoke/metadata.spec.ts`: move exact page title, description, `og:title`, and `og:description` assertions to `/test-fixtures/about`. Under the default browser fixture, expect title `About`, `og:title` `About`, both description tags `About page description.`, language `en`, canonical and `og:url` `https://example.com/test-fixtures/about`, and no `og:site_name`. Retain charset, viewport, favicon, and `og:type` checks. Expect image URL `https://example.com/images/about.png`, alt `About image description.`, and `summary_large_image`. Fold the current separate non-root canonical test into this fixture metadata test. Add a `/test-fixtures/no-image` check that the response is HTTP 200, its title is `No image`, `og:image` and `og:image:alt` are absent, and the Twitter card is `summary`. Keep a small `/` test only for root canonical and `og:url` `https://example.com/`; the homepage must have no exact title/description or image-absence/card-type expectations.
  - `tests/smoke/not-found.spec.ts`: retain the missing-URL HTTP 404, `Page not found` heading, exact explanatory copy, `Go to the homepage` link text and `/` destination, and accessibility checks. Change only the post-click homepage assertion that currently expects `Astro Web Starter`: assert navigation success and one visible, nonempty level-1 heading instead. The 404 assertions remain checks of the actual default page, not a test-only replacement.
- Do not start before: Architect assessment, decisions on all recommendations, Maintainer approval of this plan revision, and Coordinator Coder briefing under the Lifecycle.
- Output and handoff: uncommitted browser-test changes, continued by operation 2.
- Check: `npx playwright test tests/smoke/example.spec.ts tests/smoke/metadata.spec.ts tests/smoke/not-found.spec.ts` passes in Chromium, Firefox, and WebKit using the existing Playwright-managed fixture server. Every exact page-copy assertion is now fixture-owned or default 404 copy.

### 2. Keep independent configured and unset build coverage

- Owner: the same Coder, sole editor.
- Files and actions:
  - `tests/smoke/build.spec.ts`: in the undecided metadata test, open `test-fixtures/about.html` for exact title `About` and `og:title` `About`, preserving warnings, omitted language, canonical, `og:url`, and site-name assertions. This exercises unset values against independent page props rather than the editable homepage.
  - In the configured test, retain the homepage's literal root canonical/`og:url` and language checks, but remove its exact `Astro Web Starter | Example Site` expectation. Open `test-fixtures/about.html` and retain title `About | Example Site`, known descriptions, `og:site_name`, image URL/alt, and image card checks. Its canonical and `og:url` must be `https://example.com/test-fixtures/about`. Read `test-fixtures/articles/index.html` and expect `https://example.com/test-fixtures/articles/index`, preserving the distinct nested-index normalization check.
  - In the configured sitemap test, parse `sitemap-index.xml` with the existing XML helper, require the literal `https://example.com/sitemap-0.xml` entry, and allow other sitemap entries. Read the local generated sitemap files referenced by that index and collect their page URLs. Require `https://example.com/`, `https://example.com/test-fixtures/about`, `https://example.com/test-fixtures/articles/index`, and `https://example.com/test-fixtures/no-image` to be present; require `https://example.com/test-fixtures/excluded`, `https://example.com/404`, and `https://example.com/robots.txt` to be absent. Allow additional Project page URLs and any ordering rather than asserting an exact global page list. Still open `test-fixtures/excluded.html` and assert its canonical URL is `https://example.com/test-fixtures/excluded`, proving exclusion affects the sitemap only. These literal URL expectations come from test inputs, not configuration reads. Keep the exact robots.txt output, unset-sitemap behavior, and both invalid-facts tests.
  - Keep the built default 404 heading test, renaming `template build includes the custom 404 page` to the portable `build includes the custom 404 page`. No changes are needed to facts fixtures, `playwright.config.ts`, root `astro.config.mjs`, or runtime components.
  - Audit all tests for remaining assertions tied to homepage copy or root facts. Remove such dependencies within the listed test files rather than calculating expectations from the root file, imported configuration, or source markup.
- Do not start before: operation 1.
- Output and handoff: the same diff with meaningful unset and configured build coverage, continued by operation 3.
- Check: `npx playwright test tests/smoke/build.spec.ts --project=chromium` passes. Review `rg -n 'Astro Web Starter|A template for informational|website-facts|readFile|from .*config|/about|/articles/index|/excluded' tests` results: no Template homepage copy remains in expectations, fixture facts are inputs rather than sources of expected values, and injected fixture URLs/file reads use the prefix consistently. The image path `/images/about.png`, fixture entrypoint name, and unrelated lint markup examples are valid matches, not route-migration work. The existing build cache, serialized builds, temporary-output cleanup, and browser-independent skip stay intact.

### 3. Add the single label definition

- Owner: the same Coder, sole editor.
- Files and actions:
  - `.github/labels.yml` (new): one YAML sequence of objects with `name`, `color`, and `description` keys. Quote the six-character colors, omit `#`, and preserve the exact names, colors, and descriptions from the Coordinator's live GitHub snapshot of 2026-11-04:

    | Name              | Color    | Description                             |
    | ----------------- | -------- | --------------------------------------- |
    | `content`         | `60fd76` | site copy/images/events/links           |
    | `docs`            | `bfd4f2` | repository instructions/workflow docs   |
    | `feature`         | `1e27c4` | new capability or site enhancement      |
    | `fix`             | `e73350` | broken behavior/layout/accessibility    |
    | `needs-info`      | `D4C5F9` | Waiting for more information            |
    | `needs-triage`    | `FBCA04` | Maintainer needs to evaluate this issue |
    | `ready-for-agent` | `0E8A16` | Ready for an agent                      |
    | `ready-for-human` | `1D76DB` | Requires human implementation           |
    | `wontfix`         | `FFFFFF` | Will not be actioned                    |

  - Store the operational label definitions only in this file. Existing issue forms and triage guidance continue referencing names and roles; they are consumers, not a second color/description inventory. Do not add `wayfinder:*`, synchronize labels, or add automation here. #87's script will read this file.
- Do not start before: operation 2.
- Output and handoff: a data-only canonical label file, continued by operation 4.
- Check: parse the file with the already installed `yaml` package using a temporary Node command; confirm nine unique names, strings for all three fields, six hex digits per color, and the exact snapshot above by review. Check that issue form category names and triage role names resolve to this set. No dependency or permanent test framework is needed for this data file.

### 4. Make repository documentation portable

- Owner: the same Coder, sole editor.
- Files and actions:
  - `README.md`: substantially revise using the concrete outline below. First send that outline through the Coordinator for the required Maintainer outline approval before expanding the prose; record explicit evidence if it is approved together with the plan. Describe repository tooling, commands, agent skills/setup, and docs. Keep website facts exclusively behind the existing facts-file pointer, and remove `private` from the opening. Confine every statement that identifies this repository as the Template to one block, with the markers and opening below. Reword the Deployment section as instructions about the build output and configuration, not claims about what every derived Project hosts or which features it must have. Keep operational Wiki links intact for #87 to retarget; do not retarget provenance or pending Template issue links.
  - `coding-standards.md`: change the two pending-reference labels to `Pending reference — Template issue [#31](https://github.com/joebaz/web-starter/issues/31)` and `Pending reference — Template issue [#30](https://github.com/joebaz/web-starter/issues/30)`. Preserve their guidance and absolute Template URLs. Replace `this starter uses Tailwind and Astro scoped styles` with the portable `this repository uses Tailwind and Astro scoped styles`.
  - `AGENTS.md`: add exactly the one-line bootstrap instruction below under Repository guidance. It remains separate from the single README block so #87 can remove it at bootstrap completion. Verify `CLAUDE.md` still resolves to `AGENTS.md`; do not replace the symlink.
  - `docs/accessibility-testing.md`: replace the homepage example's `Astro Web Starter` locator with the structural rule from operation 1: HTTP 200, exactly one visible level-1 heading, nonempty whitespace-normalized heading text included in the title, then `expectAccessible`. Include the same one-line rule comment. Update the explanatory assertion bullets and readiness paragraph to match, while retaining the distinction between homepage structure and page-specific readiness for other pages and the default 404. Reword `The starter does not include this page or dialog` as `This is a hypothetical example; adapt the URL and locators to the implemented interaction.` Update the README testing link to `../README.md#testing-and-ci`, matching the proposed outline. Preserve the helper API, scan limits, and human review guidance.
  - `GLOSSARY.md`: change only the opening sentence to `Terms used when working with the Template and Projects built from it.` This corrects the copied self-description; definitions and preferred terms stay unchanged.
  - `docs/agents/domain.md`: in Scope and entry format, change only `this Template's shared agent-role and debt vocabulary` to `the Template's shared agent-role and debt vocabulary`. This corrects provenance without changing domain-model policy.
- Do not start before: operation 3, and recorded approval of the README outline before prose expansion.
- Output and handoff: portable documentation alongside the test and label changes, continued by operation 5.
- Check: review the README against `package.json`, `paseo.json`, `CONTRIBUTING.md`, the actual docs paths, and the preserved #85 testing caveat. There is exactly one start/end marker pair, no public/private requirement, no copied website facts, and the file listing includes `.github/labels.yml`. Both pending references explicitly say Template issue and point to this Template. AGENTS contains one bootstrap line. Audit repository Markdown outside historical plans/specs with `rg -n -i 'this (template|starter)|the starter|template build|Astro Web Starter' --glob '*.md' --glob '!docs/plans/**' --glob '!docs/specs/**'`; manually inspect README text outside the marked block as well as the rest of the audit results. Separate valid Template provenance references from copied self-descriptions and stale homepage smoke examples. Correct findings within the explicitly listed implementation paths; report findings outside that list without editing them. Confirm the accessibility example and its prose match the implemented structural test, the README anchor resolves, and the two provenance corrections change no definitions or policies.

#### Proposed README outline and opening

The Template-only block starts the file and includes its title and all Template-specific introduction:

```markdown
<!-- template-only:start -->

# Astro Web Starter

This repository is the [web-starter Template](https://github.com/joebaz/web-starter) for informational website projects.
<!-- template-only:end -->
```

Follow it with the portable opening: "This repository uses Astro, React, Tailwind CSS, and TypeScript. The sections below describe its tools, commands, agent workflow, and documentation."

Then use this section order:

1. **Requirements** — link to the `engines` declaration in [package.json](../../package.json) as the source of the supported Node range instead of repeating version numbers; list npm and Playwright browser installation, and link to CONTRIBUTING for setup without duplicating its workflow.
2. **Commands** — actual npm scripts, including format check, lint and Astro check as well as dev/test/build/preview; point to the package manifest for definitions.
3. **Agent workflow and skills** — AGENTS, role SOPs, Lifecycle, standards, and glossary links; the Agent-Setup Wiki link supplies skills and tool settings. Explain external skills are configured for the agent tool, not npm dependencies or files installed by this repository. Retain optional Paseo setup and its committed hook/script information, with a short table if useful.
4. **Testing and CI** — fixture-owned test inputs, browser engines, lint tests, axe, failure evidence and cleanup, and links to QA/accessibility guidance and CONTRIBUTING's validation section. Preserve the current fact that configs still validate the root facts file; do not claim complete root-file isolation or duplicate the full contribution checklist.
5. **Repository structure and docs** — retain an accurate file table, add `.github/labels.yml`, and link configuration, sitemap/robots, agent, and launch docs. Keep the Wiki launch/accessibility links operational and recognizable for #87.
6. **Website facts** — retain only the existing sentence: "[website-facts.yaml](website-facts.yaml) is the only place for facts about the website." The old Project facts section was already replaced in #85; do not restore it or invent values.
7. **Build and deployment** — `npm run build` produces `dist/`; link the configuration guide and launch checklist, and direct recording of the host to `hosting_provider` in the facts file. Describe the repository's tooling and the reader's next steps without prescribing hosting or repository visibility.

The block markers give #87 one replacement region for a new repository's title and generic provenance introduction. References to the Template as the origin of guidance may remain outside it when they remain true in derived repositories; assertions that the current repository itself is the Template may not.

#### Exact AGENTS bootstrap instruction

```markdown
- In a repository created from the Template that hasn't been bootstrapped yet, follow `docs/bootstrap-website.md`.
```

The runbook is deliberately a forward reference until #87, which is blocked on #86, creates it. Do not add a placeholder runbook or a partial bootstrap procedure to this issue. Report this sequencing limitation in the hand back.

### 5. Prove copy portability and complete validation

- Owner: the same Coder for validation; independent Reviewer dispatched later by the Coordinator.
- Files and actions: validate the implementation diff without adding further deliverables. Perform this reversible exercise in one controlled script/session:
  1. Record `git status --short --untracked-files=all` and verify the two tracked temporary inputs have no pre-existing diff with `git diff --exit-code -- website-facts.yaml src/pages/index.astro`. Create a directory with `mktemp` outside the checkout, save their exact bytes there, and record whether `src/pages/about.astro` already exists. If it exists, preserve its exact bytes too; never delete a pre-existing page. Install a cleanup handler before the first mutation to restore saved files and remove only a page newly created by this exercise, including when any command fails or the script is interrupted. Keep the backups until restoration is verified.
  2. Temporarily set root `site_name: Portability Check`, `production_url: https://portability.example`, and `language: ja`. Replace the homepage title with `Welcome — Portable homepage`, its h1 with `Portable homepage`, and description with `Copy portability check.`. Add a BaseLayout `image` prop with `src: "/favicon.svg"` (an existing public asset) and `alt: "Portability image."`. The longer title proves inclusion without exact equality; the image proves the homepage can gain social metadata without failing a no-image expectation. Preserve semantic structure and BaseLayout use.
  3. Create a temporary real `src/pages/about.astro`, importing `../layouts/BaseLayout.astro`, with title and h1 `Project About` and description `Project about description.`. If a page was present, modify only after saving it and restore it afterwards. This file is Project source, distinct from the injected `/test-fixtures/about` page. Do not add a permanent page to the deliverable.
  4. Run `npm test` and `npm run build`; both must pass with the changed facts, homepage, social image, and real Project page together. Inspect `dist/index.html` for title `Welcome — Portable homepage | Portability Check`, language `ja`, canonical `https://portability.example/`, social image `https://portability.example/favicon.svg`, and alt `Portability image.`. Inspect `dist/about.html` for the real Project title `Project About | Portability Check`.
  5. Build once with `npx astro build --config tests/fixtures/named-site/astro.config.mjs --outDir <temporary-directory>/fixture-dist`, using the same outside-checkout directory. Inspect `about.html` there for `Project About | Example Site`, and `test-fixtures/about.html` for `About | Example Site`, demonstrating that neither route overrides the other. Inspect its sitemap XML for the real `https://example.com/about` plus all required fixture URLs and absence of `https://example.com/test-fixtures/excluded`. Inspect `index.html` for the changed homepage image using the fixture URL `https://example.com/favicon.svg`, and `test-fixtures/no-image.html` for no `og:image` and card `summary`. This shows independent fixture inputs and both image states survive the Project changes.
  6. Restore the original facts and homepage bytes, and restore the original about page or remove only the about page this exercise created. Compare each restored file with its backup using `cmp`; run `git diff --exit-code -- website-facts.yaml src/pages/index.astro src/pages/about.astro`. For a newly created page, also assert it no longer exists, since Git's diff cannot detect untracked leftovers. Compare full `git status --short --untracked-files=all` with the pre-exercise scope; no temporary path may remain. Remove the outside-checkout directory only after successful restoration checks, then run the final baseline checks below so `dist/` also reflects the restored source. Report failure/restoration evidence even if the exercise fails.
- Do not start before: operations 1–4.
- Output and handoff: validation evidence and uncommitted implementation diff to the Coordinator, who follows independent review and Maintainer gates. Report any further #45/#87 findings without editing their contracts.
- Check: run all final checks below after restoring the temporary inputs. The ordinary homepage and all root facts must match the baseline, the temporary real Project page must be removed or restored, fixtures remain independently owned, and default 404 copy tests pass. Report the portability run, explicit fixture-output review, and restoration checks separately from the baseline results. Existing full-suite unset/configured/invalid scenarios remain the permanent coverage; do not add a duplicate configuration reader or permanent mutation test.

## Parallel read-only work

- The Architect assesses this plan revision before implementation, owned by the Architect and dispatched by the Coordinator. No implementation starts during assessment.
- During implementation, the Coordinator may inspect requirement coverage, README links, and the label snapshot read-only. Only the Coder changes implementation files. The Planner edits this plan only when assigned and with editing ownership coordinated.

## Final validation and hand back

- Scope — implementation files: `tests/fixtures/astro.config.mjs`, `tests/fixtures/no-image.astro` (new), `tests/smoke/example.spec.ts`, `tests/smoke/metadata.spec.ts`, `tests/smoke/not-found.spec.ts`, `tests/smoke/build.spec.ts`, `.github/labels.yml` (new), `README.md`, `coding-standards.md`, `AGENTS.md`, `docs/accessibility-testing.md`, `GLOSSARY.md`, `docs/agents/domain.md`. Existing `tests/fixtures/about.astro` and all facts fixtures are reused without edits. Task Artifacts: this plan, `docs/plans/86-template-copy-portability.md`; the linked parent spec is an existing reference, not edited. Local record: `.agent-state/86.yaml`, owned by the Coordinator and confirmed ignored with `git check-ignore .agent-state/86.yaml`. Temporary validation inputs: `website-facts.yaml`, `src/pages/index.astro`, and `src/pages/about.astro`, restored to their prior bytes/existence; backups and the extra fixture build live in a `mktemp` directory outside the checkout and are removed after verification. Standard build/test output follows existing cleanup/ignore rules. Explain any other path before hand back.
- Feature checks: `npm run format:check`, `npm run lint`, `npm run check`, `npm test`, and `npm run build` all pass. Playwright manages its own fixture server; follow CONTRIBUTING before launching any separate development server. Root all-undecided build warnings are expected.
- Intent checks: retain every existing configured/unset/invalid metadata and discovery behavior; prove homepage Content, valid root facts, a real `/about` page, and homepage social image can coexist without failing tests; verify fixture-route separation and independent no-image output; preserve the default 404 checks; review tests for self-derived expectations; parse and review the labels; review the README, Template references, bootstrap line, and updated documentation example for accuracy.
- QA scope: no shipped page, layout, CSS, interaction, or asset changes remain. Thus no new UI screenshots, phone checks, keyboard interaction coverage, or performance measurement is required for the baseline diff. Existing automated browser/accessibility checks continue; do not claim WCAG conformance or real-device coverage from them.
- Scope checks: `git diff --check`, `git diff`, and `git status --short --untracked-files=all`; inspect each new deliverable with `git diff --no-index -- /dev/null <path>` as the plans guide requires. Confirm all three temporary validation inputs returned to their initial bytes/existence and the CLAUDE symlink is intact. The prefixed pages must appear only in fixture builds; ordinary `npm run build` output must not contain a `dist/test-fixtures/` directory.
- Acceptance coverage: criteria 1 and 3 — operations 1–2 and the portability run; criterion 2 — preserved 404 tests in operations 1–2; criterion 4 — operation 3; criteria 5–7 — operation 4; criterion 8 — this full validation.
- Hand back to the Coordinator: exact implementation revision, changed-file list, required check results, portability evidence and restoration evidence, scope audit, README outline approval, and limitations. Keep detailed evidence in chat. The Coordinator obtains independent review, Maintainer final sign-off, and the signed-off Architect assessment under the Lifecycle; this plan does not replace those gates.
- Planner hand back: link this file from #86, name its git blob hash in chat and the issue comment, report plan-only formatting/scope validation, and release editing ownership. Architect re-assessment and Maintainer final plan/README outline approval remain outstanding; scope approval alone does not authorize implementation.

## Maintainer feedback and decisions

- Requirements and split accepted in the two linked #45 comments; #86 is already `ready-for-agent`. No additional interview or requirements contract is proposed.
- Coordinator direction on 2026-11-05: incorporate in-scope R3, R5, R6, R7 and R4's already-listed paths from the Architect's assessment of blob `0a3e3089549138ede7f0bfb3357ab0d0bdf6f3ce`. These recommendations are incorporated below; the requirements contract is unchanged.
- On 2026-11-05 the Maintainer selected `Include all three fixes (Recommended)`, approving R1, R2, and R4's three additional documentation paths. Coordinator message `918c8c0e-7d5b-4b41-bf85-4b0e99e968a8` relayed that scope decision and requested a pause/reload/impact report. The Planner reloaded plan blob `35923aebf5d19c2b0461ea1a2d85a5a7e9642b7d`, issue #86, and the parent contract, then sent impact report `effd83fe-e3ef-44fe-b971-026c9407c337` without editing. Coordinator message `0f4f674c-ef6b-43ee-ba5a-e712ec90eb28` confirmed the impact matched the approval and cleared the plan-only revision. All approved additions are now incorporated; no scope decision remains pending.
- The Architect must re-assess this material revised plan. Maintainer approval of the final plan revision and explicit README outline approval remain pending before implementation, through the Coordinator. Requirements approval and the scope approval above do not satisfy those gates.
- The #87 runbook forward reference and the #89 incidental root validation are known dependency boundaries, not extra implementation work for #86.

## Architect recommendations

The Architect assessed blob `0a3e3089549138ede7f0bfb3357ab0d0bdf6f3ce` as sound overall and supplied R1–R7, relayed by the Coordinator on 2026-11-05. Dispositions:

- **R1 — Accepted by the Maintainer; incorporated.** Move all injected routes/exclusion under `/test-fixtures`, update literal URL/output expectations, and require sitemap presence/exclusion while allowing additional Project pages. Operations 1–2 and the route table define the exact paths. Operation 5 proves a real Project `/about` coexists without being overridden, including fixture-build output and sitemap review.
- **R2 — Accepted by the Maintainer; incorporated.** Add `tests/fixtures/no-image.astro` and inject `/test-fixtures/no-image`; move `og:image` absence and `summary` checks there. The homepage has no image-absence or card-type expectation. Operations 1 and 5 verify both the independent no-image state and a temporary homepage with social metadata.
- **R3 — Incorporated, in scope.** The exact AGENTS line now applies to a repository created from the Template, excluding the Template itself; ASCII apostrophe retained. Affects operation 4.
- **R4 — Accepted by the Maintainer; incorporated.** Make the Tailwind reference and custom 404 build test name portable, audit Markdown outside historical plans/specs and README outside its block, update `docs/accessibility-testing.md`'s stale example/explanation, and correct the two copied self-descriptions in `GLOSSARY.md` and `docs/agents/domain.md`. Operations 2 and 4 specify exact changes; all three added paths appear in final scope.
- **R5 — Incorporated, in scope.** The portability exercise uses a title that differs from and contains its h1, backups created with `mktemp` outside the checkout, cleanup after failures, byte comparisons, `git diff --exit-code`, and a final scope status check. It also includes the authorized temporary real `/about` page and homepage social image, restoring each input's prior bytes/existence. Affects operation 5.
- **R6 — Incorporated, in scope.** Collapse observed h1 whitespace and trim before the title inclusion check, and explain the approved rule in a one-line comment. Affects operation 1.
- **R7 — Incorporated, in scope.** README Requirements links the package's `engines` declaration instead of copying a Node version range. Affects operation 4's outline.

All seven recommendations now have dispositions and are incorporated. This material revision needs Architect re-assessment, followed by Maintainer approval of the final plan revision and README outline. No implementation is authorized by this plan draft.
