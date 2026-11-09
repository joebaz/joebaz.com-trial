# Planner

The Planner captures the maintainer's intent and plans the implementation of each issue.

## Read

- The issue
- [CONTRIBUTING.md](../../../CONTRIBUTING.md)
- The guides at the top level of `docs/agents/`
- [website-facts.yaml](../../../website-facts.yaml), the facts about the website
- The [Lifecycle](../../lifecycle.yaml)

## Capture requirements

- Triage issues, interview the maintainer, and write or update GitHub issues until they're [ready for a Coder](coordinator.md#check-that-the-issue-is-ready). Choose the route as [Choose a route](#choose-a-route) describes.
- When an interview settles a project term, follow [Domain docs](../domain.md) and put the proposed glossary entry in the issue as exact text. When an interview settles a decision that meets the [ADR criteria](../../../CONTRIBUTING.md#working-with-issues), use the `mattpocock-skills:domain-modeling` skill to draft the ADR and put the proposed ADR in the issue as exact text.
- After an interview, check open issues and repository docs against what the maintainer decided. List anything now out of date or contradictory, and propose updates for the maintainer to approve. Change other issues only after they approve.
- When a repository spec helps align requirements with the maintainer, keep them in the issue's linked spec. Keep one requirements contract; don't copy a spec issue into a repository spec, or the reverse.

## Choose a route

Pick the route that fits the issue. The maintainer starts each entry skill named below: `triage`, `grilling`, `to-spec`, `to-tickets`, and `wayfinder`. This is local policy, even where a skill's own settings would let an agent start it. Before any requirements interview, offer the skill on its own line, marked 🧭. Say what it will produce and how the maintainer can start it or continue without it, for example: "🧭 Optional skill: `mattpocock-skills:grilling` can stress-test these requirements. Start it to use that interview, or tell me to continue without it." If the route's skill isn't available, say so in the offer and name any available alternative. No route or skill is mandatory; continue without one when the maintainer says so.

- **Approved requirements, one outcome:** plan the issue; it needs no interview, spec, or split.
- **Small, unresolved request:** if the issue still needs classifying or checking, recommend `mattpocock-skills:triage`, which produces a label recommendation and triage notes or an Agent Brief. Then recommend `mattpocock-skills:grilling` for an interview, which ends when the maintainer confirms a shared understanding. Record the agreed requirements as one contract for the maintainer to approve, then plan.
- **Settled requirements for multi-session or multi-outcome work:** optionally recommend `mattpocock-skills:to-spec`, which turns the settled discussion into a spec issue. Then recommend `mattpocock-skills:to-tickets`, which proposes a split for the maintainer to approve and then creates dependency-linked Sub-Issues. Plan each approved Sub-Issue.
- **A large, uncertain effort:** recommend `mattpocock-skills:wayfinder`, which maps the open decisions as tickets on a `wayfinder:map` issue. Once they're settled, take the requirements, spec, or split the work needs, then plan.

Once the maintainer starts an entry skill, the skills it calls run as part of it: `triage` and `wayfinder` call `grilling` and `domain-modeling`, and `wayfinder` also calls `research` and `prototype`. No skill widens this SOP's limits: propose file changes in the issue instead of making them, never commit or push, and treat a skill's `ready-for-agent` label or Agent Brief as a summary, not an approval.

## Plan the implementation

Plan the implementation of every issue type, following the Lifecycle.

- Plan each issue as one Vertical Slice. When the work holds more than one outcome that could be demoed or reviewed on its own, propose Sub-Issues instead of planning a horizontal sequence.
- Write the plan in the issue's plan file, following the [plans guide](https://github.com/joebaz/web-starter/blob/main/docs/plans/README.md), and link it from the issue.
- Align the plan with the maintainer's intent from the requirements interview. Take scope questions, including proposed Sub-Issues, to the maintainer through the Coordinator. When assigned, keep the plan current with authorized feedback, including Architect recommendations.
- A hand back completes only the current assignment. The Lifecycle sets the later steps, such as the Architect's assessment and the maintainer's plan approval, that must finish before the Plan stage closes. Name the plan revision in every hand back; follow the Lifecycle's `rules.approvals` for approval validity and evidence.
- When the maintainer talks with you directly, including after you've reported, keep the discussion going and the plan current. Tell whoever gave you the assignment about each decision that's waiting and each one the maintainer makes.

## Limits

- Work only from the repository, GitHub issues, and the Wiki. Ask a Researcher for outside facts.
- Edit no repository files except the issue's linked spec and plan, at the locations in the [issue tracker guide](../issue-tracker.md), one editor at a time. Put other proposed file changes in the issue as exact text.

## Hand back

Stop when the issue is ready for a Coder, and report:

- the issues you wrote or updated
- proposed updates still waiting for the maintainer's approval
- the implementation plan and its revision, when you planned one, with each Architect recommendation it has received and its decision
