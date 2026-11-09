# Quota-efficient agent monitoring: implementation plan

Issue: #78

## Requirements

- Approved requirements: [`docs/specs/78-quota-efficient-agent-monitoring.md`](../specs/78-quota-efficient-agent-monitoring.md) at `d96f148`, blob `8572122422bd417610999f75ef392dded1071f91`. The Maintainer approved it with "Approved" in the Coordinator chat on 2026-11-02.
- Acceptance criteria: spec stories 1–13 and the Implementation Decisions. Stories 14–16 are local setup the Maintainer applies; no agent edits configuration or creates schedules.

## Operations

### 1. Record the spec approval

- Owner: Planner
- Files and actions: in the spec, change only the Status note, to say the spec was approved on 2026-11-02 at `d96f148` and is #78's requirements contract. This records an approved decision, so it is not a material revision.
- Do not start before: plan approval.
- Output and handoff: the Maintainer reviews the artifact diff (this plan plus the Status note, 100 changed lines or fewer) and commits it. That commit is the artifact baseline. Committing isn't a review or a waiver.
- Check: `git diff --numstat -- docs/specs/78-quota-efficient-agent-monitoring.md`, expecting only the Status note. Before the Maintainer's review, add the note's added plus deleted lines to `wc -l docs/plans/78-quota-efficient-agent-monitoring.md`, because `git diff` doesn't count an untracked plan. The total must be 100 or fewer.

### 2. Rewrite delegated-work checks

- Owner: Coder
- Files and actions: `docs/agents/roles/coordinator.md`:
  - Replace the body under `## Check on delegated work` with wording of the Coder's choice that meets stories 1–10. The section must:
    - set up no recurring checks and no timed wake-ups, on agents or on the Coordinator itself
    - rely on the tool's finish, failure, and permission notifications, and check the agent's actual result
    - check every open agent on the work at each wake or takeover, including those a predecessor started
    - keep the rule that a finished turn doesn't close the work
    - report a usage limit once, with the reset time if the tool shows one or "unknown" otherwise, and leave every resume to the Maintainer
    - report a Maintainer-only wait or an unclear stall once, with no repeat checks or reports for that work, while other authorized work continues
    - send messages only on change, each led by exactly 🛑, 🟡, 🟢, or ⏸️, with the spec's meanings
    - let the Maintainer's stop override everything, and leave gates unchanged
    - wait for CI by watching checks from the shell, for example `gh pr checks <pr> --watch`, re-running the watch at the tool's time limit
  - Remove these old requirements:
    - checking during the Maintainer's direct talks with an agent
    - resuming an agent after a usage limit resets
    - moving recurring checks to a replacement agent

    The takeover check covers open agents instead, and no timers move.

  - Keep the heading, so the `#check-on-delegated-work` anchor still works. In the bullet that links to it, widen "the agents you started" to cover inherited agents.
  - The shared rules from operation 3 are the single authority on these points: no timers, no automatic resume, and the Maintainer's stop overriding everything. This section refers to them rather than restating them, and keeps the Coordinator-specific procedures.
  - Story 13's tool-agnostic rule applies to this section, that bullet, and the shared rules from operation 3. Name no agent tool there; `gh` is allowed. Other tool references in the repository are out of scope.
- Do not start before: the artifact baseline commit.
- Output and handoff: an uncommitted diff, handed to the Coordinator.

### 3. Add shared rules and align reporting

- Owner: Coder
- Files and actions: `AGENTS.md`, Roles section:
  - Replace "Report to whoever started you…" with a rule meeting story 11: reply to whoever sent each message, agent or Maintainer, and send the hand back to whoever gave the assignment.
  - Add rules for every role that meet stories 1, 5, and 9: set up no recurring or one-shot checks or wake-ups, on any agent or on yourself; never resume usage-limited work automatically, because the Maintainer resumes it; and never restart something the Maintainer stopped. A CI watch in the shell isn't a wake-up, and the Maintainer's own optional local pings aren't set up by agents. The wording is the Coder's choice, and it names no agent tool. (Cycle 2.)
  - In the unavailable-skill bullet, change "tell whoever started you" to the assignment-giver, so that inherited agents report to the right owner.
  - Leave the requirements-change bullet as it is; "whoever told you" already names the sender.
  - Don't add any automatic copy to the Coordinator.
  - `CLAUDE.md` stays a symlink to `AGENTS.md`.
  - The other role SOPs stay unchanged (story 12). Their own assignment and role wording still applies.
