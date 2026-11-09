# Issue lifecycle design record

> **Status:** Reconciliation draft for [#15], following the implementation of [#66] in [PR #71] and the Docs trial on [#63], delivered in [PR #75]. The common Lifecycle is operational for all issue types. [#76] applied #63's retrospective findings. The trial on Feature issue [#45] remains outstanding; this is not #15's final revision.

## Problem and goal

The original design addressed three gaps:

- **Review boundaries blurred.** In [#38], the Coordinator treated the Reviewer's acceptance as completion before the Maintainer's final sign-off and final Architect assessment.
- **Requirements lacked an approval route.** The coding standards required agents to flag missing decisions and scope changes, but did not establish how those discussions became approved requirements.
- **Oversight was implicit.** The Coordinator needed to compare ongoing work with the approved requirements and plan.

The goal is one Lifecycle that makes an issue's current stage, next action, approval boundaries, and completion evidence clear. It applies to Content, Docs, Fix, and Feature issues. Docs is the first trial, not a restriction on applicability; validation remains specific to the change type and affected capabilities.

The learning loop is deliberate: design in #15, implement and learn in #66, return those findings to #15, trial the reconciled design on Docs #63 and then Feature #45, and return both trials' observations and Retro outcomes for further revision. #15 stays open until both planned trials and the agreed refinements reach their completion boundaries. Selecting #45 does not establish its readiness or authorize implementation. A common definition does not establish that every issue type has been trialled.

## Scope and authority

The [Lifecycle](../lifecycle.yaml) is the authoritative operational sequence. This #15 spec is its design record. Each trial issue's own approved issue/spec artifact defines that issue's substantive work; this design record does not replace it or the live Lifecycle.

The Maintainer-approved cycle-6 amendment in [#66] supersedes #15's original Docs-only direction. One common Lifecycle applies to all issue types, with Docs as the first live trial; later type-specific variations require concrete evidence and Maintainer approval.

| Source                                                                                                                | Owns                                                                                                           |
| --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [Lifecycle](../lifecycle.yaml)                                                                                        | Stages, actors, actions, handoffs, transitions, approval gates, evidence conditions, loops, and update timing. |
| [Role SOPs](../../AGENTS.md#roles)                                                                                    | Each role's responsibilities, authority, inputs, methods, outputs, and quality.                                |
| [Issue tracker guide](../agents/issue-tracker.md)                                                                     | Requirements, spec, and plan locations and links.                                                              |
| [Execution checkpoint reference](../execution-checkpoint.md)                                                          | Local record fields, values, and revision notation.                                                            |
| [Plans guide](../plans/README.md)                                                                                     | Markdown implementation-plan format and concrete operations.                                                   |
| [Glossary](../../GLOSSARY.md)                                                                                         | Shared meanings, including roles, Vertical Slice, Layer, Lifecycle, Agent Brief, and Task Artifact.            |
| [CONTRIBUTING.md](../../CONTRIBUTING.md), [coding standards](../../coding-standards.md), and [QA reference](../qa.md) | Contribution mechanics, implementation conventions, and applicable validation.                                 |

### One approved requirements contract

Each issue has one Maintainer-approved requirements contract containing scope, acceptance criteria, exclusions, and validation. It can be the issue's requirements, a linked specification issue, or a linked repository spec. Record the artifact, the revision of its approved content, and the Maintainer's approval. A tracker revision is its edit snapshot or a digest of the approved content; a bare URL or last-update time is insufficient. A repository spec revision is a commit or blob.

For each trial, that issue's approved issue/spec artifact is its substantive requirements contract. Examples and assumptions in #15 do not become another contract for the trial. A trial issue cannot silently override canonical Lifecycle rules; surface any conflict for Maintainer decision.

An Agent Brief summarizes and links the contract. A plan, skill-applied label, checkpoint, status readout, agent finding, or recommendation is neither an alternative contract nor approval. An already-approved, ready issue needs no repeat interview, second spec, or repeat approval. Requirements changes follow the [Coordinator's changed-requirements protocol](../agents/roles/coordinator.md#when-approved-requirements-change).

Create Task Artifacts only when needed. This design record uses the Maintainer-selected `docs/specs/15-lifecycle.md`; other repository specs follow `docs/specs/<issue>-<slug>.md`, and plans use `docs/plans/<issue>-<slug>.md`, linked from the issue. Do not create an issue merely to hold a plan or a copy of a spec. Agent instructions and required project references remain in the repository; the Wiki is the Maintainer's human reference, not an operational dependency.

## Design decisions

### Roles and planning

The Coordinator coordinates: it establishes state, briefs agents, oversees alignment with approved requirements and the plan, and reports against the issue's acceptance criteria. The [Planner](../agents/roles/planner.md) triages, captures intent, interviews the Maintainer, and plans implementation for every issue type. The Planner may edit only the issue's linked spec and plan. There is one editor at a time; read-only assignments can run alongside editing.

A plan is an ordered list of concrete operations, scaled to the issue. Each operation names its owner, affected files and actions, prerequisites, output and handoff, and expected validation evidence. The plan identifies dependencies and parallel read-only work, links requirements rather than copying them, and records sourced Maintainer feedback and Architect recommendation dispositions. After the Architect's assessment and a decision on every recommendation, the Maintainer approves the final plan revision, and the Coder works only from an approved revision. Requirements approval, plan approval, and final sign-off are separate decisions; the Lifecycle's `approvals` rule defines which plan revisions need a new approval. A Planner hand back ends its assignment, not the Plan stage's remaining obligations.

One Issue or Sub-Issue is one [Vertical Slice](../../GLOSSARY.md#planning), delivered through every Layer it needs. A Layer is a responsibility boundary serving many outcomes. Propose Sub-Issues when there are multiple independently demoable or reviewable outcomes. Plan operations are pieces within an issue; they are not additional Vertical Slices or Lifecycle steps. Completion follows the issue's acceptance criteria, without a separate Milestone planning or reporting requirement.

The [Architect](../agents/roles/architect.md) assesses plans and signed-off commits against the approved intent of the Template or Project, prior decisions, existing System Design or architecture documents, and future adaptability. Code health, boundaries, simplicity, duplication, maintainability, testability, and debt remain part of that assessment. The role is read-only and advisory; its purpose is not tied to a hard-coded website use case, and its advice does not authorize scope changes.

The [Coder](../agents/roles/coder.md) implements assigned work within its scope and authorized cycle, validates it, and records assignment, changes, results, and evidence. The separate [Reviewer](../agents/roles/reviewer.md) checks correctness independently and recommends acceptance or changes. For documentation, both roles check clarity, supported assumptions, consistent terminology, language, and writing style, and surface unresolved questions.

### Planning routes and skills

The [Planner's scenario routes](../agents/roles/planner.md#choose-a-route) fit the unresolved work: approved atomic requirements go straight to planning; a small unresolved request may need triage and an interview; settled multi-session or multi-outcome work may need a spec and approved decomposition; a large uncertain effort may need a wayfinding decision map. No route or universal skill chain is mandatory.

Under local policy the Maintainer starts the five entry skills: `triage`, `grilling`, `to-spec`, `to-tickets`, and `wayfinder`. Before any requirements interview, the Planner offers the relevant skill on a visible line marked 🧭, with its expected output and how to start it or continue without it, and names any unavailable skill and an available alternative. Once an entry skill starts, its required nested calls run within repository role, file-editing, and approval limits. Skill outputs retain their actual purposes: a tracker spec or dependency-linked tickets do not replace the repository implementation plan, and a generated brief or ready label does not approve requirements. No new skills or changes to installed skills are part of this design.

### Local state, recovery, and progress

The checkpoint is a small, Git-ignored worktree-local record at `.agent-state/<issue>.yaml`, retained until the Maintainer archives the worktree. It points to evidence instead of copying reports: stage and step status, next action, revision, waits and errors, partial-output locations, cycle and approval pointers, sign-off, and outstanding obligations. The [reference](../execution-checkpoint.md) defines the format; the [Coordinator SOP](../agents/roles/coordinator.md#keep-the-execution-checkpoint) defines setup and recovery.

The Lifecycle requires updates when a step starts, waits, fails, or completes; at every transition; and when decisions, handoffs, or recorded fields change. Dispatching an agent or invoking a skill establishes neither completion nor success. Observed results, evidence, and completion conditions determine the next transition. Running work, unresolved errors, and kept partial outputs remain visible.

A replacement Coordinator reconciles the checkpoint with primary evidence before advancing. If it is lost, reconstruct state from the issue, linked specs and plans, Git, handoffs, reviews, approvals, PR, and CI. Preserve identified edits and commits on resumed work. Confirm recorded sign-off, cycle authorizations, extensions, and waivers against their original evidence. Unknown count is not zero; unknown approval is not granted. Only affected uncertain or unsafe work waits.

The checkpoint is a convenience record that can be lost with the workspace. It is not stored under `/tmp`, synchronized remotely, uploaded at completion, or used as an additional approval or archive gate. PR and CI evidence stays in GitHub; detailed reports stay in chat under the QA reference.

The Coordinator refreshes its native task list on each stage entry or re-entry to show only that stage's applicable steps, and updates task statuses at transitions. Re-entry preserves cycle counts, approvals, and established step state. Each response to the Maintainer starts with a one-line readout from reconciled state, such as `Stage: Implement 3 of 7 done`, or `Stage: reconciling` until state is established. A completed stage task list does not complete the Lifecycle.

The [Coordinator](../agents/roles/coordinator.md#check-on-delegated-work) checks on delegated agents every 15 minutes while their work or a Maintainer decision about it is open, including direct conversations between the Maintainer and another agent. A finished turn or completion report doesn't end those checks. When the Maintainer must act in another agent's session, the Coordinator sends a short notice naming the action and session instead of repeating that session's content.

## Five-stage overview

Stages run in order: Define, Plan, Implement, Publish, Retro. Closing a stage opens the next; closing Retro at `retro-close` completes the Lifecycle. Resumed work continues at its reconciled step. The YAML's stable semantic step keys, completion conditions, transitions, and method links govern the sequence and gates summarized below.

### Define: approve requirements and establish readiness

The Coordinator establishes the issue's real state and readiness. Unready or `needs-triage` work goes to the Planner for clarification and the Maintainer's review of the identified requirements revision. Already-approved, ready work goes directly to readiness confirmation.

Define closes with approved requirements ready to plan and the issue's GitHub Project status changed to In progress. The [Project status method](../agents/roles/coordinator.md#change-github-project-status) discovers the intended repository-linked Project and Status mapping, verifies the change, or reports ambiguity or the actual access error. Empty issue membership alone does not prove no Project applies. Plan needs no further entry approval.

### Plan: decide concrete work and resolve recommendations

The Coordinator briefs the Planner, who writes the implementation plan. The Architect assesses that plan revision. The Planner incorporates in-scope recommendations and refers scope decisions through the Coordinator to the Maintainer. Plan closes only after every recommendation has a disposition, authorized feedback is reflected in the plan, no scope decision remains pending, and the Maintainer approves the final plan revision.

### Implement: validate and review the current revision

Each cycle is one round of changes followed by independent review of the whole changed issue revision, including earlier cycles, or an eligible recorded review exception. Every cycle needs Maintainer authorization: starting the Coordinator authorizes the first, after the go-ahead for a `needs-triage` issue; later cycles need a Maintainer request for changes or authorized fix. There is a five-cycle cap; a sixth or later needs an explicit extension. Returning from Implement or Publish never resets the count.

The Coordinator briefs the Coder as sole editor on the approved plan revision. For a new or substantially revised document, the Coder sends a short outline through the Coordinator for Maintainer approval before expanding it. The Coder implements and validates the assigned work against the plan and repository checks. Validation does not replace independent review.

A separate Reviewer may be omitted only with the Maintainer's explicit waiver for an isolated one- or two-line whole logical unreviewed change. Splitting a larger change into hunks does not qualify. Record the exact revision and waiver in chat and the checkpoint, re-evaluate eligibility after any revision, and count the waived round as a cycle. An assignment is not a waiver. The exception retains validation, cycle authorization and limits, final Maintainer sign-off, final Architect assessment, and matching evidence; record it as an exception, not a Reviewer pass.

Reviewer findings go to the Maintainer and wait for the go-ahead before another cycle. The Maintainer then reviews diffs, comments, and commits, either requesting changes or giving final sign-off naming the commit. The Architect subsequently assesses that signed-off commit. Authorized changes return through Implement; advisory recommendations alone authorize nothing. Implement closes only when validation, review or eligible waiver, final sign-off, and final Architect assessment match the current revision, with no authorized changes remaining.

### Publish: merge the signed-off revision

Only the Maintainer commits, pushes, or merges. Publish starts with the Maintainer pushing the signed-off commit; the Coordinator opens or reuses the issue's PR, and GitHub runs CI and deletes the remote branch after merge. A transient CI failure can be retried on the same commit. Any required file change needs authorization and a return through Implement, including its closing evidence check, before updating the same PR.

Passing CI does not overcome pending PR feedback or a pushed revision differing from the signed-off commit. The Coordinator reports blockers and waits for Maintainer direction. Publish closes after the correct revision is merged, the remote branch is deleted, and the Maintainer confirms the merge. Follow [CONTRIBUTING.md](../../CONTRIBUTING.md#open-a-pull-request): use `Closes` for an issue completed by the merge and `Refs` when it stays open, as #15 does while awaiting trial findings.

### Retro: decide drafts and close remaining obligations

Retro drafting is optional until session capture exists. Only the Maintainer starts or restarts `/retro` (`mattpocock-skills:retro`), or chooses to skip. Invocation or a running, failed, or partial run does not establish a completed Retro. The Coordinator records errors and kept partial drafts and waits for direction; it never silently restarts the skill or treats failure as zero candidates.

Completed candidate drafts proceed to Maintainer decisions. Kept partial drafts can proceed only under explicit Maintainer direction, with the failed run still recorded as failed. The Coordinator revises commented drafts, files each approved draft exactly as approved, and drops declined drafts. Closure without draft decisions requires either a recorded skip before any drafts, including kept partial drafts, exist, or a completed zero-candidate run with no kept drafts.

A skip does not discard outstanding obligations. Once all drafts are filed or dropped, or an eligible no-draft outcome is recorded, and all other obligations are met, `retro-close` completes the Lifecycle and hands back to the Maintainer with the archive notice. There is no post-completion checkpoint-upload step or receipt condition.

## Acceptance, evidence, and remaining trials

These criteria retain the original implementation-and-trial distinction while reflecting approved amendments:

- **AC1:** The canonical Lifecycle defines all five stages, stable step keys, entry and completion conditions, actors, evidence, approval gates, and permitted transitions.
- **AC2:** The directly affected role SOPs, references, glossary, contributor guidance, and PR template follow the ownership and artifact boundaries above.
- **AC3:** The Lifecycle is the authoritative operational sequence for all issue types; this spec is its design record, with Docs as the first live trial.
- **AC4:** Native tasks and readouts reflect the reconciled active stage, including waits and re-entry, and stay distinct from whole-Lifecycle completion.
- **AC5:** Independent acceptance alone cannot complete Implement. Current-revision validation, review or eligible waiver, final Maintainer sign-off, and subsequent Architect assessment are required.
- **AC6:** The planned Docs #63 trial and intended second live trial on Feature #45 run through Publish and Retro under their own approved requirements. Both return observations and outcomes to #15 for Maintainer decisions on follow-ups before final revision and closure.
- **AC7:** The checks in [Validate your change](../../CONTRIBUTING.md#validate-your-change) pass for the changed files, alongside review for accuracy, clarity, links, and scope.

### Delivery evidence and remaining work

1. **Implementation, #66:** [PR #71] merged as `d2cbd09`. Its validation report records full local checks repeated independently, whole-issue review, and final sign-off and Architect assessment for `4a4b60a`. Documentary walkthroughs and task-tracking wording establish implementation evidence, not a live trial.
2. **Current reconciliation, #15:** reconcile the frozen design with approved #66 amendments and merged sources. Validate these documentation changes with `npm run format:check`, `git diff --check`, diff/scope review, and link checks. They remain subject to independent review and Maintainer acceptance.
3. **First live trial, #63:** delivered in [PR #75], merged as `33cc5d0`; its Retro filed [#76]. The session did not establish a separate explicit trial evidence and completion boundary before execution, so [Trial observations from #63](#trial-observations-from-63) records observations rather than measuring them against an agreed boundary. #63's classification decision stays with #63 and PR #75.
4. **Intended second live trial, #45:** the Maintainer selected this open Feature issue as the next trial candidate after Docs #63. This selection establishes neither readiness nor implementation authorization. Establish #45's own investigation, proposal, and approval, and its trial execution, evidence, and completion boundaries, within its workflow before running it.
5. **Final refinement, #15:** #63's observations returned through #76. Bring #45's observations and Retro outcomes back to the #15 Coordinator, together with #66 findings. The Maintainer decides follow-ups, including whether #63 met AC6 without an agreed boundary; revise again as needed before finalizing #15 and its in-scope work. #15's own Retro follows its revision and Publish stages.

No #63 plan or trial was produced in #66. The #45 trial is not complete, and no trial of Content, Fix, or Feature work is claimed. Content and Fix trials are not required by this planned sequence; the two selected trials will not prove all issue types. Future variations need concrete evidence and Maintainer approval.

### Trial observations from #63

These workflow observations from the #63 session are separate from its classification decision. [#76] holds the evidence and the Maintainer's dispositions.

| Observation                                                                                                                                               | Disposition in #76                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| The Maintainer expected to approve the plan before implementation, but Plan could close without that approval.                                            | The Lifecycle's `plan-approval` step and `approvals` rule.                                                                |
| The Coordinator's check was deleted after the Planner's first completion report, while the Maintainer and Planner kept talking.                           | [Check on delegated work](../agents/roles/coordinator.md#check-on-delegated-work).                                        |
| The Coordinator repeated proposals already in the Planner session.                                                                                        | A short notice naming the action and session, in the [Coordinator's hand back](../agents/roles/coordinator.md#hand-back). |
| The interview began without the skill offer, and the unavailable `triage` skill wasn't surfaced.                                                          | A visible 🧭 offer before any interview, in [Choose a route](../agents/roles/planner.md#choose-a-route).                  |
| The plan expected four changed files and missed the untracked plan; Architect recommendation R1 corrected it before implementation, and no file was lost. | Separate scope groups in the [plans guide](../plans/README.md).                                                           |

## Approval lineage and boundaries

The [original approved spec][baseline-spec] at `9672858` ([PR #68]) deliberately stayed unchanged throughout #66. The [#66 issue body][#66] records subsequent Maintainer approvals; later approved amendments supersede conflicting earlier choices. Merged files establish implementation evidence, not approval by themselves.

- **Triage and 2026-10-26 review amendments:** use “coordinates”, preserve role meanings, make `/retro` Maintainer-started, add explicit tiny-change waivers and Project discovery, and strengthen reusable Architect and documentation guidance.
- **Cycle 3, 2026-10-27:** authorize the collected review feedback and [Vertical Slice/Layer agreement][terms], make Planner ownership universal, remove Milestone, and adopt the previously proposed [optional Retro drafting][retro-proposal]. The comments were proposals or wording agreements when first posted; this later authorization permitted implementation.
- **Cycles 5–6, 2026-10-28:** clarify requirements revision/approval, recovery and evidence-based progress, plans for all types, practical operations and skill routes; make the common Lifecycle apply to all types. Checkpoint synchronization through one issue comment was an approved intermediate choice.
- **Cycle 7, 2026-10-28:** replace remote checkpoint synchronization and final upload with the small local-only record, retain the repository specs/plans, and simplify document ownership and scenario guidance. This supersedes the original `/tmp` and upload design and the intermediate remote-sync rules.
- **#76, 2026-10-30:** apply #63's retrospective findings: a separate Maintainer plan approval, oversight that outlasts a finished turn, short notices for actions in another session, a visible skill offer, and separate scope checks for Task Artifacts. Requirements approved at body SHA-256 `f0ebc04f2245e228b35fdc00e1889c6622e95f4eaec1a3b7e6bc2eb70be2b9cd`.

During #66 Retro, the suggestion to correct requirements drift was withdrawn. The lesson about preserving agreed intent is input to the existing #15 reconciliation only; no standalone issue or SOP wording was approved. The agent-discovery guidance proposal was declined, and whether #66 should have been split remains undecided. These outcomes do not add requirements or authorize new issues.

Out of scope remain new skills, runtime consumers, validators, hooks, workflow engines, enforcement automation, separate audit infrastructure, a central reference catalogue, and automatic conversion of Wiki checklists into workflows. No diagram or Wiki publication is required to operate the Lifecycle. [#48] enforcement and [#65] progress evaluation are separate. [#69] weekly Retro and [#70] session capture are future, unimplemented work, not prerequisites already delivered by optional drafting. Reporting decisions in [#35] and classification decisions in #63 remain with their respective issues.

[#15]: https://github.com/joebaz/web-starter/issues/15
[#35]: https://github.com/joebaz/web-starter/issues/35
[#38]: https://github.com/joebaz/web-starter/issues/38
[#45]: https://github.com/joebaz/web-starter/issues/45
[#48]: https://github.com/joebaz/web-starter/issues/48
[#63]: https://github.com/joebaz/web-starter/issues/63
[#65]: https://github.com/joebaz/web-starter/issues/65
[#66]: https://github.com/joebaz/web-starter/issues/66
[#69]: https://github.com/joebaz/web-starter/issues/69
[#70]: https://github.com/joebaz/web-starter/issues/70
[#76]: https://github.com/joebaz/web-starter/issues/76
[PR #68]: https://github.com/joebaz/web-starter/pull/68
[PR #71]: https://github.com/joebaz/web-starter/pull/71
[PR #75]: https://github.com/joebaz/web-starter/pull/75
[baseline-spec]: https://github.com/joebaz/web-starter/blob/9672858452a24e50462b3f3d2ada2c4c31d0d2ee/docs/specs/15-docs-lifecycle.md
[terms]: https://github.com/joebaz/web-starter/issues/66#issuecomment-6418534064
[retro-proposal]: https://github.com/joebaz/web-starter/issues/66#issuecomment-6419511814
