# Execution checkpoint

The execution checkpoint is a small local record of where one issue stands in the [Lifecycle](lifecycle.yaml), so a replacement agent can pick up the work. It lives at `.agent-state/<issue>.yaml` in the worktree, which Git ignores, and lasts until the worktree is archived. It points to evidence instead of copying it, and it is not an approval. The Lifecycle sets when to update it; the [Coordinator SOP](agents/roles/coordinator.md#keep-the-execution-checkpoint) describes how to keep and recover it.

## Values

- `[]` means known to be empty. `null` means not established; never replace it with a guess. An unknown count is not `0`, and an unknown approval is not granted.
- Evidence is a URL, a file at a commit (`path@commit`), or a chat locator naming the agent or session and the time.
- A revision is a commit. For uncommitted work, give the baseline commit plus a digest or location of the patch, such as `1a2b3c4 + patch sha256:9f8e7d6c`.

## Fields

- `issue`: the issue's URL.
- `stage` and `step`: the current stage and step key.
- `steps`: the current stage's applicable steps in Lifecycle order, each with its status: `pending`, `started`, `waiting`, `failed`, or `completed`. A conditional step is added once its transition is taken. After a return, the steps that must run again go back to `pending`.
- `next`: the next action.
- `revision`: the current revision of the work.
- `waits` and `errors`: what the step waits on, or what failed, with evidence and the location of any kept partial output.
- `cycles`: the `count`, and evidence for each cycle's authorization and any extension or review waiver, with the waiver's exact revision.
- `sign_off`: the Maintainer's sign-off evidence and the revision it covers.
- `obligations`: pointers to commitments beyond the Lifecycle's own steps, such as a task the issue assigns to Retro.
- `evidence`: pointers to the approved requirements, the plan, and the latest review and Architect assessment.

The Progress Readout and the native task list are built from this record, as the Lifecycle's [`progress_readout`](lifecycle.yaml) defines.

## Example

An illustrative record for a fictional issue, waiting on a Reviewer in its second cycle:

```yaml
issue: https://github.com/OWNER/REPO/issues/123
stage: Implement
step: independent-review
steps:
  - coder-briefing: completed
  - implementation-validation: completed
  - reviewer-dispatch: completed
  - independent-review: waiting
  - maintainer-review: pending
  - signed-off-assessment: pending
  - implementation-evidence: pending
next: Receive the Reviewer's findings, then take the matching transition
revision: 1a2b3c4 + patch sha256:9f8e7d6c
waits:
  - Reviewer rv-01, since 2026-10-28T10:05+09:00
errors: []
cycles:
  count: 2
  authorizations:
    - https://github.com/OWNER/REPO/issues/123#issuecomment-111
    - "chat: Maintainer, 2026-10-28T09:20+09:00"
  extensions: []
  waivers: []
sign_off: null
obligations: []
evidence:
  requirements: "https://github.com/OWNER/REPO/issues/123, body sha256:9c8d7e6f, approved in #issuecomment-111"
  plan: docs/plans/123-example-change.md@0f1e2d3
  review: null
  assessment: "chat: Architect agent ar-01, plan 0f1e2d3, 2026-10-27T18:00+09:00"
```