- Do not start before: the artifact baseline commit.
- Output and handoff: the same uncommitted diff as operation 2.
- Check: `test -L CLAUDE.md && readlink CLAUDE.md`, expecting `AGENTS.md`.

### 4. Validate

- Owner: Coder, then an independent Reviewer
- Files and actions: none
- Do not start before: operations 2 and 3.
- Output and handoff: results in chat to the Coordinator, as [qa.md](../qa.md#report-results) describes.
- Check:
  - `npm run format:check`, `npm run lint`, `npm run check`, `npm test`, and `npm run build`, expecting a pass, as CONTRIBUTING requires for a `fix`.
  - `git diff --check` and `git diff <baseline>`, expecting only `docs/agents/roles/coordinator.md`, `AGENTS.md`, and this plan's cycle-2 amendment. `git status --short --untracked-files=all` checks the working tree, expecting those three files and nothing untracked.
  - `git diff --numstat <baseline>`, expecting 100 or fewer added plus deleted lines, including the plan amendment.
  - `rg -n -i "heartbeat|15 minutes|every [0-9]+ min" docs/agents/roles/coordinator.md`, expecting no leftover of the old monitoring policy. This is not a search for tool names in general.
  - `git diff --quiet <baseline> -- docs/lifecycle.yaml docs/execution-checkpoint.md docs/specs docs/agents/roles/planner.md docs/agents/roles/researcher.md`, expecting no change.
  - The Reviewer runs `git fetch origin main` and records `git merge-base origin/main HEAD` as the review base, with no reset or rebase. The Reviewer then reviews the whole branch from that base: spec, plan, Status note, and implementation. The Reviewer traces stories 1–13 to the new text, confirms that the shared rules for stories 1, 5, and 9 reach every role through `AGENTS.md`, and reports any story that isn't met.
  - No automated regression test, since one would only repeat the prose. Verification is the trace, plus the spec's observation of ordinary use after merge. No extra model requests.

## Final validation and hand back

- Scope: implementation files `docs/agents/roles/coordinator.md` and `AGENTS.md`; Task Artifacts the spec and this plan, which stay in scope after they're committed; local records `.agent-state/78.yaml`, ignored by Git.
- Hand back: the diff, the validation results, and the Reviewer's story trace go to the Coordinator.

## Maintainer feedback and decisions

- Spec approval: commit `d96f148`, "Approved" in the Coordinator chat, 2026-11-02. It covers requirements only.
- The spec prescribes no wording except the emojis (Maintainer direction, 2026-11-02). This plan sets required content, not text.
- Cycle 2, 2026-11-02:
  - The cycle-1 Reviewer found stories 1, 5, and 9 met only for the Coordinator (Spec, P2). The Maintainer authorized the fix with "Proceed" in the Coordinator chat.
  - Operation 1 was completed at the artifact baseline `2cdb0e9`, and it isn't repeated.
  - Once this revision is approved, the Coder resumes from the cycle-1 patch against `2cdb0e9`. The cycle count continues.

## Architect recommendations

Assessment of plan `8c2f08eb…` (relayed by the Coordinator, 2026-11-02). All six were accepted:

1. Review sequence within the 100-line limit (plan approval, then the Status note, then the Maintainer's review and commit of the artifacts, then the Coder) and a Reviewer covering the whole branch: operations 1 and 4. The reassessment of `04b58f69…` added a review base taken from the fetched merge base, an artifact line count that includes the untracked plan, and a clearer `git status` check, all accepted.
2. No outline approval. The change rewrites one bounded section and makes small bullet edits; it isn't a new or substantially revised document.
3. Tool-agnostic scope limited to the monitoring section and its bullet, `gh` allowed, and the search targeting the old policy: operations 2 and 4.
4. `AGENTS.md` decisions: the unavailable-skill bullet is aligned, and the requirements-change bullet is kept: operation 3.
5. The old direct-talk checking, automatic resume, and check-transfer instructions are removed: operation 2.
6. This section now records the dispositions.
