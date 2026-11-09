# Contributing

This guide describes the workflow for contributing to this repository.

When editing code or site content in this repository, follow [coding-standards.md](coding-standards.md) for implementation conventions relevant to the task.

## Set up a local checkout

Use a Node.js version compatible with [package.json](package.json) and the major version declared in [.nvmrc](.nvmrc). Clone the repository and install its dependencies:

```sh
git clone <repository-url>
cd <project-directory>
node --version
npm install
```

`npm install` reads `package.json` and `package-lock.json` and installs the complete dependency tree. Do not install dependencies individually unless you intentionally add a new package.

If Playwright browsers are missing, install them with `npx playwright install`.

## Manage development servers

Use the controls of the tool that started the server. Check for an existing server for this checkout before launching another one.

| Situation                      | Instructions                                                                                                                     |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Human developing in a terminal | Run `npm run dev` for interactive development.                                                                                   |
| Agent launching Astro directly | Run `npm run dev -- --background`.                                                                                               |
| Paseo Dev Server service       | Start and stop the configured service through Paseo's service controls.                                                          |
| Browser tests                  | Run `npm test`; let Playwright manage its dedicated Astro test server with the metadata test inputs from `playwright.config.ts`. |

For a directly launched background server, use `npm run dev -- status`, `npm run dev -- logs`, and `npm run dev -- stop`. See [Astro's background-server documentation](https://docs.astro.build/en/reference/cli-reference/#--background) for details.

The test server uses a separate port and `--ignore-lock` so it can run alongside this checkout's development server. Playwright owns its startup and shutdown; manage ordinary development servers through the controls above.

## Working with Issues

When contributing to this repository, use a GitHub issue to define the work before making a change. Keep each change focused on one issue or cohesive outcome.

- The pull request that implements an issue updates any website fact the issue changes in [website-facts.yaml](website-facts.yaml) and links the issue.
- When a conversation changes a website fact, the agent opens or updates the decision issue and updates the file in the same pull request.
- When a decision is hard to reverse, surprising without context, and the result of a real trade-off, also record it as an architecture decision record (ADR) in `docs/adr/`.

For shared terminology, glossary entry format, and approval of term changes, follow [Domain docs](docs/agents/domain.md).

## Choose an issue type

Select the GitHub Issue form that best matches the work:

- **Content:** Changes to Content, Page Structure, or both, such as copy, images, navigation labels, metadata, shared site data, pages, or layout.
- **Documentation:** Repository documentation or instructions only. Choose the primary document type: **SOP** for repeatable instructions, **Reference** for facts and conventions, **Design** for a proposed-work specification, or **Other** for another documentation request.
- **Fix:** Unintended behavior, layout, accessibility, performance, or functionality, including an uncovered design gap in an existing capability.
- **Feature:** One cohesive new or expanded capability.

Classify a change by its purpose, not by the files it touches: a change that corrects a problem is a Fix, and one that adds a capability is a Feature, even if it only edits Content or Page Structure.

Use the Documentation form only for repository documentation and instructions. Do not use it for changes to user-facing content, behavior, tests, builds, deployment, or external services.

## Choose a branch type

Create a branch using this format:

```text
<type>/<short-kebab-case-description>
```

Choose exactly one of these types:

- `content`: Content, Page Structure, or both, such as copy, images, navigation labels, metadata, shared site data, pages, or layout.
- `docs`: Repository documentation and instructions only, such as `README.md`, `CONTRIBUTING.md`, `AGENTS.md`, `CLAUDE.md`, and similar documentation.
- `fix`: Broken or incorrect behavior, layout, accessibility, performance, or functionality, including an uncovered design gap in an existing capability.
- `feature`: One cohesive new or expanded capability.

Use a concise, specific, lowercase kebab-case description. Do not use any other prefix.

Do not use `docs` if the change affects user-facing content, behavior, tests, builds, deployment, or external services.

## Validate your change

Run the required checks below locally for your change type. CI runs these same checks automatically, choosing them from the changed files: see the documentation path list in [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

Beyond these commands, plan checks from the issue's intent and meet the bar in the [QA reference](docs/qa.md).

### `content`, `fix`, and `feature`

Run:

```sh
npm run format:check
npm run lint
npm run check
npm test
npm run build
```

Also review content for accuracy, links, meaningful alt text, and affected pages at relevant responsive sizes.

For a `fix`, reproduce the issue or document verification and add regression coverage where practical.

For a `feature`, define acceptance criteria and add relevant tests. When the interface changes, screenshots go in chat.

### `docs`

Run:

```sh
npm run format:check
```

Also review the final text for accuracy, clarity, and unintended scope.

### Every change

Run:

```sh
git diff --check
git diff
git status --short
```

Confirm that only intended files are included.

## Open a pull request

- Use [.github/pull_request_template.md](.github/pull_request_template.md).
- Link the pull request to the relevant GitHub Issue or Sub-Issue with `Closes #<number>`. Use `Refs #<number>` when the issue stays open after the merge, such as a spec issue awaiting implementation and trial findings.
- Describe the changed files and validation performed.
- Ensure CI passes.
- A maintainer must review the pull request before merge.
- After review approval and successful CI, the maintainer squash-merges the pull request; GitHub deletes the head branch automatically. Agents do not merge pull requests or enable auto-merge.

## Safety and non-goals

- Do not commit secrets, credentials, `.env` files, or `~/.paseo/` state.
- Do not add GitHub settings, templates, labels, services, deployment configuration, production access, or external integrations unless approved in writing for the task.
