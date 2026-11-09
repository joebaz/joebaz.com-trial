<!-- template-only:start -->

# Astro Web Starter

This repository is the [web-starter Template](https://github.com/joebaz/web-starter) for informational website projects.

## Getting Started

1. On GitHub’s **Create a new repository** page, under **Start with a template**, select **joebaz/web-starter**. Choose the new repository’s owner, name, and visibility.
2. Clone the new repository and open it in your agent tool. Its machine setup is listed under [Requirements](#requirements) and in the Wiki's [Agent setup](https://github.com/joebaz/web-starter/wiki/Agent-Setup). [Paseo](https://paseo.sh/) is optional.
3. In a fresh agent session, send this prompt, replacing `<site-name>` with the website's name:

   ```text
   Bootstrap this repo for a new website called <site-name>.
   ```

The agent asks you a few setup questions, then does the work, including commits, pushes, and the pull request; you give final sign-off and merge. Bootstrap sets up the repository; website content comes later. The full procedure is in [docs/bootstrap-website.md](docs/bootstrap-website.md).

<!-- template-only:end -->

This repository uses Astro, React, Tailwind CSS, and TypeScript. The sections below describe its tools, commands, agent workflow, and documentation.

## Requirements

- A Node.js version within the `engines` range in [package.json](package.json)
- npm
- Playwright browsers, installed with `npx playwright install`

The repository's `.nvmrc` selects the Node major version, and `.npmrc` enables `engine-strict` to enforce the supported range. See [CONTRIBUTING.md](CONTRIBUTING.md#set-up-a-local-checkout) for setup.

## Commands

| Command                   | Purpose                                               |
| ------------------------- | ----------------------------------------------------- |
| `npm install`             | Installs dependencies from the manifest and lockfile  |
| `npm run dev`             | Starts the local Astro development server             |
| `npm run format`          | Formats repository files                              |
| `npm run format:check`    | Checks formatting without changing files              |
| `npm run lint`            | Runs ESLint, including accessibility source rules     |
| `npm run check`           | Runs Astro's type checker                             |
| `npm test`                | Runs lint configuration tests and browser smoke tests |
| `npm run test:lint`       | Runs only the lint configuration tests                |
| `npm run build`           | Builds the site into `dist/`                          |
| `npm run preview`         | Previews the completed build locally                  |
| `npm run bootstrap:check` | Checks GitHub and local setup for a repository        |
| `npm run bootstrap:apply` | Applies labels and delete-on-merge after approval     |
| `npx playwright install`  | Installs Playwright browser binaries                  |

Command definitions and dependency versions are in [package.json](package.json). Follow [development-server management](CONTRIBUTING.md#manage-development-servers) when starting or stopping a server.

## Agent workflow and skills

Start with [AGENTS.md](AGENTS.md) for repository guidance and the [role SOPs](docs/agents/roles/). The SOPs describe each role's work in the [Lifecycle](docs/lifecycle.yaml). Consult the [coding standards](coding-standards.md) for implementation conventions and the [glossary](GLOSSARY.md) for shared terminology. The Wiki's [Agent setup](https://github.com/joebaz/web-starter/wiki/Agent-Setup) describes the external skills and tool settings used by the roles. Configure those skills in the agent tool; they are not npm dependencies or files installed by this repository.

This repository supports [Paseo](https://paseo.sh/) for isolated, agent-assisted work. [paseo.json](paseo.json) contains committed configuration for worktree setup, scripts, and branch-name generation.

Paseo is optional; standard Node.js and npm tooling also supports development, tests, and builds. The Wiki's [Paseo setup](https://github.com/joebaz/web-starter/wiki/Paseo-Setup) describes its system prompt and agent profiles.

The configured worktree setup hook runs `npm ci` to install dependencies from the lockfile.

| Script          | Type    | Command         | Purpose                                         |
| --------------- | ------- | --------------- | ----------------------------------------------- |
| Dev Server      | Service | `npm run dev`   | Starts Astro for local visual review            |
| Playwright Test | Command | `npm test`      | Runs lint configuration and browser smoke tests |
| Build Site      | Command | `npm run build` | Builds the deployable site                      |

Paseo's local configuration, worktrees, logs, and credentials live outside the repository at `~/.paseo/`.

## Testing and CI

`npm test` first runs the lint configuration tests in `tests/lint/` with Node's test runner. It then removes stale Playwright output, runs the configured browser tests, and removes output after a successful run. Playwright manages a dedicated Astro test server built from a fixture, a test input the tests own under `tests/fixtures/` with its own facts file, which uses the reserved test domain `example.com`; see [playwright.config.ts](playwright.config.ts) for its command and port. Injected fixture pages use the reserved `/test-fixtures` prefix and own their exact copy and metadata inputs. The homepage smoke check verifies structure rather than fixed copy; the default 404 checks retain their exact copy assertions. No test depends on the values in the root `website-facts.yaml`, but each fixture's config imports `astro.config.mjs`, so the reader module also validates the root file and an invalid root file fails the test builds.

If a test fails, the final cleanup does not run. Fresh failure evidence remains in `test-results/` for diagnosis, including a screenshot. Routine successful runs do not create an HTML report. Generated Playwright output is ignored by Git.

The smoke tests cover Chromium, Firefox, and WebKit and include automated accessibility checks.

For adding page scans and interactive-state checks, see [Accessibility smoke tests](docs/accessibility-testing.md).

The [QA reference](docs/qa.md) sets the browser, accessibility, performance, and phone coverage that test plans must meet.

For human checks before launch, see the Wiki's [Accessibility review](https://github.com/joebaz/web-starter/wiki/Accessibility-Review).

Validation tools:

- GitHub Actions runs the checks on pushes and pull requests targeting `main`
- Prettier for formatting
- ESLint for linting, including [accessibility rules](docs/accessibility-linting.md) for Astro and React components
- Astro's checker for type checking
- Node's test runner for lint configuration tests
- Playwright for browser smoke tests in Chromium, Firefox, and WebKit, including rendered accessibility checks with axe
- Astro for the production build

See [CONTRIBUTING](CONTRIBUTING.md#validate-your-change) for which checks run and when.

## Repository structure and docs

| Path                               | Purpose                                                                              |
| ---------------------------------- | ------------------------------------------------------------------------------------ |
| `.github/ISSUE_TEMPLATE/`          | Forms for content, documentation, fix, and feature issues                            |
| `.github/labels.yml`               | Canonical label names, colors, and descriptions                                      |
| `.github/pull_request_template.md` | Pull request summary, scope, and validation fields                                   |
| `.github/workflows/ci.yml`         | Validation CI: formatting for documentation-only changes, full baseline otherwise    |
| `.gitignore`                       | Exclusions for generated output, dependencies, environment files, and test artifacts |
| `.npmrc`                           | npm configuration enforcing the declared Node version range                          |
| `.nvmrc`                           | Node major version selection                                                         |
| `AGENTS.md`                        | Instructions directing agents to repository guidance                                 |
| `CLAUDE.md`                        | Symlink to `AGENTS.md` for Claude Code                                               |
| `CONTRIBUTING.md`                  | Local setup and contribution workflow                                                |
| `GLOSSARY.md`                      | Definitions of project terms                                                         |
| `README.md`                        | Human-facing repository overview                                                     |
| `coding-standards.md`              | Implementation conventions scoped to the requested change                            |
| `astro.config.mjs`                 | Astro configuration                                                                  |
| `docs/`                            | Repository guidance, role SOPs, plans, and specs                                     |
| `eslint.config.mjs`                | ESLint configuration                                                                 |
| `package.json`                     | Dependencies, Node compatibility, and commands                                       |
| `package-lock.json`                | Locked dependency versions                                                           |
| `paseo.json`                       | Worktree setup, scripts, and branch-name generation                                  |
| `playwright.config.ts`             | Browser projects, server startup, retries, and failure artifacts                     |
| `prettier.config.mjs`              | Formatting configuration                                                             |
| `public/`                          | Static files copied to the build unchanged                                           |
| `scripts/`                         | Repository scripts, including the bootstrap script                                   |
| `src/`                             | Site source processed by Astro                                                       |
| `src/pages/`                       | File-based routes; `index.astro` provides the homepage                               |
| `src/styles/`                      | Shared styles; `global.css` loads Tailwind                                           |
| `tests/fixtures/`                  | Independent facts and page inputs for tests                                          |
| `tests/lint/`                      | Node tests for the ESLint accessibility configuration                                |
| `tests/smoke/`                     | Browser smoke tests                                                                  |
| `tests/support/`                   | Shared Playwright helpers                                                            |
| `tsconfig.json`                    | TypeScript configuration                                                             |
| `website-facts.yaml`               | Facts about the website, as an intake form                                           |
| `dist/`                            | Generated deployment output, ignored by Git                                          |

For shared metadata and page setup, see [Configure a site and add pages](docs/configure-site-and-pages.md). For generated crawl-discovery files and exclusions, see [Configure the sitemap and robots.txt](docs/configure-sitemap-and-robots.md).

The [issue tracker guide](docs/agents/issue-tracker.md) explains where issues, specs, and plans live. The human-facing [site launch checklist](https://github.com/joebaz/web-starter/wiki) covers setup, Project choices, launch verification, and operating notes.

## Website facts

[website-facts.yaml](website-facts.yaml) is the only place for facts about the website.

## Build and deployment

`npm run build` produces `dist/`. Review [site configuration](docs/configure-site-and-pages.md) for shared metadata and page setup before configuring deployment for the selected host.

Record the chosen host as `hosting_provider` in [website-facts.yaml](website-facts.yaml). Follow the human [site launch checklist](https://github.com/joebaz/web-starter/wiki) to set up hosting and check the live site.
