# Standardize Lifecycle progress readouts with checkboxes and status emojis: implementation plan

Issue: #79

## Requirements

- Approved requirements: [#79's body](https://github.com/joebaz/web-starter/issues/79), revision `sha256:cf6fe848ffca5e7d30c36a6e68ec42dd24f72be020293b913a70d40cc0cd989d` (edited 2026-11-02T10:37Z). The Maintainer approved it in the Coordinator chat at 2026-11-02T19:38+09:00.
- Acceptance criteria: stories 1–10, the Implementation decisions, and the five Acceptance criteria in that body.
- Baseline: `origin/main` at `b5dd987`.

## Operations

### 1. Define the Progress Readout in the Lifecycle

- Owner: Coder
- Files and actions: `docs/lifecycle.yaml`:
  - In `authority`, add the Progress Readout to what the file owns.
  - In `rules.authorization`, change "readouts" to "Progress Readouts".
  - In `rules.tracking`, replace "Start every response to the Maintainer with the one-line readout." with a pointer to the new `progress_readout` section. Keep the other three bullets.
  - Add a top-level `progress_readout` section after `checkpoint`. It is the only place that defines the readout, and it holds:
    - **When (story 1):** the Coordinator starts every message to the Maintainer that reports a change with the full readout. A message with no change has none. There is no short form.
    - **Source (story 5):** the readout is built from the execution checkpoint alone: `steps` gives the markers, and `waits`, `errors`, and `next` give the current step's note. The native task list mirrors the same record, mapping `completed` to completed, the current step to in progress, and `pending` to pending. With no task tool, the readout is the list.
    - **Format (stories 2, 6, 7, 9):**
      - The first line is `Stage: <stage name>`, with no count and no emoji.
      - Each applicable step of the current stage follows, in Lifecycle order, by step key.
      - `[x]` marks a step completed with recorded evidence, and `[ ]` marks a pending step.
      - The current step shows its status emoji in place of its checkbox, then a short note. The note names the exact action and gate when the Maintainer must act (story 4), and otherwise what is happening.
      - A step is conditional when some route from the stage's entry to its exit skips it. List a conditional step, and the steps its branch then runs in order, only once the transition into it is taken. In the current Lifecycle these are Define's `planner-handoff`, `requirements-interview`, and `requirements-review`; Plan's `scope-decision`; Implement's `independent-review`; Publish's `ci-diagnosis`; and Retro's `retro-draft-decisions`. This list is for checking only; the definition states the rule, not the list. After a return to an earlier step, the steps that must run again show `[ ]`.
      - Until the state is established, the readout is `Stage: reconciling` with no list. It never reports a stage or step that isn't confirmed.
    - **Status (story 3):** the four emojis, each with its meaning and the checkpoint state it maps from, judged by what the step waits on:
      - 🛑: error or failure, with the error and the action needed; `failed`
      - ⏸️: usage-limit pause, naming the agent and the reset time or saying it's unknown; `waiting` on a usage limit
      - 🟡: needs the Maintainer's attention; `waiting` on the Maintainer
      - 🟢: work moving forward; `started`, or `waiting` on an agent or CI

      A status emoji isn't completion.

    - **Examples:** a link to the Coordinator SOP's examples from operation 3. The YAML holds no examples.
  - The section key is `progress_readout`. Other wording and key names are the Coder's choice. Change no stage, step, transition, or gate.
- Do not start before: plan approval.
- Output and handoff: an uncommitted diff, handed to the Coordinator.
- Check: the section defines the format and the emojis without examples. Operation 5's `npm run format:check` parses the YAML.

### 2. Record step status in the execution checkpoint

- Owner: Coder
- Files and actions: `docs/execution-checkpoint.md`:
  - In Fields, replace `stage`, `step`, and `status` with:
    - `stage` and `step`: the current stage and step key
    - `steps`: the current stage's applicable steps in Lifecycle order, each with its status: `pending`, `started`, `waiting`, `failed`, or `completed`. A conditional step is added once its transition is taken. After a return, the steps that must run again go back to `pending`.
  - This keeps each step's status in one place and drops the separate `status` field. The current step's entry in `steps` holds its status.
  - Update the Example to match. In the fictional Implement record, `independent-review` is `waiting`, with earlier steps `completed` and later ones `pending`.
  - Add one sentence saying the Progress Readout and the native task list are built from the checkpoint, linking the Lifecycle's Progress Readout. Don't restate the format.
- Do not start before: operation 1, so the field and the Lifecycle use the same terms.
- Output and handoff: the same uncommitted diff.
- Check: the example's step keys and order match the Implement stage in `docs/lifecycle.yaml`, and its YAML block parses.

### 3. Point the Coordinator SOP to the definition

- Owner: Coder
- Files and actions: `docs/agents/roles/coordinator.md`:
  - **Start:** say "Progress Readout" for "readout".
  - **Check on delegated work:** keep "Message the maintainer only when something changes", followed by a pointer to the Progress Readout in the Lifecycle. Remove the leading-emoji sentence and its four meanings.
  - **Track the stage:**
    - The intro names both the `tracking` rule and the Progress Readout.
    - Keep the task-tool bullet, but build the list from the checkpoint's `steps`. Replace the "keep the list in your messages" fallback with the Lifecycle's.
    - Remove the bullet "Show only the current stage's applicable steps…" and the readout bullet that ends the section (`Stage: Implement 3 of 7 done`, `Stage: reconciling`). Both now live in the Lifecycle.
    - Keep the stage-entry, recovery, re-entry, and finished-stage bullets.
    - **Examples (story 10):** add five short Markdown examples, because the Coordinator produces the output. Each is a full readout whose markers agree with its stage's steps in the Lifecycle. They show the definition and don't restate it. A single line before them links the Lifecycle's Progress Readout for the format and emoji meanings:
      - active work: Define, with 🟢 on `requirements-interview`
      - an approval wait: Define, with 🟡 on `requirements-review`
      - a failure: Retro, with 🛑 on `retro-drafts` after a failed `/retro` run and `retro-close` as `[ ]`
      - a usage-limit pause: Plan, with ⏸️ on `implementation-plan`
      - recovery or takeover: `Stage: reconciling` alone
  - Keep every heading, so the existing anchors still work.
- Do not start before: operation 1.
- Output and handoff: the same uncommitted diff.
- Check: `rg -n "of [0-9]+ done" docs/agents AGENTS.md`, expecting no matches. In `docs/agents` and `AGENTS.md`, the emojis appear only on example steps in `coordinator.md`, with no meanings attached. Each example matches its stage's steps in `docs/lifecycle.yaml`.

### 4. Add the glossary entry

- Owner: Coder
- Files and actions: `GLOSSARY.md`, under _Workflow_, directly after **Lifecycle**: the exact text approved in #79:

  ```markdown
  **Progress Readout**:
  A brief, in-conversation summary of where an issue stands in its Lifecycle stage, so the Maintainer can see what is done, what is happening, and whether they need to act.
  _Avoid_: readout (alone), status report
  ```

- Do not start before: plan approval.
- Output and handoff: the same uncommitted diff.
- Check: the entry matches the issue's text exactly.

### 5. Validate

- Owner: Coder, then an independent Reviewer
- Files and actions: none
- Do not start before: operations 1–4.
- Output and handoff: results in chat to the Coordinator, as [qa.md](../qa.md#report-results) describes.
- Check:
  - `npm run format:check`, expecting a pass, as CONTRIBUTING requires for `docs`.
  - `git diff --check`, `git diff b5dd987`, and `git status --short --untracked-files=all`. Expect only the four implementation files and this plan.
  - `rg -n -i readout docs AGENTS.md GLOSSARY.md | rg -v -i 'progress[ _]readout'`, expecting matches only in `docs/specs/` and `docs/plans/`.
  - `rg -n "🛑|🟡|🟢|⏸️" docs AGENTS.md GLOSSARY.md`, expecting emoji meanings only in `docs/lifecycle.yaml`. The emojis may also appear on example steps in `coordinator.md`, and in the historical #78 spec and the plans.
  - `git diff --quiet b5dd987 -- docs/specs AGENTS.md docs/agents/roles/planner.md docs/agents/roles/architect.md docs/agents/roles/coder.md docs/agents/roles/reviewer.md docs/agents/roles/researcher.md`, expecting no change.
  - Every step key in the examples in `docs/execution-checkpoint.md` and `coordinator.md` is a key in `docs/lifecycle.yaml`, in its stage's order, and none is invented.
  - The Reviewer traces stories 1–10 and the acceptance criteria to the new text. Using one example per required scenario, the Reviewer confirms that the checkpoint alone produces the readout shown: `steps` for the markers, and `waits`, `errors`, and `next` for the note. The Reviewer also confirms that no stage, step, transition, or gate changed: `git diff b5dd987 -- docs/lifecycle.yaml` touches only `authority`, `rules.authorization`, `rules.tracking`, and the new `progress_readout` section.
  - No automated test, since one would only repeat the prose.
- Outline approval: not needed. The change adds one section and edits existing bullets; it isn't a new or substantially revised document.

## Parallel read-only work

- None.

## Final validation and hand back

- Scope: implementation files `docs/lifecycle.yaml`, `docs/execution-checkpoint.md`, `docs/agents/roles/coordinator.md`, and `GLOSSARY.md`; Task Artifacts this plan; local records `.agent-state/79.yaml`, ignored by Git.
- Hand back: the diff, the validation results, and the Reviewer's trace go to the Coordinator.
- After the diff lands, the Coordinator, not the Coder, moves `.agent-state/79.yaml` to the new `steps` field.

## Maintainer feedback and decisions

- The definition lives in `docs/lifecycle.yaml`, linking Markdown only where it helps (Planner chat, 2026-11-02). The examples go in the Coordinator SOP, because the Coordinator produces the output (Planner chat, 2026-11-02, revising the plan's earlier choice of YAML examples): operations 1 and 3.
- Examples use only the step keys the Lifecycle defines, in its order; that is how R5 was decided (Planner chat, 2026-11-02).
- The separate checkpoint `status` field is dropped in favor of `steps` (Planner chat, 2026-11-02): operation 2.
- The readout is built from the checkpoint alone (Planner chat, 2026-11-02): operation 2.
- The stage line is plain `Stage: <name>`, the emoji sits only on the active step, and there's no short form (Planner chat, 2026-11-02).
- The 100-line limit belonged to #78; for #79 the rule is to keep the change slim (Planner chat, 2026-11-02).
- #82 owns delegated roles' tracking, so no other role SOP changes.

## Cycle 2 changes

The Maintainer approved these changes in the Coordinator chat at 2026-11-02T21:41+09:00 ("Good suggestions"), amending the operations named. The plan was committed at `6e8cf04`.

1. Reviewer F1, operation 3: reword the `coordinator.md` bullet "When a stage is re-entered…". It keeps cycle counts and approvals, points to the Lifecycle's `progress_readout` for which step statuses go back to pending, and drops "reset nothing".
2. Reviewer F2, operation 3: in "Track the stage", turn the restated source and fallback into a pointer only, and merge the two `progress_readout` pointers into one.
3. Reviewer F3, operation 1: `status.about` in `docs/lifecycle.yaml` reads "Choose the current step's emoji by its status and what it waits on."
4. Maintainer diff comments, operation 3: the example notes use these exact texts:
   - 🟢 `requirements-interview`: `Planner interviewing`
   - 🟡 `requirements-review`: `Review requirements in the Planner session`
   - 🛑 `retro-drafts`: `/retro timed out; drafts kept. Start it again or decide the drafts`
   - ⏸️ `implementation-plan`: `Planner paused; resets at 21:00`
5. Reviewer F5, operation 5: the readout `rg` check also allows the glossary's approved `_Avoid_: readout (alone)` line.

## Architect recommendations

Assessment of plan blob `19674a30…` by Architect `abd0b6f9`, relayed by the Coordinator on 2026-11-02. The Architect agreed with the examples in the YAML, the `steps` field replacing `status`, and no outline approval.

- R1, a rule for conditional steps: accepted, in operation 1.
- R2, emoji mapped by what the step waits on, with the note taken from `waits`, `errors`, and `next`: accepted, in operation 1.
- R3, the failure example on `retro-drafts` instead of `ci-diagnosis`: accepted, in operation 1.
- R4, section key `progress_readout` and the narrowed search: accepted, in operations 1–3 and 5.
- R5, whether examples may list a stage's steps: the Maintainer chose option a (Planner chat, 2026-11-02). "Nothing else lists a stage's steps" means no second definition. Examples may list steps, but only by the step keys the Lifecycle defines, in Lifecycle order. This applies in operations 2, 3, and 5.
- R6, the Coordinator moves `.agent-state/79.yaml`: accepted, under Final validation and hand back.
- R7, no separate YAML parse check and no prescribed emoji-key quoting: accepted, in operation 1.

Reassessment of plan blob `a7836040…` by Architect `abd0b6f9`, relayed by the Coordinator on 2026-11-02. It confirmed R1–R7 and the Maintainer's decisions.

- N1, operation 2 builds the readout and task list from the checkpoint rather than `steps` alone: accepted. Operation 5's Reviewer check was corrected the same way (Coordinator clearance, 2026-11-02).
- N2, operation 5 names the `progress_readout` section: accepted.
- N3, operation 3's examples start with one line linking the Lifecycle's Progress Readout: accepted.
