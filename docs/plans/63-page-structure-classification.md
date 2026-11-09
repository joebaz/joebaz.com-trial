# Clarify classification of Page Structure changes: implementation plan

Issue: #63

## Requirements

- Approved requirements: [#63](https://github.com/joebaz/web-starter/issues/63) issue body, "Approved decision" through "Validation" sections, issue edit of 2026-10-30T00:14:32Z, SHA-256 `b1575d8589a44916d16754cc3f2e06be896fb4968b533a763a986d0d3b06b280` of the appended approved text, approved by the Maintainer on 2026-10-30 in the Planner session.
- Acceptance criteria: the issue's "Scope and completion criteria", the exact text in "Approved file changes", and the checks in "Validation".

## Operations

### 1. Apply the approved wording

- Owner: Coder
- Files and actions:
  - `CONTRIBUTING.md`: replace the Content and Fix issue-type bullets; add the purpose sentence after the issue-type list; replace the `content` and `fix` branch-type bullets; delete the "Pending reference — #63" note.
  - `.github/ISSUE_TEMPLATE/01-content.yml`: replace `description:`; rename the dropdown option `Change navigation or site structure`.
  - `paseo.json`: replace the content and fix lines in `metadataGeneration.branchName.instructions`, keeping JSON escaping.
  - `docs/agents/triage-labels.md`: replace the `fix` row meaning and the paragraph below the category table.
- Do not start before: Define and Plan are closed and the Coordinator assigns the Coder.
- Output and handoff: an uncommitted implementation diff limited to these four guidance files, handed to the Coordinator alongside the existing plan Task Artifact, `docs/plans/63-page-structure-classification.md`. Preserve the plan; it is a separate task deliverable, not a fifth guidance implementation file.
- Check: compare each changed line with the issue's exact text, expecting a word-for-word match and no other changes.

### 2. Validate the change

- Owner: Coder
- Files and actions: none
- Do not start before: operation 1.
- Output and handoff: validation results in chat to the Coordinator, as [qa.md](../qa.md#report-results) describes.
- Check:
  - `npm run format:check` and `git diff --check`, expecting a pass.
  - `node -e 'JSON.parse(require("fs").readFileSync("paseo.json", "utf8"))'`, expecting no error.
  - A YAML parse of `.github/ISSUE_TEMPLATE/01-content.yml`, expecting no error.
  - `npm run lint`, `npm run check`, `npm test`, and `npm run build`, expecting a pass. `paseo.json` is outside CI's documentation path list, so CI runs the full checks.
  - `grep -rnE "site structure|#63" CONTRIBUTING.md .github paseo.json docs/agents`, expecting no superseded wording.
  - `git diff` and `git status --short --untracked-files=all`, expecting the four guidance implementation files plus the existing plan Task Artifact. Inspect the plan explicitly with `git diff --no-index -- /dev/null docs/plans/63-page-structure-classification.md` while it is untracked (exit 1 means differences were displayed); ordinary `git diff` omits untracked files. Review its text and run `npx prettier --check docs/plans/63-page-structure-classification.md` and `git diff --no-index --check -- /dev/null docs/plans/63-page-structure-classification.md`, expecting formatting and whitespace checks to pass.
  - `git check-ignore .agent-state/63.yaml`, expecting the Coordinator's local execution checkpoint to be ignored. Account for it separately from the implementation files and plan; it is not a repository deliverable.
  - Explain every other changed or untracked path to the Coordinator before handoff; unexplained files fail the scope check. Preserve the plan rather than deleting it to meet a file-count expectation.

## Parallel read-only work

- None needed.

## Final validation and hand back

- Checks: the operation 2 checks on the final revision, an independent Reviewer pass against the issue's approved text, the Maintainer's sign-off, and the Architect's assessment, as the [Lifecycle](../lifecycle.yaml) requires.
- Hand back: the diff, validation results, and review outcome to the Coordinator, who reports to the Maintainer.

## Maintainer feedback and decisions

- Purpose decides the category, not the files changed ([#63 Approved decision](https://github.com/joebaz/web-starter/issues/63)): adopted as one sentence in `CONTRIBUTING.md`; affects operation 1.
- Copy and fact corrections are Content (same source): recorded as an example only; no file change.
- A Redesign is split into Sub-Issues, each classified separately (same source): recorded as an example only; no file change.
- Performance problems are a Fix; planned performance capability is a Feature (same source): "performance" added to Fix wording in three files; affects operation 1.
- Lighter wording: no Content form hint and no `paseo.json` purpose line (same source): affects operation 1.

## Architect recommendations

- R1 — distinguish the four guidance implementation files from the existing untracked plan Task Artifact and the ignored Coordinator checkpoint: adopted in operations 1 and 2. The checks now inspect and validate the plan explicitly, account for the checkpoint separately, and reject unexplained files without deleting the plan. Assessment reference: Architect agent `faaa492b-d1af-4d38-8e83-977546cce8aa`, assessing plan blob `e8f71590872fd790395bf85bb934ffc751b11a41` at baseline `6e012076c4ffae0ccf3c38472e540b19d60a3b68`; all criteria aligned, with R1 as the sole recommendation.
