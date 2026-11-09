# Bootstrap a website repository

This runbook guides setting up a new website repository created from the [web-starter Template](https://github.com/joebaz/web-starter). It specifies each step, its responsible actor, and required approvals.

## Scope: setup now, content later

Bootstrap prepares the repository; it does not build the website. Leave the Template's existing pages and content in place during bootstrap. Plan website content separately after bootstrap: homepage personalization, new pages, page copy, images, and design.

Bootstrap still covers the steps in this runbook, including the required facts, which the site reads for its metadata, and the sitemap and 404 choices made during intake.

## Prerequisites and tools

### Responsibility markers

Every step in this runbook is assigned to an actor:

- `Maintainer`: Human-only actions (credentials and sign-in, account and repository settings outside the [pre-approved setup](#pre-approved-setup), business decisions, the wiki's first page, final sign-off, merges, repository deletion).
- `Agent — <role>`: Agent operations performed under that role's standard operating procedure.

The bootstrap process follows the canonical [Lifecycle](lifecycle.yaml). The Lifecycle owns the stage sequence, handoffs, and approval gates; this runbook maps bootstrap activities to those stages.

### Maintainer handoffs

Once the new repository is open in an agent tool, the Coordinator handles everything the Maintainer needs to do, answer, or approve, in its own session. Other roles give the Coordinator the details. The Coordinator records each result in the bootstrap issue. For bootstrap, this replaces the Coordinator SOP's [Hand back](agents/roles/coordinator.md#hand-back) notice that sends the Maintainer to another session. The Maintainer can still talk to another role directly; that role then tells the Coordinator what was decided, naming the artifact and revision. Sign-in, business decisions, final sign-off, and merges stay with the Maintainer; agents do the Git work, as [Agent Git publishing](#agent-git-publishing) describes.

For each handoff, the Coordinator gives:

- what it is for and the expected result
- where it applies, checked just before: working directory, repository, branch, and remote, or the artifact and revision
- the exact commands or GitHub steps, with every value filled in

The Maintainer never fills in placeholders, relies on another shell's variables, or switches sessions. Placeholders such as `<owner>` in this runbook are for agents to fill.

### Once-per-machine tools (`skip if done`)

- **Node.js**: Compatible with the `engines` specification in [package.json](../package.json). The repository's `.nvmrc` selects the Node.js major version, while `.npmrc` enforces the supported version range through `engine-strict`.
- **npm**: Standard Node package manager.
- **GitHub CLI (`gh`)**: Installed and authenticated (`gh auth status`) with access to the owning account and the `project` scope (`gh auth refresh -s project`). The authenticated account belongs to the Maintainer; credential operations are human-owned Maintainer actions; agents never modify credentials. If sign-in or the `project` scope is missing, the Coordinator gives the Maintainer the command. For setup instructions, see [CONTRIBUTING.md](../CONTRIBUTING.md#set-up-a-local-checkout) and the Wiki's [Agent setup](https://github.com/joebaz/web-starter/wiki/Agent-Setup).
- **Playwright browsers**: Installed with `npx playwright install`. Required for running `npm test`.
- **Agent workspace**: Repository opened in Paseo (project and Local workspace) or the Maintainer's agent environment.

---

## Repository and branch setup

1. **Create repository** (`Maintainer`):
   - Create a new repository from the Template using GitHub's **Use this template** button.
   - Choose repository owner and name.
   - Choose visibility (public or private) based on project requirements.
   - Clone the repository locally or open it in Paseo.

2. **Verify repository and authenticated account** (`Agent — Coordinator`):
   - Verify that the `origin` remote matches the repository URL on `github.com`:
     ```sh
     git remote get-url origin
     ```
   - Confirm the default branch (typically `main`).
   - Independently verify the authenticated account and repository owner:
     ```sh
     gh api user --jq .login
     gh api /repos/<owner>/<repo> --jq .owner.login
     ```
     The authenticated user belongs to the Maintainer, while the repository owner and name are derived from the origin remote. They may match for a personal repository or differ for an organization repository.

3. **Create local branch before editing** (`Agent — Coordinator`):
   - Before making any file edit, create a local feature branch:
     ```sh
     git checkout -b feature/bootstrap-website
     ```

4. **Open the bootstrap issue** (`Agent — Coordinator`):
   - Open an issue titled `Bootstrap website repository` using a unique temporary file path:
     ```sh
     ISSUE_BODY=$(mktemp /tmp/bootstrap-issue.XXXXXX)
     cat << 'EOF' > "$ISSUE_BODY"
     ## Overview
     Tracking end-to-end bootstrap setup for this repository.

     ## Intake and decisions
     - [ ] Six required website facts recorded
     - [ ] Sitemap and 404 choices recorded
     - [ ] GitHub Project deferral recorded

     ## Implementation
     - [ ] Labels and delete-on-merge applied and verified
     - [ ] GitHub Project created, linked, and verified
     - [ ] Wiki initialized, copied, and published
     - [ ] Repository files updated and validated

     ## Publishing
     - [ ] Pull request opened and CI passed
     - [ ] Read-only bootstrap check passed
     - [ ] Project status set to Done and verified
     - [ ] Merged and Lifecycle closed
     EOF

     gh issue create --title "Bootstrap website repository" --body-file "$ISSUE_BODY"
     rm -f "$ISSUE_BODY"
     ```
   - Record the issue number and URL. Do not assign category labels on creation; labels do not exist yet. Record all intake answers, progress, check results, and any Maintainer decisions as comments in this issue.

---

## Intake and choices

The Coordinator asks the intake questions in plain chat, one at a time: each message holds exactly one question, in bold, and the Coordinator waits for the reply before asking the next. Don't use question tools or forms, such as `AskUserQuestion` or `request_user_input`, and don't send a list of questions. For bootstrap, this takes precedence over any role SOP or tool guidance that suggests otherwise.

The Planner works out which questions are needed. Ask only for answers that are still missing, with no requirements interview, and don't guess the other facts. The answers are the bootstrap's requirements and need no separate approval.

1. **Intake for website facts** (`Agent — Planner`):
   - Fill in the facts defined in [website-facts.yaml](../website-facts.yaml) from the sources below, then ask for each required fact that is still missing.
   - Six facts are **mandatory** to complete bootstrap setup:
     - `site_name`: Public name of the website. Use the name given in the bootstrap prompt or an earlier answer; a literal placeholder such as `<site-name>` is not a name. Otherwise, use the repository name. Don't ask to confirm it. Repository name and site name stay distinct facts, though they may share the same value.
     - `site_description`: Brief description of the website. Use the repository's GitHub Description if it isn't empty, without asking to confirm it. Ask only if it's empty. Never kept in sync with the GitHub Description afterward.
     - `business_name`: Legal or operating business name.
     - `maintainer`: Responsible technical maintainer.
     - `client_approver`: Business client contact/approver. Must name a person. If there is no separate client, use the Maintainer (never `none`).
     - `language`: Valid HTML language tag (for example, `en`, `es`, `ja`). **If undecided, pause bootstrap until chosen. Never assume English.** Reference the existing reader and build diagnostic (`astro.config.mjs` / `src/website-facts.ts` or `npm run build`); do not edit site files during intake.
   - Record in the bootstrap issue which site name and description were used and where they came from.
   - If any of these six required facts is undecided, bootstrap cannot complete; pause until the missing answer is supplied.
   - All other facts defined in [website-facts.yaml](../website-facts.yaml) (`production_url`, `redirecting_hostnames`, `other_languages`, `hosting_provider`, `dns_provider`, `domain_registrar`, `analytics`, `user_data_stored`) may remain blank (undecided) or set to explicit `none` if decided not applicable; they do not block minimal repository bootstrap.
   - Never put secrets or credentials into [website-facts.yaml](../website-facts.yaml).

2. **One-time sitemap and 404 choices** (`Agent — Planner`):
   - Ask these as two separate questions, one at a time:
     - whether to exclude any pages from the sitemap, set by `sitemapExclusions` in [astro.config.mjs](../astro.config.mjs) (default is none)
     - whether to keep the default 404 page text in [src/pages/404.astro](../src/pages/404.astro) (title, description, explanation, homepage link label), or what to use instead
   - Retaining no sitemap exclusions and default 404 copy is an easy explicit choice revisable later. Bootstrap is minimal repository setup, not a full site implementation roadmap.
   - If custom 404 copy is chosen, update exact-copy assertions in [tests/smoke/not-found.spec.ts](../tests/smoke/not-found.spec.ts) and [tests/smoke/build.spec.ts](../tests/smoke/build.spec.ts) during implementation.

3. **Facts readout** (`Agent — Coordinator`):
   - Once the required answers are in, and before the facts file is written, show the Maintainer one readout of [website-facts.yaml](../website-facts.yaml). This is one combined review, not a confirmation of each fact. Facts can still change later through normal issues.
   - Introduce the readout with: “Agents use this file to understand your website and how it’s run. The website also uses some values for its name, language, and web address.”
   - List every key in the file by its exact name with its value. Mark blank values as undecided and show `none` as written. A short note on where each value came from, such as the repository, the bootstrap prompt, or chat, helps.
   - Ask **Please review and confirm or suggest edits** and wait for the reply.
   - Apply any corrections; the latest answer wins. Required facts must stay filled, and `language` must be a valid tag. If there are no changes, continue. Show the readout again only if a correction needs a follow-up question.
   - Record the final readout and any corrections in the bootstrap issue.

4. **Fresh-bootstrap Project-status deferral** (`Agent — Coordinator`):
   - Verify that no linked GitHub Project exists yet.
   - Record `Project not created yet` in the bootstrap issue and execution checkpoint.
   - This lets bootstrap continue without a premature `In progress` Project status move.

---

## No separate plan

Bootstrap works like an installer: this runbook is the plan, and starting a bootstrap approves it. Once intake is complete, go straight to Implementation and report progress in the bootstrap issue. Don't write a bootstrap plan or spec, and don't ask the Maintainer to approve requirements or a plan.

For bootstrap only, this takes precedence over the Lifecycle's requirements approval in Define, its Plan stage, its Architect steps (`plan-assessment`, `recommendations-review`, and `signed-off-assessment`), and any later step that waits on a plan, plan approval, or assessment.

If an answer or situation falls outside this runbook, ask the Maintainer through the Coordinator before going on. Report problems with the runbook for a Template fix through its normal issue and approval process; repairs to the new repository still need its normal approvals. The Reviewer's independent review, CI, the Maintainer's sign-off, and Maintainer-only actions all still apply.

---

## Implementation

### Pre-approved setup

Starting a bootstrap pre-approves two standard operations. After intake, the agent runs them without asking:

- The setup script's apply mode: it creates or updates the labels in [.github/labels.yml](../.github/labels.yml), deletes GitHub's stock labels (`default: true`) that aren't in that file, and turns on the `delete_branch_on_merge` repository setting.
- A new user-level GitHub Project owned by the repository owner and named after the repository, with the four required Status options, linked to the repository, with the bootstrap issue set to `In progress`.

Before each, the agent checks the repository on `github.com`, the signed-in account, admin access, and that the target isn't a Template. It records the planned effects in the bootstrap issue, runs the operation, and verifies the result. If anything is unexpected, ambiguous, outside these operations, or fails, such as an existing or ambiguous Project or a permission error, it stops and reports through the Coordinator.

Apart from these and [Agent Git publishing](#agent-git-publishing), pre-approval covers nothing else. Deleting or changing custom labels, changing an existing Project, and other repository settings need the Maintainer's explicit decision. Sign-in and token changes, secrets, the wiki's first page, final sign-off, and merges stay with the Maintainer.

### Agent Git publishing

Starting a bootstrap also pre-approves the routine Git work, so the Maintainer never runs Git commands. For bootstrap only, this takes precedence over the rules in `AGENTS.md`, the role SOPs, and the Lifecycle that leave commits and pushes to the Maintainer. Agents:

- commit and push the prepared pages to the new repository's wiki
- after validation, the Reviewer's independent review, and the Maintainer's sign-off, commit exactly the reviewed and signed-off changes to the bootstrap branch, push it, and open its pull request. The Maintainer signs off in conversation; the agent does the Git work.

Before each commit or push, the agent checks the working directory, remote, and branch against the recorded target, reviews `git status` including untracked files, and stages only the files bootstrap changed. It never stages secrets or the `.agent-state/` checkpoint, and pushes only the bootstrap branch and the recorded wiki branch, never the Template or the site repository's default branch. It never force-pushes, merges, approves the pull request, enables auto-merge, or changes Git or credential settings. If history, branches, or files look unexpected, or a push is rejected, it stops and reports through the Coordinator instead of stashing, resetting, rebasing, or deleting anything.

### Labels and delete-on-merge

1. **Record apply effects** (`Agent — Coder`):
   - Run the setup script in read-only check mode:
     ```sh
     npm run bootstrap:check
     ```
   - Record the exact effects check mode reports in the bootstrap issue:
     - Exact label additions to create from [.github/labels.yml](../.github/labels.yml) (name, color, description).
     - Exact label updates to modify (name casing, color, description).
     - Exact GitHub stock default labels (`default === true`) to delete.
     - Preserved custom labels (`default !== true`) noted as kept for separate review.
     - `delete_branch_on_merge` repository setting to enable.
2. **Execute and verify apply mode** (`Agent — Coder`):
   - Run the setup script in apply mode:
     ```sh
     npm run bootstrap:apply
     ```
   - Immediately run it once more to verify repeatability:
     ```sh
     npm run bootstrap:apply
     ```
   - Apply mode verifies mutations via readback:
     - `delete_branch_on_merge` is enabled.
     - All canonical labels exist with exact case names, colors, and descriptions.
     - All stock default labels were deleted.
     - Any partial failure reports successful, attempted, and failed/unknown outcomes and exits with code `2`.
   - **Decision on preserved custom labels**: If non-default custom labels existed in the repository, apply mode preserves them for separate review. Because `bootstrap:check` expects an exact match with the canonical set, preserved custom labels will continue to cause check mode to report a mismatch until the Maintainer decides on each one (either deleting it via `gh label delete <name>` or adding it to `.github/labels.yml`). The Coordinator asks for that decision.
3. **Apply category label** (`Agent — Coordinator`):
   - Apply the canonical lowercase `feature` label to the bootstrap issue now that labels exist:
     ```sh
     gh issue edit <bootstrap-issue-number> --add-label "feature"
     ```

### GitHub Project setup

1. **Prerequisites** (`Agent — Coder`):
   - Verify prerequisites: repository admin access, `project` token scope (`gh auth status`), and user account ownership.
   - Check the repository owner type:
     ```sh
     gh api /repos/<owner>/<repo> --jq .owner.type
     ```
     If the repository is owned by an Organization, pause and route the conflict through the Coordinator to the Maintainer. A user-level same-owner Project is required; do not silently create or substitute an organization Project.
   - Check that the owner has no Project named after the repository. If one exists, stop and report; don't reuse or change it.
   - Record the planned Project in the bootstrap issue: owner, title, Status options, and repository link.

2. **Create, configure, link, and record GitHub Project** (`Agent — Coder`):
   - Execute the Project creation, initial recording, configuration, repository link, readback verification, and full recording in a single coherent shell block:
     ```sh
     set -eu

     BOOTSTRAP_PROJECT_OWNER="<user>"
     OWNER="<owner>"
     REPO="<repo>"
     REPO_FULL="<owner/repo>"
     BOOTSTRAP_ISSUE="<bootstrap-issue-number>"

     # Guard: fail before any operation if variables are unbound
     for var in "$BOOTSTRAP_PROJECT_OWNER" "$OWNER" "$REPO" "$REPO_FULL" "$BOOTSTRAP_ISSUE"; do
       case "$var" in ""|\<*\>) echo "Error: Unbound variable" >&2; exit 2 ;; esac
     done

     # Step A: Create Project and capture output JSON once
     CREATE_JSON=$(gh project create --owner "$BOOTSTRAP_PROJECT_OWNER" --title "$REPO" --format json)
     PROJECT_NUMBER=$(node -e 'console.log(JSON.parse(process.argv[1]).number)' "$CREATE_JSON")
     PROJECT_ID=$(node -e 'console.log(JSON.parse(process.argv[1]).id)' "$CREATE_JSON")
     PROJECT_URL=$(node -e 'console.log(JSON.parse(process.argv[1]).url)' "$CREATE_JSON")

     test -n "$PROJECT_NUMBER" && test -n "$PROJECT_ID" || exit 2

     # Step B: Record creation identity IMMEDIATELY before configuring
     # If subsequent configuration or linking fails, recovery has project identity and must NOT rerun create
     gh issue comment "$BOOTSTRAP_ISSUE" --body "Created GitHub Project:
     - Project number: $PROJECT_NUMBER
     - Project ID: $PROJECT_ID
     - Project URL: $PROJECT_URL"

     # Step C: Discover Status field ID
     FIELDS_JSON=$(gh project field-list "$PROJECT_NUMBER" --owner "$BOOTSTRAP_PROJECT_OWNER" --format json)
     STATUS_FIELD_ID=$(node -e 'const fs = JSON.parse(process.argv[1]).fields; const s = fs.find(f => f.name === "Status"); if (!s) process.exit(1); console.log(s.id);' "$FIELDS_JSON")
     test -n "$STATUS_FIELD_ID" || exit 2

     # Step D: Configure Status names via GraphQL mutation with real JSON input file
     MUTATION_FILE=$(mktemp /tmp/update-status-options.XXXXXX)
     cat << EOF > "$MUTATION_FILE"
     {
       "query": "mutation(\$fieldId: ID!, \$singleSelectOptions: [ProjectV2SingleSelectFieldOptionInput!]!) { updateProjectV2Field(input: { fieldId: \$fieldId, singleSelectOptions: \$singleSelectOptions }) { projectV2Field { ... on ProjectV2SingleSelectField { id name options { id name } } } } }",
       "variables": {
         "fieldId": "$STATUS_FIELD_ID",
         "singleSelectOptions": [
           {"name": "Parking", "color": "GRAY", "description": "Items parked or deferred"},
           {"name": "Todo", "color": "GRAY", "description": "Items ready to be planned or worked on"},
           {"name": "In progress", "color": "GRAY", "description": "Items currently being worked on"},
           {"name": "Done", "color": "GRAY", "description": "Completed items"}
         ]
       }
     }
     EOF

     MUTATION_RES=$(gh api graphql --input "$MUTATION_FILE")
     rm -f "$MUTATION_FILE"

     IN_PROGRESS_OPTION_ID=$(node -e 'const res = JSON.parse(process.argv[1]); const opt = res.data.updateProjectV2Field.projectV2Field.options.find(o => o.name === "In progress"); if (!opt) process.exit(1); console.log(opt.id);' "$MUTATION_RES")
     test -n "$IN_PROGRESS_OPTION_ID" || exit 2

     # Step E: Link Project to repository
     gh project link "$PROJECT_NUMBER" --owner "$BOOTSTRAP_PROJECT_OWNER" --repo "$REPO_FULL"

     # Step F: Read back and verify linkage and Status options
     gh api graphql -f query='query($owner: String!, $repo: String!) { repository(owner: $owner, name: $repo) { projectsV2(first: 20) { nodes { id number title fields(first: 50) { nodes { ... on ProjectV2SingleSelectField { name options { id name } } } } } } } }' -f owner="$OWNER" -f repo="$REPO"

     # Step G: Record complete configured Project identity and field/option IDs in bootstrap issue
     gh issue comment "$BOOTSTRAP_ISSUE" --body "Configured and linked GitHub Project:
     - Project number: $PROJECT_NUMBER
     - Project ID: $PROJECT_ID
     - Project URL: $PROJECT_URL
     - Status field ID: $STATUS_FIELD_ID
     - In progress option ID: $IN_PROGRESS_OPTION_ID"
     ```
   - **Recovery and retry guard**: Never re-run `gh project create` on missing variables, failure, or retry. If shell state is lost or an error occurs during configuration or linking, rediscover the Project read-only using `gh project list --owner <project-owner>` and `gh project field-list <project-number> --owner <project-owner>` by the recorded Project identity. Stop and report if multiple or ambiguous Projects exist.

3. **Fulfill deferred Project status action** (`Agent — Coordinator`):
   - The Coordinator executes the deferred Project status update in a single self-contained shell block that first binds the literal Project and issue values recorded in the bootstrap issue comment before mutating:
     ```sh
     set -eu

     BOOTSTRAP_PROJECT_OWNER="<user>"
     ISSUE_URL="<bootstrap-issue-url>"
     PROJECT_NUMBER="<recorded-project-number>"
     PROJECT_ID="<recorded-project-id>"
     STATUS_FIELD_ID="<recorded-status-field-id>"
     IN_PROGRESS_OPTION_ID="<recorded-in-progress-option-id>"

     # Guard: fail before any mutation if any required literal is missing or a placeholder
     for var_val in "$BOOTSTRAP_PROJECT_OWNER" "$ISSUE_URL" "$PROJECT_NUMBER" "$PROJECT_ID" "$STATUS_FIELD_ID" "$IN_PROGRESS_OPTION_ID"; do
       case "$var_val" in
         ""|\<*\>)
           echo "Error: Missing required literal value from bootstrap issue comment" >&2
           exit 2
           ;;
       esac
     done

     ITEM_ID=$(gh project item-add "$PROJECT_NUMBER" --owner "$BOOTSTRAP_PROJECT_OWNER" --url "$ISSUE_URL" --format json --jq .id)
     test -n "$ITEM_ID" || exit 2

     gh project item-edit --id "$ITEM_ID" --field-id "$STATUS_FIELD_ID" --project-id "$PROJECT_ID" --single-select-option-id "$IN_PROGRESS_OPTION_ID"

     # Read back the item's status to confirm In progress
     gh api graphql -f query='query($id: ID!) { node(id: $id) { ... on ProjectV2Item { fieldValueByName(name: "Status") { ... on ProjectV2ItemFieldSingleSelectValue { name } } } } }' -f id="$ITEM_ID"
     ```

### Wiki setup

1. **Check wiki eligibility** (`Agent — Coder`):
   - Agent checks `has_wiki` and plan eligibility via the GitHub API:
     ```sh
     gh api /repos/<owner>/<repo> --jq '{has_wiki: .has_wiki, private: .private}'
     ```
     Public repositories include wikis on all plans; private repositories require a GitHub Pro, Team, or Enterprise plan. If unavailable, the agent reports via the Coordinator to the Maintainer; never silently alter repository settings.

2. **Initialize wiki repository** (`Maintainer`):
   - The Coordinator gives the Maintainer the wiki's address, `https://github.com/<owner>/<repo>/wiki`, filled in. The Maintainer creates the first page there (for example, Home) so GitHub sets up the wiki repository, then tells the Coordinator.

3. **Clone, copy, retarget, and record wiki pages** (`Agent — Coder`):
   - Execute the wiki preparation sequence in a single coherent shell block:
     ```sh
     set -eu

     OWNER="<owner>"
     REPO="<repo>"
     DEFAULT_BRANCH="<default-branch>"
     BOOTSTRAP_ISSUE="<bootstrap-issue-number>"

     # Guard: fail before any operation if variables are unbound
     for var in "$OWNER" "$REPO" "$DEFAULT_BRANCH" "$BOOTSTRAP_ISSUE"; do
       case "$var" in ""|\<*\>) echo "Error: Unbound variable" >&2; exit 2 ;; esac
     done

     SRC_WIKI=$(mktemp -d -t web-starter-source-wiki-XXXXXX)
     TGT_WIKI=$(mktemp -d -t target-wiki-XXXXXX)

     git clone "https://github.com/joebaz/web-starter.wiki.git" "$SRC_WIKI"
     git clone "https://github.com/$OWNER/$REPO.wiki.git" "$TGT_WIKI"

     SRC_BRANCH=$(git -C "$SRC_WIKI" branch --show-current)
     TGT_BRANCH=$(git -C "$TGT_WIKI" branch --show-current)

     # Guard: verify non-empty target directory and expected git remote before operating
     test -n "$TGT_WIKI" && test -d "$TGT_WIKI/.git" || exit 2
     git -C "$TGT_WIKI" remote get-url origin | grep -q "github\.com[/:]$OWNER/$REPO\.wiki" || exit 2

     cp "$SRC_WIKI"/*.md "$TGT_WIKI/"

     # Retarget operational repository links in copied wiki pages
     # In Agent-Setup.md, update agent roles link to target repository default branch
     node -e '
       const fs = require("node:fs");
       const path = process.argv[1] + "/Agent-Setup.md";
       if (fs.existsSync(path)) {
         let content = fs.readFileSync(path, "utf8");
         content = content.replace(
           /https:\/\/github\.com\/joebaz\/web-starter\/blob\/main\/AGENTS\.md#roles/g,
           `https://github.com/${process.argv[2]}/${process.argv[3]}/blob/${process.argv[4]}/AGENTS.md#roles`
         );
         fs.writeFileSync(path, content, "utf8");
       }
     ' "$TGT_WIKI" "$OWNER" "$REPO" "$DEFAULT_BRANCH"

     # Review changes in target wiki checkout, including new untracked pages
     git -C "$TGT_WIKI" status --short
     git -C "$TGT_WIKI" diff

     # Record BOTH source and target checkout paths and target branch in bootstrap issue comment
     gh issue comment "$BOOTSTRAP_ISSUE" --body "Wiki prepared for publishing:
     - Source wiki checkout path: $SRC_WIKI
     - Target wiki checkout path: $TGT_WIKI
     - Target wiki branch: $TGT_BRANCH"
     ```
   - If subsequent operations or agents inspect the prepared wiki, they bind the concrete literal checkout paths recorded in the bootstrap issue comment rather than relying on cross-shell persistence.

4. **Publish wiki** (`Agent — Coder`):
   - The Coder reads the wiki path and branch recorded in the bootstrap issue, checks that checkout as [Agent Git publishing](#agent-git-publishing) describes, and runs these commands with both values filled in:
     ```sh
     git -C <target-wiki-path> remote -v
     git -C <target-wiki-path> status
     git -C <target-wiki-path> add -- '*.md'
     git -C <target-wiki-path> commit -m "Bootstrap repository wiki from template"
     git -C <target-wiki-path> push origin <wiki-branch>
     ```
     Quoting `'*.md'` makes Git, not the shell, match the pages inside the wiki checkout.
   - The Coder checks that the pushed commit is on the remote wiki branch and the pages appear on the wiki, then records the result in the bootstrap issue.

5. **Clean up temporary directories** (`Agent — Coder`):
   - After the wiki push is verified, clean up temporary directories. The Coder binds the literal paths recorded in the bootstrap issue comment at the start of the block and validates them before removal:
     ```sh
     set -eu

     # Bind literal paths from the bootstrap issue comment:
     SRC_WIKI="<recorded-source-wiki-path>"
     TGT_WIKI="<recorded-target-wiki-path>"
     OWNER="<owner>"
     REPO="<repo>"

     # Guard: fail before removal if any path is empty or a placeholder
     for var in "$SRC_WIKI" "$TGT_WIKI" "$OWNER" "$REPO"; do
       case "$var" in ""|\<*\>) echo "Error: Unbound variable for wiki cleanup" >&2; exit 2 ;; esac
     done

     # Guard: verify paths exist, are directories, contain .git, and match expected remotes
     test -d "$SRC_WIKI/.git" || exit 2
     git -C "$SRC_WIKI" remote get-url origin | grep -q "github\.com[/:]joebaz/web-starter\.wiki" || exit 2

     test -d "$TGT_WIKI/.git" || exit 2
     git -C "$TGT_WIKI" remote get-url origin | grep -q "github\.com[/:]$OWNER/$REPO\.wiki" || exit 2

     # Remove verified temporary directories
     rm -rf "$SRC_WIKI" "$TGT_WIKI"
     ```

### Repository file updates

Perform only the specified bootstrap modifications (`Agent — Coder`):

1. **[website-facts.yaml](../website-facts.yaml)**:
   - Write the final values from the facts readout recorded in the bootstrap issue, then check that the file matches that record. Keep all existing keys intact. Undecided optional facts remain blank or explicit `none`.
2. **[README.md](../README.md)**:
   - Update the top-level heading to the repository name.
   - Replace the marked `<!-- template-only:start --> ... <!-- template-only:end -->` block with a generic opening linking back to the [web-starter Template](https://github.com/joebaz/web-starter):
     ```markdown
     # <repo-name>

     This repository was created from the [web-starter Template](https://github.com/joebaz/web-starter) for informational website projects.
     ```
   - Retarget operational wiki links (Agent setup, Paseo setup, Accessibility review, Site launch checklist) to the new repository's wiki.
   - Keep the repository tools/scripts/docs descriptions and the facts file pointer.
3. **[.github/ISSUE_TEMPLATE/config.yml](../.github/ISSUE_TEMPLATE/config.yml)**:
   - Update the `Contribution guide` contact URL to point to this repository's `CONTRIBUTING.md` on its default branch:
     `https://github.com/<owner>/<repo>/blob/<default-branch>/CONTRIBUTING.md`
4. **[docs/configure-sitemap-and-robots.md](configure-sitemap-and-robots.md)**:
   - Retarget the launch checklist wiki link and wording to the new repository's wiki.
5. **[package.json](../package.json) & [package-lock.json](../package-lock.json)**:
   - Update the `"name"` field in [package.json](../package.json) to match the normalized repository name (valid lowercase npm package name: lowercase, URL-friendly, converted spaces/underscores to hyphens). If the repository name is ambiguous or cannot be cleanly normalized, surface it to the Maintainer.
   - Refresh [package-lock.json](../package-lock.json) with `npm install --package-lock-only`. Verify package name matches in both files; no dependency upgrades.
6. **[docs/plans/](plans/) & [docs/specs/](specs/)**:
   - Bootstrap leaves both folders empty except for a `.gitkeep` file. This is a bootstrap-only exception to keeping Task Artifacts; later work adds plans and specs here as usual.
   - Compare the folders with what the Template supplied in the repository's first commit:
     ```sh
     git rev-list --max-parents=0 HEAD
     git ls-tree -r --name-only "$(git rev-list --max-parents=0 HEAD)" -- docs/plans docs/specs
     ls -A docs/plans docs/specs
     ```
     The first command must print exactly one commit. Expect only the Template's files. If an earlier bootstrap attempt left its own plan or spec, post its text to the bootstrap issue, read the comment back to check it matches, and include it in the removal. If anything else is there, such as a plan for new site work, or there is more than one first commit, stop and ask the Maintainer through the Coordinator.
   - Remove those files, including the plans guide `docs/plans/README.md`, and add an empty `.gitkeep` to each folder.
   - The plans guide stays available from the Template. Point its links in `docs/agents/issue-tracker.md` and `docs/agents/roles/planner.md` to `https://github.com/joebaz/web-starter/blob/main/docs/plans/README.md`.
   - In [docs/lifecycle.yaml](lifecycle.yaml), update the `authority` reference for `specs/15-lifecycle.md` to point to the Template's published URL:
     `https://github.com/joebaz/web-starter/blob/main/docs/specs/15-lifecycle.md`
   - Inspect retained documentation links across the repository and repoint any links into the removed Template history to valid destinations.
7. **Retained Template links**:
   - Find all Template references:
     ```sh
     git grep "web-starter" -- ':!docs/plans' ':!docs/specs'
     ```
   - Explicitly retain Template reference notes and provenance links:
     - Pending reference notes for Template issues [#30](https://github.com/joebaz/web-starter/issues/30) and [#31](https://github.com/joebaz/web-starter/issues/31) in [coding-standards.md](../coding-standards.md).
     - Provenance and created-from links back to the web-starter Template.
     - Remote historical design record link in [docs/lifecycle.yaml](lifecycle.yaml).
   - Do not perform broad search-and-replace of `web-starter`.
8. **[astro.config.mjs](../astro.config.mjs), [src/pages/404.astro](../src/pages/404.astro), and smoke tests**:
   - Apply any custom sitemap exclusions or 404 copy chosen during intake. Update [tests/smoke/not-found.spec.ts](../tests/smoke/not-found.spec.ts) and [tests/smoke/build.spec.ts](../tests/smoke/build.spec.ts) if 404 text was modified.
9. **[AGENTS.md](../AGENTS.md)**:
   - Do this last, once all other bootstrap file changes are done.
   - Confirm `docs/plans/` and `docs/specs/` still hold only `.gitkeep`:
     ```sh
     ls -A docs/plans docs/specs
     ```
   - Remove the single bullet in [AGENTS.md](../AGENTS.md) pointing to `docs/bootstrap-website.md`. Preserve all other guidance and the [CLAUDE.md](../CLAUDE.md) symlink.

---

## Validation and publishing

The remainder of the bootstrap process completes through the canonical [Lifecycle](lifecycle.yaml), which governs independent review, Maintainer sign-off, publishing, merge, and retro.

1. **Run local validation checks** (`Agent — Coder`):
   - Run the required checks specified in [CONTRIBUTING.md#validate-your-change](../CONTRIBUTING.md#validate-your-change):
     ```sh
     npm run format:check
     npm run lint
     npm run check
     npm test
     npm run build
     ```
   - Verify that built HTML output contains the configured `lang` attribute and valid metadata.
   - Run the early bootstrap setup check:
     ```sh
     npm run bootstrap:check
     ```
     In early bootstrap, `bootstrap:check` is expected to exit with code `1` because GitHub Project setup, contact URL, and pull request CI are pending.

2. **Commit, push, and open the pull request** (`Agent — Coordinator`):
   - After validation, the Reviewer's independent review, and the Maintainer's sign-off, the Coordinator commits the bootstrap changes, pushes the bootstrap branch, and opens a pull request into the default branch with `Closes #<bootstrap-issue-number>`, as [Agent Git publishing](#agent-git-publishing) describes.
   - The Maintainer's sign-off covers the exact reviewed changes, not a later commit. The Coordinator commits exactly those changes, records the commit SHA in the bootstrap issue, and checks that the commit's changes match the signed-off diff. Any change after sign-off goes back through review and sign-off. For bootstrap only, this takes the place of the Lifecycle's sign-off on an existing commit.
   - It confirms the pushed commit matches local `HEAD` and records the pull request URL in the bootstrap issue.

3. **Verify publishing evidence** (`Agent — Coordinator`):
   - Verify a clean working tree:
     ```sh
     git status --porcelain
     ```
   - Verify local `HEAD` commit equals pull request `headRefOid`:
     ```sh
     PR_NUMBER="<pr-number>"
     case "$PR_NUMBER" in ""|\<*\>) echo "Error: Unbound PR_NUMBER" >&2; exit 2 ;; esac

     LOCAL_HEAD=$(git rev-parse HEAD)
     PR_HEAD=$(gh pr view "$PR_NUMBER" --json headRefOid --jq .headRefOid)
     test "$LOCAL_HEAD" = "$PR_HEAD" || exit 2
     ```
   - Inspect GitHub Actions CI runs for the pull request event on the current head commit:
     ```sh
     gh run list --commit "$LOCAL_HEAD" --event pull_request --json databaseId,name,event,headSha,status,conclusion,url
     ```
     Require all runs to show `status: "completed"` and `conclusion: "success"`. Missing or running CI counts as pending/failure; no older green run can substitute for current-head pull request CI.
   - Run the final read-only setup check:
     ```sh
     npm run bootstrap:check
     ```
     Verify that `bootstrap:check` exits with code `0`.

4. **Merge** (`Maintainer`):
   - Once CI passes, the Coordinator gives the Maintainer the pull request URL and its checked head commit to merge in GitHub. After the merge, it confirms the result on the default branch.

5. **Close out** (`Agent — Coordinator`):
   - After the merge, check that the bootstrap issue is closed and the bootstrap branch was deleted on GitHub.
   - Set the bootstrap issue's Project Status to `Done` if it isn't already, using the Project recorded in the bootstrap issue and the Coordinator SOP's [status method](agents/roles/coordinator.md#change-github-project-status). Change only that item; don't remove or archive anything.
   - Read back the issue's Project membership and `Done` status, then record the result in the bootstrap issue and the execution checkpoint.
   - Report bootstrap complete only after this readback. If any check fails or can't be verified, report it as pending instead.
