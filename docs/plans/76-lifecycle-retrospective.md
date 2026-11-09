# #76: Improve planning approval and agent guidance

Issue: [#76](https://github.com/joebaz/web-starter/issues/76)

## Reading guide

**For phone review now:** read the six [walkthroughs](#walkthroughs) below. They show what an agent would do in everyday situations under this proposal.

**For desktop review later:** review the [files in scope](#scope) and [exact proposed wording](#proposed-wording). That section keeps the current text and its replacement together, grouped by file. The [implementation and checks](#operations) follow it; [requirements evidence](#requirements) and review decisions are at the end.

**Status:** this plan is awaiting your full review and approval. Reviewing the examples alone does not approve the copy changes. Implementation has not started.

## Walkthroughs

These are examples of the proposed behavior, not approval requests. The Coder will check them again against the finished changes.

### 1. The plan is ready, but you haven't approved it

The Architect recommends changing an instruction in the plan. The Planner makes that change, and the Architect checks what changed. Once every recommendation has a recorded decision and no scope question remains, the Coordinator presents the final updated plan, the assessment, and the decisions to you.

The Coder waits. Only after you approve that final plan does planning finish and the Coordinator brief the Coder. The Coordinator records exactly which version you approved.

### 2. The plan changes before or during implementation

**While planning is still open:** you ask for different wording. The Planner updates it, the Architect checks the changes since its last assessment, and the recommendations are resolved before you approve the updated plan. The same process applies if the change comes from an Architect recommendation or your decision to include more work.

**After implementation has started:** the Coder discovers another file needs changing. The Coordinator pauses the work that depends on that change and asks you to approve the added scope and updated plan. After approval, the work follows the usual authorized implementation, checks, and independent review (or a waiver allowed by the existing rules), then your final sign-off and the Architect's assessment of the signed-off work. No separate Architect assessment is required before coding resumes.

**If only the record changes:** the Planner writes down a decision you already approved, without changing it. That alone needs no new assessment or approval. The Coordinator records the updated version under your existing approval. Correcting a typo or link is treated the same way.

### 3. You keep talking with the Planner after it reports back

The Planner reports that its assignment is done, but you continue discussing a proposal with it. The Coordinator keeps checking every 15 minutes. Seeing that the conversation is moving forward, it records the progress without interrupting. The Planner keeps the Coordinator informed about decisions awaiting you and decisions you make.

Checks stop when the assigned step is recorded as complete and no decision remains, or when you stop or reassign the work. If the agent is replaced, the checks move to its replacement.

### 4. You need to act in another agent's session

The Planner is waiting for your requirements decision. The Coordinator sends: “Action needed: approve or revise the #76 requirements in the Planner session.” It records the wait without copying the proposal into its own conversation.

If a blocker needs explaining—for example, missing permission to update the issue's Project status—the Coordinator adds that detail.

### 5. A skill is optional, or unavailable

Before asking requirements questions, the Planner offers a visible line: “🧭 Optional skill: grilling can stress-test these requirements. Start it to use that interview, or tell me to continue without it.” If you start it, the Planner follows it. If you decline, the Planner continues without it.

If the suggested triage skill isn't installed, the Planner says so before the interview and explains the available alternative, such as checking labels and readiness directly. You choose whether to use a skill.

### 6. The plan exists but hasn't been added to Git

The Coder checks the changed files and sees the five guidance files. The plan doesn't appear in that diff because it hasn't been added to Git yet.

The Coder also checks for untracked files, opens the plan, and includes it separately in the handoff. The local progress checkpoint is confirmed as ignored by Git and stays a local record. Any unexpected file is explained. The plan is kept; it isn't deleted to make the file count match.

## Scope

Five guidance files will change:

- `docs/lifecycle.yaml`: require plan approval and define when a changed plan needs approval again.
- `docs/agents/roles/coordinator.md`: keep oversight going while work or decisions remain open, and send short action notices.
- `docs/agents/roles/planner.md`: make optional skill offers visible and keep the Coordinator informed during direct discussions.
- `docs/plans/README.md`: check implementation files, task documents, and local records separately.
- `docs/specs/15-lifecycle.md`: update the design record with the changes and observations from #63, while preserving the unfinished #45 trial and #15 work.

The checkpoint reference, `docs/execution-checkpoint.md`, was assessed and needs no change: its existing plan-evidence field can identify the approved plan and approval source.

This plan, `docs/plans/76-lifecycle-retrospective.md`, is a separate Task Artifact, currently untracked. The Coordinator's `.agent-state/76.yaml` checkpoint is an ignored local record, not a deliverable. Any other file change needs the Maintainer's decision first.

Each rule keeps one owner: the Lifecycle owns approval rules and their order; the Coordinator SOP owns oversight and notifications; the Planner SOP owns skill offers; the plans guide owns scope checks. The #15 design record summarizes and links to those rules.

At Coder briefing, evaluate the affected documents under the Lifecycle's existing outline requirement. Before expanding any new or substantially revised document, the Coder must obtain the Maintainer's approval of a short outline. Approval of this plan and its exact wording does not waive that step; no additional SOP edit is needed.

## Proposed wording

Each change below is exact text. "Replace" quotes the current text; "With" is the new text. Prettier strips the leading indentation from YAML snippets, so indent each one to match the text it replaces or the siblings it joins.

### A. `docs/lifecycle.yaml`

A1. In `rules.authorization`, replace:

```yaml
- The Maintainer approves requirements, scope, and changes to either.
```

With:

```yaml
- The Maintainer approves requirements, scope, and changes to either, and the final plan revision under rules.approvals.
```

A2. Insert after the last `rules.requirements` bullet (`- An already approved, ready issue needs no further approval and no second spec.`), before `artifacts:`:

```yaml
approvals:
  - Requirements approval, plan approval, and final sign-off are separate Maintainer decisions; none implies another.
  - Requirements approval accepts the requirements contract in Define.
  - Plan approval accepts one final plan revision in Plan, after the Architect's assessment and a decision on every recommendation.
  - Final sign-off accepts the implemented commit in Implement.
  - Plan approval names the plan's revision, a commit or blob. The Coder works only from an approved revision.
  - A plan revision is material when it changes an operation, a file in scope, wording to implement, a check, or a recommendation's decision. A material revision needs a new plan approval.
  - Before Plan closes, a material revision from any step returns to implementation-plan, then plan-assessment and recommendation decisions before plan-approval.
  - After Plan closes, pause the work that depends on a material revision until the Maintainer approves the revised plan; continue under the normal cycle, review, and sign-off rules, with signed-off-assessment covering the final signed-off commit.
  - Other revisions, such as recording an already approved decision or fixing a typo or link, keep the approval. Record the new revision with the approval it falls under. Merely recording an already approved recommendation decision does not require another assessment.
```

A3. In `readiness-confirmation`, replace:

```yaml
- Close Define; the Plan stage needs no further approval.
```

With:

```yaml
- Close Define; the Plan stage needs no entry approval.
```

A4. In the Plan stage `completion`, add after `- The plan reflects authorized feedback, with no pending scope decision.`:

```yaml
- The Maintainer has approved the final plan revision under rules.approvals.
```

A5. In `plan-assessment`, replace:

```yaml
action: The Coordinator asks the Architect to assess the plan.
```

With:

```yaml
action:
  - The Coordinator asks the Architect to assess the plan.
  - On every return before Plan closes, regardless of the originating step, the Architect assesses the material changes since the last assessed revision under rules.approvals.
```

A6. In `recommendations-review`, change the last transition's target:

```yaml
- when: No out-of-scope recommendation is pending.
  to: plan-approval
```

A7. Insert this step after `scope-decision` and before `plan-close`, so `scope-decision` continues to it by listed order:

```yaml
- key: plan-approval
  role: Maintainer and Coordinator
  action:
    - The Coordinator asks the Maintainer to approve the final plan revision.
    - The Maintainer approves that revision or requests changes.
  method:
    - agents/roles/coordinator.md#hand-back
  evidence: Maintainer approval in chat or the issue, naming the plan revision; the checkpoint's plan evidence.
  transitions:
    - when: Changes requested.
      to: implementation-plan
    - when: Approved.
      to: plan-close
```

A8. In the Implement stage `entry`, add after `- Every cycle meets rules.cycles before changes start.`:

```yaml
- The Coder works from a plan revision approved under rules.approvals.
```

A9. In `coder-briefing`, replace:

```yaml
- Brief the Coder on requirements, plan, references, scope, and assignment, with the Coder as the one editor.
```

With:

```yaml
- Brief the Coder on requirements, the approved plan revision, references, scope, and assignment, with the Coder as the one editor.
```

### B. `docs/agents/roles/coordinator.md`

B1. In "Coordinate the work", replace:

```markdown
- Check on the agents you started every 15 minutes. If one has made no progress since the last check, find out why. Resume it when it can continue, for example after a usage limit resets, and tell the maintainer if it can't.
```

With:

```markdown
- Check on the agents you started, as [Check on delegated work](#check-on-delegated-work) describes.
```

B2. Insert a new section after "Coordinate the work" and before "Oversee the work":

```markdown
## Check on delegated work

Check on each agent you started every 15 minutes while its work, or a maintainer decision about that work, is open. That includes time the maintainer spends talking with the agent directly. Use the tool's recurring check, such as a Paseo heartbeat, when it has one.

- A finished agent turn or completion report doesn't end the checks. The work stays open until its Lifecycle step has recorded completion evidence and no maintainer decision about it is pending.
- At each check, look at the agent's latest activity. If the agent or the maintainer has moved the work on since the last check, record that and don't interrupt them.
- If neither has made progress since the last check, find out why. Resume the agent when it can continue, for example after a usage limit resets, and tell the maintainer if it can't.
- Stop the checks only when the work is closed as above, or the maintainer stops or reassigns it. When you replace an agent, move the checks to its replacement. Record the reason in the checkpoint.
```

B3. In "Hand back", add after the first paragraph (the one ending "suggested new issues."):

```markdown
For plan approval, give the plan revision, the Architect's assessment, and each recommendation's decision, and ask the maintainer to approve that revision.

When the maintainer needs to act in another agent's session, such as on a proposal or plan there, send a short notice naming the action and the session, for example: "Action needed: approve or revise the #76 requirements in the Planner session." Don't repeat that session's proposal or report. Add your own detail only to explain a blocker or a conflicting decision. Keep recording the wait and the decision evidence as the Lifecycle requires.
```

### C. `docs/agents/roles/planner.md`

C1. In "Choose a route", replace:

```markdown
Recommend the skill, say what it will produce, and ask the maintainer to start it. No route or skill is mandatory.
```

With:

```markdown
Before any requirements interview, offer the skill on its own line, marked 🧭. Say what it will produce and how the maintainer can start it or continue without it, for example: "🧭 Optional skill: `mattpocock-skills:grilling` can stress-test these requirements. Start it to use that interview, or tell me to continue without it." If the route's skill isn't available, say so in the offer and name any available alternative. No route or skill is mandatory; continue without one when the maintainer says so.
```

C2. In "Plan the implementation", replace:

```markdown
- A hand back completes only the current assignment. The Lifecycle sets the later steps, such as the Architect's assessment, that must finish before the Plan stage closes.
```

With:

```markdown
- A hand back completes only the current assignment. The Lifecycle sets the later steps, such as the Architect's assessment and the maintainer's plan approval, that must finish before the Plan stage closes. Name the plan revision in every hand back; follow the Lifecycle's `rules.approvals` for approval validity and evidence.
- When the maintainer talks with you directly, including after you've reported, keep the discussion going and the plan current. Tell whoever started you about each decision that's waiting and each one the maintainer makes.
```

### D. `docs/plans/README.md`

D1. Insert after the paragraph that starts "A plan is an ordered list of operations":

```markdown
Scope checks account for every path the work leaves in the checkout, in three groups:

- **Implementation files:** the files the operations change.
- **Task Artifacts:** the plan, a linked spec, or another task record the issue delivers, including any that exist before implementation starts. `git diff` omits untracked files, so list them with `git status --short --untracked-files=all` and inspect each with `git diff --no-index -- /dev/null <path>`.
- **Local records:** the execution checkpoint, which Git ignores. Confirm it with `git check-ignore`; it is not a deliverable.

Explain any other path before hand back. Don't delete a deliverable to match an expected file list.
```

D2. In the template, under `## Final validation and hand back`, insert before `- Checks:`:

```markdown
- Scope: implementation files <paths>; Task Artifacts <paths>; local records <paths>
```

### E. `docs/specs/15-lifecycle.md`

E1. Replace the status line:

```markdown
> **Status:** Reconciliation draft for [#15], following the implementation of [#66] in [PR #71]. The common Lifecycle is operational for all issue types. The Docs trial on [#63] remains outstanding; the Maintainer selected open Feature issue [#45] as the next trial candidate after it. Neither trial is complete; this is not #15's final revision.
```

With:

```markdown
> **Status:** Reconciliation draft for [#15], following the implementation of [#66] in [PR #71] and the Docs trial on [#63], delivered in [PR #75]. The common Lifecycle is operational for all issue types. [#76] applied #63's retrospective findings. The trial on Feature issue [#45] remains outstanding; this is not #15's final revision.
```

E2. In "Roles and planning", second paragraph, replace:

```markdown
and records sourced Maintainer feedback and Architect recommendation dispositions. A Planner hand back ends its assignment, not the Plan stage's remaining obligations.
```

With:

```markdown
and records sourced Maintainer feedback and Architect recommendation dispositions. After the Architect's assessment and a decision on every recommendation, the Maintainer approves the final plan revision, and the Coder works only from an approved revision. Requirements approval, plan approval, and final sign-off are separate decisions; the Lifecycle's `approvals` rule defines which plan revisions need a new approval. A Planner hand back ends its assignment, not the Plan stage's remaining obligations.
```

E3. In "Planning routes and skills", replace:

```markdown
The Planner recommends the relevant skill and explains its expected output.
```

With:

```markdown
Before any requirements interview, the Planner offers the relevant skill on a visible line marked 🧭, with its expected output and how to start it or continue without it, and names any unavailable skill and an available alternative.
```

E4. In "Local state, recovery, and progress", insert as a new final paragraph:

```markdown
The [Coordinator](../agents/roles/coordinator.md#check-on-delegated-work) checks on delegated agents every 15 minutes while their work or a Maintainer decision about it is open, including direct conversations between the Maintainer and another agent. A finished turn or completion report doesn't end those checks. When the Maintainer must act in another agent's session, the Coordinator sends a short notice naming the action and session instead of repeating that session's content.
```

E5. In "Plan: decide concrete work and resolve recommendations", replace:

```markdown
Plan closes only after every recommendation has a disposition, authorized feedback is reflected in the plan, and no scope decision remains pending.
```

With:

```markdown
Plan closes only after every recommendation has a disposition, authorized feedback is reflected in the plan, no scope decision remains pending, and the Maintainer approves the final plan revision.
```

E6. In "Implement: validate and review the current revision", replace:

```markdown
The Coordinator briefs the Coder as sole editor.
```

With:

```markdown
The Coordinator briefs the Coder as sole editor on the approved plan revision.
```

E7. Replace AC1:

```markdown
- **AC1:** The canonical Lifecycle defines all five stages, stable step keys, entry and completion conditions, actors, evidence, and permitted transitions.
```

With:

```markdown
- **AC1:** The canonical Lifecycle defines all five stages, stable step keys, entry and completion conditions, actors, evidence, approval gates, and permitted transitions.
```

E8. Replace delivery item 3:

```markdown
3. **First live trial, #63:** outstanding. A fresh agent in its own workspace takes the Docs classification issue through the Lifecycle, starting at Define while it remains unready. Before execution, establish the trial's evidence and completion boundary. Keep #63's classification decisions distinct from workflow observations.
```

With:

```markdown
3. **First live trial, #63:** delivered in [PR #75], merged as `33cc5d0`; its Retro filed [#76]. The session did not establish a separate explicit trial evidence and completion boundary before execution, so [Trial observations from #63](#trial-observations-from-63) records observations rather than measuring them against an agreed boundary. #63's classification decision stays with #63 and PR #75.
```

E9. Replace delivery item 5:

```markdown
5. **Final refinement, #15:** bring observations and Retro outcomes from both planned trials back to the #15 Coordinator, together with #66 findings. The Maintainer decides follow-ups; revise again as needed before finalizing #15 and its in-scope work. #15's own Retro follows its revision and Publish stages.
```

With:

```markdown
5. **Final refinement, #15:** #63's observations returned through #76. Bring #45's observations and Retro outcomes back to the #15 Coordinator, together with #66 findings. The Maintainer decides follow-ups, including whether #63 met AC6 without an agreed boundary; revise again as needed before finalizing #15 and its in-scope work. #15's own Retro follows its revision and Publish stages.
```

E10. Replace the paragraph after the delivery list:

```markdown
No #63 plan or trial was produced in #66. Neither planned trial is complete, and no trial of Content, Fix, or Feature work is claimed.
```

With:

```markdown
No #63 plan or trial was produced in #66. The #45 trial is not complete, and no trial of Content, Fix, or Feature work is claimed.
```

Keep the rest of that paragraph unchanged.

E11. Insert this subsection after that paragraph, before "## Approval lineage and boundaries":

```markdown
### Trial observations from #63

These workflow observations from the #63 session are separate from its classification decision. [#76] holds the evidence and the Maintainer's dispositions.

| Observation                                                                                                                                               | Disposition in #76                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| The Maintainer expected to approve the plan before implementation, but Plan could close without that approval.                                            | The Lifecycle's `plan-approval` step and `approvals` rule.                                                                |
| The Coordinator's check was deleted after the Planner's first completion report, while the Maintainer and Planner kept talking.                           | [Check on delegated work](../agents/roles/coordinator.md#check-on-delegated-work).                                        |
| The Coordinator repeated proposals already in the Planner session.                                                                                        | A short notice naming the action and session, in the [Coordinator's hand back](../agents/roles/coordinator.md#hand-back). |
| The interview began without the skill offer, and the unavailable `triage` skill wasn't surfaced.                                                          | A visible 🧭 offer before any interview, in [Choose a route](../agents/roles/planner.md#choose-a-route).                  |
| The plan expected four changed files and missed the untracked plan; Architect recommendation R1 corrected it before implementation, and no file was lost. | Separate scope groups in the [plans guide](../plans/README.md).                                                           |
```

Format the table with Prettier.

E12. In "Approval lineage and boundaries", add after the "Cycle 7, 2026-10-28" bullet:

```markdown
- **#76, 2026-10-30:** apply #63's retrospective findings: a separate Maintainer plan approval, oversight that outlasts a finished turn, short notices for actions in another session, a visible skill offer, and separate scope checks for Task Artifacts. Requirements approved at body SHA-256 `f0ebc04f2245e228b35fdc00e1889c6622e95f4eaec1a3b7e6bc2eb70be2b9cd`.
```

E13. Add these link references in alphabetical position among the existing ones:

```markdown
[#76]: https://github.com/joebaz/web-starter/issues/76
[PR #75]: https://github.com/joebaz/web-starter/pull/75
```

## Operations

### 1. Apply the approved wording

- Owner: Coder
- Files and actions: apply changes A1–A9, B1–B3, C1–C2, D1–D2, and E1–E13 exactly as written, to the five implementation files in [Scope](#scope). Leave `docs/execution-checkpoint.md` unchanged. Run `npx prettier --write` on the changed files to format the tables.
- Do not start before: the Maintainer approves this plan's final revision, Plan closes, and the Coordinator assigns the Coder. At briefing, evaluate the existing outline requirement for each affected document and obtain short-outline approval before expanding any new or substantially revised document.
- Output and handoff: an uncommitted diff of the five implementation files, handed to the Coordinator alongside this plan, which stays an untracked Task Artifact.
- Check: compare each changed passage with this plan, expecting a word-for-word match apart from Prettier's table alignment, and no other changes. If `evidence.plan` cannot clearly hold the approval, stop and report; don't edit the checkpoint reference.

### 2. Validate the change

- Owner: Coder
- Files and actions: none
- Do not start before: operation 1.
- Output and handoff: validation results and walkthrough results in chat to the Coordinator, as [qa.md](../qa.md#report-results) describes.
- Check:
  - `npm run format:check` and `git diff --check`, expecting a pass.
  - `node -e 'const y=require("yaml");const d=y.parse(require("fs").readFileSync("docs/lifecycle.yaml","utf8"));const k=new Set(d.stages.flatMap(s=>s.steps.map(t=>t.key)));const bad=d.stages.flatMap(s=>[s.exit,...s.steps.flatMap(t=>(t.transitions||[]).map(x=>x.to))]).filter(x=>!k.has(x));if(bad.length)throw bad;console.log("ok",k.size)'`, expecting `ok 29`: the YAML parses, and every exit and transition names an existing step.
  - `grep -n "no further approval\|every 15 minutes" docs/lifecycle.yaml docs/agents/roles/*.md`, expecting only the unchanged `rules.requirements` line and the one in Check on delegated work.
  - Check every changed link and anchor, including `coordinator.md#check-on-delegated-work`, `coordinator.md#hand-back`, `planner.md#choose-a-route`, and `#trial-observations-from-63`, expecting each to resolve.
  - Read the five files together, expecting the Lifecycle to hold each gate and the others to point to it without restating it.
  - Recheck walkthroughs 1–6 against the implemented text, expecting each to follow without guessing.
  - Scope: run `git diff`, `git status --short --untracked-files=all`, `git diff --no-index -- /dev/null docs/plans/76-lifecycle-retrospective.md` (exit 1 means the file was shown), `npx prettier --check docs/plans/76-lifecycle-retrospective.md`, and `git check-ignore .agent-state/76.yaml`. Expect the five implementation files, this plan as a Task Artifact, and the ignored checkpoint as a local record. Explain any other path.

## Parallel read-only work

- None needed.

## Final validation and hand back

- Scope: implementation files `docs/lifecycle.yaml`, `docs/agents/roles/coordinator.md`, `docs/agents/roles/planner.md`, `docs/plans/README.md`, `docs/specs/15-lifecycle.md`; Task Artifacts `docs/plans/76-lifecycle-retrospective.md`; local records `.agent-state/76.yaml`.
- Checks: the operation 2 checks on the final revision, an independent Reviewer pass against the issue and this plan, the Maintainer's sign-off, and the Architect's assessment of the signed-off commit, as the [Lifecycle](../lifecycle.yaml) requires. No website behavior changes or runtime tests.
- Hand back: the diff, validation and walkthrough results, and review outcome to the Coordinator, who reports to the Maintainer.

## Requirements

- Approved requirements: [#76](https://github.com/joebaz/web-starter/issues/76) issue body, edit of 2026-10-30T02:12:41Z, SHA-256 `f0ebc04f2245e228b35fdc00e1889c6622e95f4eaec1a3b7e6bc2eb70be2b9cd` of the `gh issue view 76 --json body --jq .body` output, including its trailing newline. The Maintainer approved it, with the four "Requirements clarifications", on 2026-10-30 at 11:12 JST in the Planner session (option 1).
- Acceptance criteria: the issue's "Scope and completion criteria" 1–7, "Validation", and "Requirements clarifications".

## Maintainer feedback and decisions

- Approve the requirements with the four clarifications ([#76](https://github.com/joebaz/web-starter/issues/76), Planner session, 2026-10-30 11:12 JST): adopted. The wording lives in this plan, the walkthroughs are review evidence, and the scope is the listed files.
- An explicit final plan approval for this issue, after the Architect's assessment and recommendation decisions (Coordinator briefing, 2026-10-30): pending.
- Make the walkthroughs concrete and concise, and make the plan easier to read on a phone (Maintainer feedback in the Coordinator session, relayed in message `459c80dc-a84c-4818-84eb-332db2bae7ad`): adopted. The Maintainer said, “I don’t understand the walkthroughs. Blob this, X Y Z that.” Added a reading guide, moved the examples first, removed technical shorthand from them, and grouped the file list. The exact proposed operational wording is unchanged. Full copy review is deferred until the Maintainer returns to a computer; this request is not plan approval or authorization to implement or commit.

## Architect recommendations

- Source: Architect `deb0b71f-eb9f-4285-947d-e469afa922e8`, assessment message `24f409c9-b3f8-4208-8ab3-2a085f5be2ff`, covering plan blob `4f8a192c451040da6e4e1194a780a91d810a4668` at baseline `33cc5d0`, SHA-256 `bb36b033f63ad5d5880b94a823e1e294bcdd82a50740d98306867db6534769fe`. Coordinator authorized adoption of all three in-scope recommendations in briefing message `1728ead8-b712-4d4d-9b86-b094af6e4704`.
- **R1 — Preserve conditional outline approval:** adopted in Scope and operation 1. Evaluate affected documents at Coder briefing and obtain short-outline approval before expanding a new or substantially revised document; plan approval and exact wording do not waive the existing requirement. No extra SOP changes.
- **R2 — Match assessment, revision identity, and return paths:** adopted in A2, A5, and walkthroughs 1–2. Every pre-close material revision returns through delta assessment since the last assessed revision, decisions, and final-blob approval. Recording an already approved disposition alone does not loop. Post-close changes pause dependent work for renewed plan approval and follow normal cycles, review, sign-off, and final Architect assessment without an additional preimplementation Architect gate.
- **R3 — Keep approval validity in one authority:** adopted in C2. Hand backs name the plan revision and defer validity and evidence to the Lifecycle's `rules.approvals`, including nonmaterial carry-forward.
- The readability revision awaits any renewed Architect assessment arranged by the Coordinator and final Maintainer approval after full review. These recorded decisions do not authorize implementation.
