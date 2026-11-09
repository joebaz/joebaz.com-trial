# Bootstrap website repositories from the Template: spec

> **Status:** Approved by the Maintainer on 2026-11-04 at 09:42 JST, at revision SHA-256 `0a03551c7d88833bec1ab19736099fda12d666ee59baac56a1732e0288328a90` (uncommitted, on `50071f7`), including its three test seams. Revised on 2026-11-04 at 10:35 JST with the Maintainer's #85 decisions on the language warning, the `yaml` dependency, the required fact list, and language in the Template, then generalized to name no specific website or test repository. This is #45's one requirements contract. Sub-Issues [#85], [#86] and [#87] carry the detailed acceptance criteria the Maintainer accepted on 2026-11-04 at 09:24 JST. This spec covers #45's outcome and how those Sub-Issues add up to it, and it's updated as they progress. #45 stays open until all three are done. The stories are the contract, not the wording of any document that implements them. Only file names, label names and Status options are exact.

## Problem Statement

When the Maintainer creates a repository from the Template with GitHub's "Use this template", GitHub copies only the files. The Template's labels, wiki, delete-branch-after-merge setting and linked GitHub Project don't come across. The copied files still describe the Template, link to the Template's repository and wiki, and carry its history. Site facts are spread across configuration files and the README. The tests assert the Template's own copy and unset values, so a new Project's CI fails on its first real content change. Today each Project is set up by hand, and gaps go unnoticed. One Maintainer creates a few Projects a year.

## Solution

The Maintainer creates a repository from the Template, opens it in an agent, and asks it to bootstrap the repository for a new website. The agent follows one runbook: it does every step it's allowed to do, asks the Maintainer for each fact and choice, and stops at clearly marked human steps. A small script sets up and checks the GitHub-side state. All facts about the website live in one file. The Template is changed so it copies cleanly: tests don't depend on Template copy or values, and Template-only text is confined and replaced at bootstrap. Afterwards the repository works like the Template for its issue forms, labels, agent instructions and workflow.

The work is three Sub-Issues, done in order:

1. [#85] Keep website facts in one file
2. [#86] Make the Template copy cleanly into new repositories (blocked by #85)
3. [#87] Bootstrap a website repository end to end (blocked by #85 and #86)

## User Stories

### Starting a bootstrap

1. As the Maintainer, I want to start a bootstrap by creating a repository from the Template, opening its checkout in my agent tool (in Paseo: create a project from the repository, then open a Local workspace), and saying "bootstrap this repo for a new website called …", so that setup needs no other preparation.
2. As the Maintainer, I want to choose the repository's visibility myself, with nothing in the Template prescribing private or public, so that each Project decides for itself.
3. As an agent in a repository that hasn't been bootstrapped, I want the agent instructions to point me to `docs/bootstrap-website.md`, so that a short prompt is enough.
4. As the Maintainer, I want the runbook to mark once-per-machine tool setup as "skip if done", so that I repeat it only on a new machine.
5. As the Maintainer, I want the agent to create a local branch before its first edit, then commit and push the reviewed bootstrap branch and open its pull request, leaving the merge to me, so that I'm not running routine git commands but the merge stays mine.

### Human, agent and script steps

6. As the Maintainer, I want the runbook's steps in a fixed order, each marked as mine, the agent's with my written approval, or the agent's, so that I can see what's mine at a glance.
7. As the Maintainer, I want human-only to mean credentials and logins, business choices and approvals, final sign-off and merges, any initial wiki page that GitHub only allows from its web interface, and deleting repositories, not everything that needs authentication, so that the agent does the rest.
8. As the Maintainer, I want a script whose check mode only reads the repository and reports what's set up and what's missing (labels, delete-on-merge, the linked GitHub Project, the `CLAUDE.md` symlink, the new-issue contact link, and CI runs), so that whoever runs it, the result is repeatable evidence.
9. As the Maintainer, I want the script's apply mode to create the Template's labels, delete GitHub's stock labels, and turn on deleting branches after merge, and nothing else, so that it never edits files or changes branch protection or other settings ([#48]).
10. As the Maintainer, I want my standard bootstrap request to authorize apply mode's standard setup (the Template's labels and deleting branches after merge) without a separate approval, while custom labels or anything else outside the standard setup still need my decision, so that bootstrap doesn't stop for approvals I'd always give.
11. As the Maintainer, I want the agent to open a bootstrap issue in the new repository that records my intake answers, my decisions and the check results, closed by the bootstrap pull request with its Project status set to Done, so that later agents have the evidence.

### Labels, GitHub Project and wiki

12. As the Maintainer, I want each new repository to have exactly the Template's labels (`content`, `docs`, `fix`, `feature`, `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), with the same colors and descriptions, defined once in the Template's `.github/labels.yml`, so that issue forms and triage work. `wayfinder:*` labels are added only on first use.
13. As the Maintainer, I want the agent, as part of my standard bootstrap request and without a separate approval, to create a new user-level GitHub Project for the repository with Status options Parking, Todo, In progress and Done, and link it, with using an existing Project instead left as my decision, so that the Coordinator's status moves work from day one.
14. As the Maintainer, I want the agent to copy the wiki, correcting its links, including the Agent-Setup page's link to the agent instructions, and to push it, with me creating only any first page GitHub requires through its web interface, so that I'm not running routine git commands.

### Website facts

15. As the Maintainer, I want one file, `website-facts.yaml` at the repository root, to be the only place I see and edit facts about the website, so that nothing is keyed in twice.
16. As the Maintainer, I want it to hold the site name, business name, site description, production URL, redirecting hostnames, language tag, other languages, hosting provider, DNS provider and registrar, analytics, user data stored, maintainer, and client approver, so that a typical website's setup context is complete.
17. As the Maintainer, I want every fact listed, each as a value, "none" (decided: not applicable), or visibly undecided, never a placeholder value, so that the file works as an intake form showing what's still open.
18. As the Maintainer, I want the Template to ship the file as a blank form, so that every new repository starts from the same intake.
19. As the Maintainer, I want the site's metadata, language, sitemap and robots.txt reference to come from the file's values, with no other place to set them, no undecided fact to render as a placeholder, and Astro's build to keep warning while the production URL, site name, or language is undecided, so that the facts drive the site.
20. As the Maintainer, I want the intake to take the site name from the repository name and the site description from the repository's GitHub Description, once and without asking me to confirm them, unless my bootstrap request names the site, so that I don't re-enter what I gave when creating the repository. Neither is kept in sync, and the site name stays a separate fact from the repository name.
21. As the Maintainer, I want secrets and credentials never to go in the file, so that it's safe to commit.
22. As any agent, I want SOPs and docs to point to the file instead of a "Project Fact" glossary term, and issue forms to ask for "Website facts affected", so that there's one place to look.

### The Template copies cleanly

23. As the Maintainer, I want a new repository's tests to keep passing when I fill in website facts or replace the homepage copy, so that its CI doesn't fail on legitimate changes.
24. As the Maintainer, I want no test to assert a configured value back to itself, so that tests check behavior, not configuration.
25. As the Maintainer, I want the README to describe the repository (its tools, scripts, skills and docs), not the website, so that site facts live only in the facts file.
26. As the Maintainer, I want the Template's README text that's only true of the Template confined to one marked block, so that bootstrap replaces it predictably.
27. As the Maintainer, I want the pending-reference notes for Template issues to say they're Template issues and keep pointing at the Template, so that new repositories know where that guidance will be decided.

### The bootstrap change

28. As the Maintainer, I want the bootstrap to:
    - set the README title to the repository name, with a generic opening that links to the Template it came from
    - point operational links (the new-issue contribution link, the README's wiki links, the launch-checklist reference) at the new repository
    - set the package name from the git remote and refresh the lockfile to match; the repository name isn't a website fact
    - leave every other Template link pointing at the Template

    so that nothing misleads in the new repository.

29. As the Maintainer, I want the bootstrap to empty `docs/plans/` and `docs/specs/` down to a `.gitkeep` each, after recording any bootstrap plan in the bootstrap issue, and point the Lifecycle's historical-record reference at the Template's copy, so that a Project's plans and specs hold only its own work.
30. As the Maintainer, I want the bootstrap to ask me about sitemap exclusions and the 404 copy once and record my choices where they already live, not in the facts file, so that no Template default stays by accident.
31. As the Maintainer, I want the bootstrap to remove the agent-instruction pointer to the runbook at the end, so that a finished repository doesn't carry it.

### Proving it works

32. As the Maintainer, I want an end-to-end run on a throwaway repository, public or private, that an agent creates and I delete, using a real website's values, so that the runbook is proven on realistic input.
33. As the Maintainer, I want that run to show that one issue per issue form gets its label, that check mode passes after apply, and that CI passes on the bootstrap pull request, so that "works like the Template" is demonstrated, not claimed.
34. As the Maintainer, I want the throwaway repository's deletion confirmed, with no local clone or Project items left, so that #45's cleanup criterion is met.
35. As the Coordinator, I want findings from implementation and the run reported to me, with any further Sub-Issues proposed, so that #45 closes only when nothing is missing.

## Implementation Decisions

- The approach is a script plus a runbook, `docs/bootstrap-website.md`, at the root of the docs so Planners don't read it on every issue. A script that rewrites files was rejected: it can't tell operational links from links that should keep pointing at the Template, and site values are business decisions.
- The script targets the repository's own remote, never a hard-coded repository name, following the issue tracker guide.
- Labels are defined once, in `.github/labels.yml`, which the script reads.
- How the site reads the website facts file is a technical choice, made in [#85's plan](../plans/85-website-facts-file.md). Astro's build reads the file with the `yaml` package, which the Maintainer approved as a declared dependency on 2026-11-04.
- The file must list every fact in Story 16. A Project may add facts, but only with the Maintainer's approval in pull request review (Maintainer decision, 2026-11-04).
- The "Project Fact" glossary entry is removed with no replacement term. Roles that need site facts list the file in their Read section, and other docs link it.
- The README's Project facts section becomes a pointer to the file.
- No ADR is recorded (Maintainer decision).

## Testing Decisions

- A good test drives an input and checks external output: built pages, generated files, or the script's report. It never re-reads configuration to compare it with itself.
- **Seam 1, the build output:** the existing build tests. Unset and configured site behavior is tested from the tests' own inputs, never from the Template's facts file. Prior art: the build tests and the named-site fixture.
- **Seam 2, reading the website facts file:** each test fixture passes its own facts file to the site's config, and the tests check the built pages, generated files or build output. No test depends on the root `website-facts.yaml`'s values.
- **Seam 3, check mode against a real repository:** the end-to-end run in #87 is the acceptance test for the script and runbook.
- Smoke tests check structure (the page loads, one visible level-1 heading that the title includes, no detected accessibility violations), not Template copy. The 404 tests keep checking the default 404 copy.

## Out of Scope

- Branch protection, rulesets and other repository settings beyond delete-on-merge ([#48]).
- How Template updates reach existing Projects (a later question).
- Changing the Planner to read a named list of guides.
- Moving the existing agent guides.
- Changing the Template repository's own GitHub description.

## Further Notes

- **Language in the Template (Maintainer decision, 2026-11-04):** the Template ships `language` undecided, like every other fact, so #85's "every fact undecided" criterion stands. A Project's site may not be in English at all, for example a Japanese-only site. So, while it's undecided, Astro's build omits the page's `lang` attribute instead of rendering a placeholder tag, and warns.
- Test builds still check that the root `website-facts.yaml` is valid, because each test fixture's config imports `astro.config.mjs`. No test depends on its values. [#89] removes this when it moves the config files out of the root.
- **Required intake answers (Maintainer decisions, 2026-11-06 and 2026-11-09):** bootstrap can't complete until it has the site name, site description, business name, maintainer, client approver, and the site's valid HTML language tag. If any is undecided, bootstrap pauses until it's chosen; English is never assumed for the language. Other facts may stay undecided. The client approver always names a person; when there's no separate client, it's the Maintainer, never "none". The intake asks only for required answers that are still missing, one at a time as a plain chat question in bold, and waits for each reply; it uses no form or multi-step questionnaire. Before the bootstrap change, the agent shows all website facts so the Maintainer can correct any. This doesn't change the Template's blank facts file, or the build warnings and omitted `lang` attribute before bootstrap.
- **Project status in a fresh bootstrap (Maintainer decision, 2026-11-06):** a new repository has no GitHub Project until bootstrap creates one, so the bootstrap issue can't move to In progress before planning. Planning proceeds with "Project not created yet" recorded, and the issue moves to In progress right after the Project is created. Every other Lifecycle gate still applies.
- **Bootstrap approvals and reviews (Maintainer decisions, 2026-11-08):** the standard bootstrap request pre-approves the standard setup: the Template's labels, deleting branches after merge, and a new user-level Project. Custom labels, using an existing Project, and anything ambiguous stay Maintainer decisions. The runbook is the pre-approved procedure, so a standard bootstrap needs no implementation-plan approval and no separate plan restating the runbook; the bootstrap issue's checklist, facts and evidence are enough. A bootstrap skips every Architect assessment. The Maintainer still supplies any missing required intake answers and any optional defaults, decides anything unexpected, and handles credentials, final sign-off and merges; independent review and CI still apply. In a bootstrap only, the standard request also pre-approves the agent's routine git work, scoped to the new repository's wiki and its reviewed bootstrap branch: checking status, staging, committing and pushing, then opening the pull request. This is a bootstrap-only exception to the rule that agents don't commit or push; it never covers force-pushes, merges, auto-merge or other repositories.
- This spec is updated as #85–#87 progress. #45 closes when all three are done. #85 is done ([#90](https://github.com/joebaz/web-starter/pull/90), merged 2026-11-04). #86 is done ([#92](https://github.com/joebaz/web-starter/pull/92), merged 2026-11-06). #87 is done (PRs #94–#98, closed 2026-11-09). In its accepted trial run, check mode passed after apply and CI passed on the bootstrap pull request, and on 2026-11-09 the Maintainer opened one issue per issue form in the trial repository and each got its label. The facts readout and the Done close-out were added after that run and passed independent documentation review; a later real bootstrap exercises them. The Maintainer deleted every trial repository, and on 2026-11-09 the Coordinator confirmed none remain, with no local clones and no Project items left.
- `AGENTS.md` already tells agents in a repository that hasn't been bootstrapped to follow `docs/bootstrap-website.md`. #87 creates that runbook; until then, the pointer leads nowhere.

[#48]: https://github.com/joebaz/web-starter/issues/48
[#85]: https://github.com/joebaz/web-starter/issues/85
[#86]: https://github.com/joebaz/web-starter/issues/86
[#87]: https://github.com/joebaz/web-starter/issues/87
[#89]: https://github.com/joebaz/web-starter/issues/89
