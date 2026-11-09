# Issue tracker: GitHub

Issues live in this code repository's GitHub Issues, not in its wiki. Repository specs live at `docs/specs/<issue>-<slug>.md`, linked from their issue. A specification may instead live in a linked GitHub Issue. Keep one approved requirements contract rather than duplicate specs. Plans for every issue type live at `docs/plans/<issue>-<slug>.md`, as the [plans guide](https://github.com/joebaz/web-starter/blob/main/docs/plans/README.md) describes. Link specs and plans from the issue; don't open an issue only to hold a plan or a copy of a spec. Agent-facing instructions and project-owned references stay in the repository; the Wiki stays the maintainer's checklist. The issue tracks its status, the [Lifecycle](../lifecycle.yaml) holds the shared workflow, and the issue's local [execution checkpoint](../execution-checkpoint.md) records its progress. Run `gh` from this repository so it targets the `origin` remote; do not pass a hard-coded `--repo`.

## Issue operations

- Create: `gh issue create --title "..." --body-file <file>`
- Read: `gh issue view <number> --json number,title,body,labels,comments`
- List: `gh issue list --state open --json number,title,body,labels,comments`, with appropriate filters
- Comment: `gh issue comment <number> --body "..."`
- Label: `gh issue edit <number> --add-label "..."` or `--remove-label "..."`
- Close: `gh issue close <number> --comment "..."`

When a skill says “publish to the issue tracker,” create a GitHub issue. When it says “fetch the relevant ticket,” read that issue.

## Pull requests as a triage surface

**PRs as a request surface: no.** Set this to `yes` only if external PRs should enter the triage queue.

## Wayfinding

A wayfinding map is an issue labelled `wayfinder:map`; its tickets are child issues labelled `wayfinder:<type>` (`research`, `prototype`, `grilling`, or `task`). Use GitHub sub-issues where available. Otherwise, list children in the map and put `Part of #<map>` in each child.

Use GitHub issue dependencies for blockers where available. Otherwise, put `Blocked by: #<n>` in the child body. The next ticket is the first open, unassigned child without open blockers. Claim it with `gh issue edit <n> --add-assignee @me`; resolve it by commenting with the answer, closing it, and adding a context pointer to the map.
