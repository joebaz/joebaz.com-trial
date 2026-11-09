# Keep website facts in one file: implementation plan

Issue: #85

## Requirements

- Approved requirements: [#85's body](https://github.com/joebaz/web-starter/issues/85), revision `sha256:5923cf4bc0ec79e8cc3c3b09305275394e0ebaa0fbbd5e9ccebe676f869a0705` (not edited since creation). The Maintainer accepted its acceptance criteria on 2026-11-04 at 09:24 JST.
- Parent contract: [spec 45](../specs/45-bootstrap-website-repos.md) at `1cead14`, approved 2026-11-04 at 09:42 JST. The parts for #85 are User Stories 15–22, the Implementation Decisions (the reading approach is this plan's choice; remove the "Project Fact" entry with no replacement; the README's Project facts section becomes a pointer; no ADR), Testing Decisions seams 1–2, and Further Notes, whose open language question the Maintainer decided on 2026-11-04 at 09:55 JST (see [Maintainer feedback and decisions](#maintainer-feedback-and-decisions)); the #45 agent owns the spec's update.
- Acceptance criteria: the seven in #85's body, numbered 1–7 below in their order.
- Baseline: `origin/main` at `c7a5aa3`.

## Terms used here

- **Fixture:** a test input that the tests own, kept under `tests/fixtures/`. In this plan, a fixture is an Astro config for a test scenario plus its own facts file.
- **Code-read facts:** the three facts Astro's build puts into pages: `site_name`, `production_url` and `language`.
- **Reader module:** `src/website-facts.ts`, which reads and validates a facts file.

## Language while undecided

The Maintainer decided that the Template's language stays undecided, like every other fact (see [Maintainer feedback and decisions](#maintainer-feedback-and-decisions)). While `language` is undecided:

- The layout omits the `lang` attribute when Astro's build renders a page, the same way it omits tags that need the production URL or site name. No placeholder tag such as `en` renders.
- Astro's build logs a warning that the language is undecided and names the key to set, alongside the production URL and site name warnings.

Rendering a fallback tag would break criterion 4. Failing the build would break criterion 3, and CI would fail on the Template itself. The cost of omitting the tag: the Template's own built and dev pages lack `lang` (a WCAG 3.1.1 failure) until a Project sets it. The Template is never deployed, and each fixture supplies its own language, so no Playwright test or CI check fails. The warning makes the Maintainer choose each Project's language, for example `ja` for a Japanese-only site, instead of inheriting `en`.

## Settled in this plan

- **Format.** Top-level snake_case keys, one per fact, in this order: `site_name`, `business_name`, `site_description`, `production_url`, `redirecting_hostnames`, `language`, `other_languages`, `hosting_provider`, `dns_provider`, `domain_registrar`, `analytics`, `user_data_stored`, `maintainer`, `client_approver`. "DNS provider and registrar" is two keys because they're often different companies. Values are strings; `redirecting_hostnames`, `other_languages`, `analytics` and `user_data_stored` may also be lists of strings.
- **Undecided vs none.** Undecided is an empty value (`site_name:` with nothing after the colon), which the YAML parser reads as null, so the Template's file reads as a blank form. "None" is the word `none`. The file opens with a short comment saying so, saying that secrets and credentials never go in it, and saying that adding a new fact needs the Maintainer's approval. Because a null can't render as text, a bug that skips a check omits a tag instead of printing a placeholder.
- **Validation.** The reader module fails Astro's build with a message naming the file and key when:
  - the file isn't a mapping, or any of the 14 keys is missing. Extra keys are allowed; the Maintainer approves a new fact in pull request review, which the reader module can't check.
  - a listed fact's value isn't null, `none`, a non-empty string, or (for list facts) a non-empty list of non-empty strings
  - a code-read fact isn't a value or undecided. `production_url` must be an absolute `http`/`https` URL, and `language` must be a valid language tag (checked with `Intl.getCanonicalLocales`); both checks already reject `none`, so only `site_name` needs an explicit `none` check.
- **Reading approach.** The reader module reads the file with Node.js's `fs` and the `yaml` package (Maintainer decision) when Astro loads its config. `astro.config.mjs` exports a config factory that takes a facts file's location, and its default export calls the factory with the root `website-facts.yaml`. The factory sets Astro's `site` from `production_url` and adds an Astro integration that:
  - gives the layout the site name and language through a virtual module, typed with a declaration
  - logs a warning during `astro build` for each undecided code-read fact
  - registers the facts file as a watched file, so Astro's dev server restarts when the Maintainer edits it

  The layout and the robots.txt route keep reading the production URL from `Astro.site`.

- **Test seams.** Seam 1 stays the build output. Seam 2 is the config factory's facts-file argument: each fixture passes its own facts file, and the Playwright tests check built pages, generated files, or build output. No test depends on the values in the root `website-facts.yaml`, and none compares a value with the file it came from. Each fixture's config imports `astro.config.mjs`, so the reader module still validates the root file during test builds (Reviewer finding F1; the Maintainer chose to reword the docs, 2026-11-04 15:12 JST, and moved the config-file relocation to a separate issue).

## Operations

### 1. Add the facts file and its reader

- Owner: Coder
- Files and actions:
  - `website-facts.yaml` (new): the 14 keys, all undecided, under the header comment from [Settled in this plan](#settled-in-this-plan).
  - `package.json`, `package-lock.json`: the Coder declares `yaml` `^2.9.1` in `dependencies` with `npm install`. It's already in the lockfile through Vite and the Astro language server, and it's in `dependencies` because Astro's build uses it.
  - `src/website-facts.ts` (new): the reader module's function that reads and validates a facts file at a given location and returns typed values, with null for undecided. Only this function calls `yaml`. Internal names are the Coder's choice.
- Do not start before: plan approval.
- Output and handoff: an uncommitted diff, continued by operation 2.
- Check: `npm run check` passes. Operation 4's invalid-fixture test covers validation through Astro's build.

### 2. Wire the facts into the config and layout

- Owner: Coder
- Files and actions:
  - `src/website-facts.ts`: add the integration from [Settled in this plan](#settled-in-this-plan): the virtual module for the site name and language, a build warning for each undecided code-read fact that names its key in `website-facts.yaml`, and the watched file.
  - The virtual module's type declaration (for example `src/website-facts.d.ts`).
  - `astro.config.mjs`: export the config factory, and make the default export call it with the root file. The factory sets `site` from the facts. Replace `warnAboutUnsetSiteValues` with the integration. Remove the comment telling readers to set `site` here. Keep `sitemapExclusions` and its export.
  - `src/layouts/BaseLayout.astro`: read the site name and language from the virtual module, and render `lang` only when the language is decided.
  - `src/site-config.ts`: delete.
- Do not start before: operation 1.
- Output and handoff: the same diff, continued by operation 3.
- Check: `npm run build` succeeds and Astro's build logs that the production URL, site name and language are undecided. In `dist/index.html` there's no `lang`, canonical, `og:url` or `og:site_name`, no title suffix, and no placeholder text, and no `sitemap*` file exists.

### 3. Give each test scenario its own fixture

- Owner: Coder
- Files and actions:
  - `tests/fixtures/astro.config.mjs`: export a fixture factory that takes a facts file and returns the root config factory's result plus the fixture routes (`/about`, `/articles/index`, `/excluded`) and the `/excluded` sitemap exclusion. Every fixture gets its routes and exclusion from this one factory, and none overrides facts after `mergeConfig`. The factory runs more than once, because importing this module from another fixture also runs its default export, so the Coder adds `/excluded` to `sitemapExclusions` only once: at module level, or in a way that's safe to repeat. The default export calls the fixture factory with `tests/fixtures/website-facts.yaml` (new): `production_url: https://example.com`, `language: en`, everything else undecided. The Playwright web server uses this default.
  - `tests/fixtures/named-site/`: replace `site-config.ts` and the `resolveId` swap with `website-facts.yaml` (new): `site_name: Example Site`, `production_url: https://example.com`, and a non-`en` `language` such as `fr`, so the Playwright test shows that language comes from the file. Its config calls the fixture factory with that file.
  - A new all-undecided fixture (for example `tests/fixtures/undecided/`), whose config calls the fixture factory with its own all-undecided facts file, for the unset-site builds.
  - One or two invalid fixtures, for example `production_url: none` and a missing key, each calling the fixture factory, for operation 4's failure test.
  - `playwright.config.ts`: drop `--site https://example.com` from the web server command, since the default fixture's facts file now supplies the URL. Replace the comment at line 39 so it calls `example.com` a reserved test domain used as a test input, not a project fact.
- Do not start before: operation 2.
- Output and handoff: the same diff, continued by operation 4.
- Check: `rg -n "website-facts.yaml" tests playwright.config.ts` shows only fixture paths, never the root file; `rg -n "site-config|--site|mergeConfig" tests playwright.config.ts` shows no `site-config` or `--site`, and `mergeConfig` only inside the fixture factory, if the Coder uses it there.

### 4. Update the build and metadata tests

- Owner: Coder
- Files and actions:
  - `tests/smoke/build.spec.ts`:
    - The unset-site tests build with the all-undecided fixture instead of the root config. They assert the warning text from operation 2, including the language warning, and that `<html>` has no `lang`.
    - `configuredBuildArgs` drops `--site`. The configured-metadata test also asserts that `lang` is the named-site fixture's tag.
    - Add one test showing that Astro's build fails on an invalid fixture with a message naming the key, for example `production_url: none`.
  - `tests/smoke/metadata.spec.ts`: update the opening comment to say that the default fixture's facts file supplies the URL, language and unset site name. The assertions don't change.
  - Homepage copy assertions ("Astro Web Starter") stay; that's #86's scope.
- Do not start before: operation 3.
- Output and handoff: the same diff, continued by operation 5.
- Check: `npm test` passes. The Coder sets `site_name: Changed` in the root `website-facts.yaml`, runs `npm test` again, and it still passes, which shows that no test depends on the root file. The Coder reverts that edit afterwards.

### 5. Point docs and code guides to the file

- Owner: Coder
- Files and actions:
  - `docs/configure-site-and-pages.md`: replace the three `site`/`siteConfig` bullets with setting `production_url`, `site_name` and `language` in `website-facts.yaml`, linking it. Keep the note that `language` sets only `lang`, not multilingual routing. Rewrite the "unset" paragraph for undecided facts, including language: the layout omits `lang` and Astro's build warns until it's set. Delete the paragraph telling readers to update tests when values change, since tests no longer depend on them.
  - `docs/configure-sitemap-and-robots.md` lines 3, 9 and 11: the production URL comes from `production_url` in `website-facts.yaml`, not `site` in `astro.config.mjs`. Keep the advice that the robots.txt route derives its sitemap reference from the production URL.
  - `coding-standards.md`:
    - Line 12 becomes: take approved website facts from [website-facts.yaml](website-facts.yaml) and other approved values from repository configuration; flag a task that depends on an undecided fact before implementing it.
    - Line 94: the production URL is `production_url` in `website-facts.yaml`.
    - Line 96: the `language` fact, not `siteConfig.language`, sets only the HTML `lang` attribute.
  - `README.md`:
    - Add a `website-facts.yaml` row to the file table: "Facts about the website, as an intake form".
    - Rename "Project facts" to "Website facts", and replace its two paragraphs with one sentence pointing to `website-facts.yaml` as the only place for facts about the website.
    - Line 127 says to record the chosen host as `hosting_provider` in `website-facts.yaml`.
- Do not start before: operation 4, so the docs describe tested behavior.
- Output and handoff: the same diff, continued by operation 6.
- Check: `rg -n "site-config|siteConfig|Project facts|#project-facts" --glob '!docs/plans/**' --glob '!docs/specs/**'` finds nothing.

### 6. Retire the glossary term and update the workflow docs and forms

- Owner: Coder
- Files and actions:
  - `GLOSSARY.md`: remove the **Project Fact** entry; add no replacement term.
  - `CONTRIBUTING.md` lines 41–42: a pull request that implements an issue updates any website fact the issue changes in [website-facts.yaml](website-facts.yaml) and links the issue. When a conversation changes a website fact, the agent opens or updates the decision issue and updates the file in the same pull request.
  - `.github/ISSUE_TEMPLATE/01-content.yml`, `02-docs.yml`, `03-fix.yml`, `04-feature.yml`: change the field's `label` to "Website facts affected" and its `id` to `website_facts_affected`. The `description` asks for changes to facts in `website-facts.yaml` at the repository root and says to leave the field empty if none change. GitHub renders Markdown in form descriptions, so it may link the file.
  - SOP Read sections: add `website-facts.yaml` to the Planner, Architect, Coder and Reviewer SOPs, since these roles plan, assess, build or check behavior that depends on site facts. The Researcher reads only what its questions need. The Coordinator's readiness check reads the file when needed, through the link at `coordinator.md:33`, so it needs no Read entry.
  - `docs/agents/roles/coordinator.md` line 33: "a decision, an undecided [website fact](../../../website-facts.yaml), or an artifact it doesn't have".
- Do not start before: operation 5.
- Output and handoff: the same diff, continued by operation 7.
- Check: `rg -ni "project fact" --glob '!docs/plans/**' --glob '!docs/specs/**'` finds nothing, and `npm run format:check` passes on the issue forms.

### 7. Validate and hand back

- Owner: Coder
- Files and actions: none beyond fixes the checks require.
- Do not start before: operation 6.
- Output and handoff: the diff and check output, to the Coordinator for the Reviewer.
- Check: see [Final validation](#final-validation-and-hand-back).

### Spec 45 proposal

Changes to spec 45 that follow from #85's decisions (Story 19's language warning, the parser and extra-keys decisions, and the language note in Further Notes) were proposed to the #45 agent, which owns the spec. #85 doesn't edit the spec.

## Parallel read-only work

- None needed.

## Final validation and hand back

- Scope:
  - Implementation files: `website-facts.yaml`, `src/website-facts.ts`, the virtual-module declaration, `src/site-config.ts` (deleted), `astro.config.mjs`, `src/layouts/BaseLayout.astro`, `package.json`, `package-lock.json`, `playwright.config.ts`, `tests/fixtures/**` (new, changed and deleted fixture files), `tests/smoke/build.spec.ts`, `tests/smoke/metadata.spec.ts`, `docs/configure-site-and-pages.md`, `docs/configure-sitemap-and-robots.md`, `coding-standards.md`, `README.md`, `GLOSSARY.md`, `CONTRIBUTING.md`, the four `.github/ISSUE_TEMPLATE/*.yml` forms, and the planner, architect, coder, reviewer and coordinator SOPs under `docs/agents/roles/`.
  - Task Artifacts: `docs/plans/85-website-facts-file.md`.
  - Local records: the execution checkpoint (the Coder confirms it with `git check-ignore`).
- Checks: `npm run format:check`, `npm run lint`, `npm run check`, `npm test` and `npm run build` all pass, and Astro's build logs the undecided warnings. Per criterion:
  1. The root file lists the 14 keys, and every value is undecided.
  2. Operation 4's configured build shows the title, `og:site_name`, `lang`, canonical, `og:url`, sitemap and robots.txt coming from the named-site fixture's file. `rg -n "site:|siteConfig" astro.config.mjs src` matches only the config factory's own `site:` line, so there's no other place to set them.
  3. Operation 2's check.
  4. Operation 2's `dist` check, and the unset-site tests.
  5. The `GLOSSARY.md` diff.
  6. Operation 6's checks.
  7. The commands above.
- Hand back: the diff summary, check output and per-criterion evidence, to the Coordinator.

## Maintainer feedback and decisions

- Language in the Template stays undecided, like every other fact, and criterion 1 isn't amended; for example, a Japanese-only site will be `ja` only (Maintainer in the Coordinator chat, 2026-11-04 09:55 JST, relayed by the Coordinator). Planned in [Language while undecided](#language-while-undecided); affects operations 1, 2, 4 and 5, and the [spec 45 proposal](#spec-45-proposal).
- Require all 14 keys and allow extra keys. The Maintainer approves a new key in pull request review, which the reader module can't check, and the file's header comment says new facts need the Maintainer's approval (Coordinator chat, 2026-11-04 10:12 JST; Architect R2). Affects [Settled in this plan](#settled-in-this-plan), operation 1 and the [spec 45 proposal](#spec-45-proposal).
- Parser: the Coder declares `yaml` `^2.9.1` in `dependencies` (Coordinator chat, 2026-11-04 10:24 JST). Affects operation 1 and the [spec 45 proposal](#spec-45-proposal).
- Reading approach confirmed: Astro's build takes the site name, production URL and language from `website-facts.yaml` and puts them into the page tags, as #85 says. No requirements change (Coordinator chat, 2026-11-04 10:24 JST).
- Spec 45 belongs to the #45 agent; no one on #85 edits it. The Coordinator restored it to `1cead14` in this checkout and sent the proposed edits to the #45 agent to take to the Maintainer (Maintainer correction, 2026-11-04 10:30 JST, relayed by the Coordinator). Affects the [spec 45 proposal](#spec-45-proposal) and the Task Artifacts.
- Writing note: name the actor in each mechanism, and say what "fixture" means where it's first used (Coordinator chat, 2026-11-04). Applied throughout this plan and the [spec 45 proposal](#spec-45-proposal).

## Architect recommendations

The Architect assessed revision `0155d0f` and found it sound. The Maintainer accepted all four recommendations (relayed by the Coordinator, 2026-11-04).

- R1: `tests/fixtures/astro.config.mjs` exports a fixture factory, so every fixture gets its routes and the `/excluded` exclusion from one place instead of overriding facts after `mergeConfig`: accepted; operation 3.
- R2: require all 14 keys and allow extra keys: accepted as the Maintainer decided; [Settled in this plan](#settled-in-this-plan) and operation 1.
- R3: state the rule as "code-read facts are a value or undecided", with only `site_name` needing an explicit `none` check; and the Coordinator reads the file through the `coordinator.md:33` link, so it needs no Read entry: accepted; [Settled in this plan](#settled-in-this-plan) and operation 6.
- R4: drop operation 2's root-file `production_url: none` check, since operation 4's invalid-fixture test covers it; criterion 2's `rg` expects only the factory's own `site:` line: accepted; operation 2 and [Final validation](#final-validation-and-hand-back).

The Architect assessed revision `8e5ac23` and spec 45 at `132a8e6`, found R1–R4 resolved, and made two more recommendations, both accepted (relayed by the Coordinator, 2026-11-04):

- N1: in spec 45's Further Notes, attribute only "ships `language` undecided, like every other fact" to the Maintainer's decision, and present omitting `lang` and warning as its consequence: accepted, passed to the #45 agent with the spec proposal.
- N2: the fixture factory adds `/excluded` to `sitemapExclusions` only once, because importing the fixture module from another fixture runs its default export and so runs the factory again: accepted; operation 3.

After assessing revision `6f1906f`, the Architect made one more recommendation, also accepted (relayed by the Coordinator, 2026-11-04):

- N3: spec 45 at `1cead14` still lists the Template's language as an open question in Further Notes, so the Requirements' parent-contract line notes the Maintainer's decision and that the #45 agent owns the spec's update: accepted; [Requirements](#requirements).

## Notes for the Coordinator

- `other_languages` is recorded in the file but doesn't drive Astro's `i18n.locales`; the issue names only URL, name and language as code-read. A Project that enables multilingual routing later would set its locales in both places. That's outside #85 (the Template has no i18n), but it touches Story 15's "keyed in twice". Raise it with the Maintainer if they want it tracked.
- The homepage title and heading assertions on "Astro Web Starter" are Template copy, left for #86.
- Architect note, no change to #85: #87's intake should make `language` a required answer. #87 isn't edited here.
