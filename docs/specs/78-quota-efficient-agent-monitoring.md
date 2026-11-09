# Quota-efficient agent monitoring: spec

> **Status:** Approved by the Maintainer on 2026-11-02 at commit `d96f148`. This is #78's one canonical spec and requirements contract, and the [requirements comment](https://github.com/joebaz/web-starter/issues/78#issuecomment-6550726784) is history. The stories below are the contract, not the wording of any document that implements them; only the four status emojis are exact.

## Problem Statement

The Coordinator's instructions told it to check each delegated agent every 15 minutes while the work, or a Maintainer decision about it, stayed open. In #45, only the Maintainer could take the next step, but the checks kept waking the Coordinator anyway. Over about 9.75 hours that came to 40 checks, 120 model requests, and about 12.1 million tokens, mostly cached input from a growing conversation. Each check repeated the same wait. How tokens convert into subscription allowance is unknown, but none of those checks could achieve anything.

The Maintainer wanted the checks for two reasons:

- in case an agent forgot to report back
- to resume work after a usage-limit reset while they were away

They also have a related problem: their morning five-hour window resets too late in the day to be useful.

## Solution

Agents stop running recurring checks and timed wake-ups. The Coordinator learns that an agent stopped from the agent tool's notifications, and it checks every open agent whenever it wakes or takes over. It reports usage limits and waits on the Maintainer once, and it messages the Maintainer only about changes. The Maintainer resumes any work stopped by a usage limit. Every agent replies to whoever messaged it. These rules name no agent tool. Separately, the Maintainer may set up optional, tool-specific local schedules that open a usage window before they start work.

## User Stories

1. As the Maintainer, I want no agent to set up recurring checks or wake-ups, one-shot or recurring, on other agents or on itself, so that waits where nothing can change cost nothing.
2. As the Maintainer, I want the Coordinator to learn from the agent tool's notifications that an agent has finished, failed, or asked for permission, and then check what the agent actually produced, so that a stop is noticed without depending on the agent to report, and a usage-limit stop isn't mistaken for finished work.
3. As the Coordinator, I want to check every open agent on the work whenever I wake or take over, including agents my predecessor started, so that a lost notification, or one my tool never sends, is caught then. I accept there's no detection-time guarantee.
4. As the Coordinator, I want a finished turn or report to leave the work open until its Lifecycle step records completion evidence and no Maintainer decision about it is pending, so that "finished" keeps its meaning.
5. As the Maintainer, I want one message when an agent stops at a usage limit, giving the reset time if the tool shows one and saying it's unknown otherwise, so that I can resume the work myself. No agent resumes work automatically. When the Coordinator itself is cut off, it may be unable to report, and I resume it.
6. As the Maintainer, when the next step is mine alone, I want one message with the exact question and then no repeated checks or reports about that blocked work until I reply, while unrelated authorized work carries on, so that I'm not flooded and other work isn't held up.
7. As the Maintainer, I want one message when the Coordinator can't tell whether a stopped agent is stalled or waiting on me, so that unclear cases reach me without repeated checks.
8. As the Maintainer, I want messages only when something changes, each led by 🛑 for an error or failure, 🟡 when it needs my attention, 🟢 when work moved forward, or ⏸️ for a usage-limit pause, so that I can scan status at a glance.
9. As the Maintainer, I want my stop to override every other rule, so that no agent restarts something I stopped. Approval and publishing gates also stay as they are.
10. As the Coordinator, I want to wait for GitHub CI by watching the pull request's checks from the shell, for example with `gh pr checks --watch`, and to run the watch again if it reaches my tool's time limit, so that no heartbeat or recurring model check runs.
11. As any agent, I want to reply to whoever sent me each message, agent or Maintainer, and to send my hand back to whoever gave me the assignment, so that answers and finished work reach the right owner.
12. As the Maintainer, I don't want every role required to report my direct conversations with it to the Coordinator, because that depends on an agent remembering as its context degrades. The Planner's existing duty to report decisions from those conversations stays.
13. As a Template user, I want these rules to name no particular agent tool, so that they work with my tool, and the Maintainer's local setup stays optional rather than a dependency.
14. As the Maintainer, I want the heartbeat instruction removed from my local Paseo system prompt, with nothing in its place, so that no always-on instruction suggests heartbeats.
15. As the Maintainer, I want optional local schedules that ping Claude and Codex a few hours before I start work, and then every five hours and two minutes through the working day, so that a window is already open and resets near when I usually hit my limit. The setup:
    - low-cost models at low effort: Haiku and Luna
    - "Reply with OK." in an empty folder outside any repository
    - a restrictive permission mode, meant to limit what a ping can do: Plan Mode for Claude, Default Permissions for Codex
    - archive on finish on
    - pings never resume agents
    - I apply the schedules and can pause them at any time
16. As the Maintainer, I want trimming each ping's loaded context left as an optional later step that keeps my subscription sign-in, so that I take it on only if pings prove costly.

## Implementation Decisions

- **What changes:** the Coordinator's role SOP and the shared agent instructions. Any wording that meets the stories works.
- **What stays the same:**
  - the Lifecycle, the execution checkpoint reference, and the other role SOPs
  - the Researcher's reply rule, which already fits the new rule
  - the Planner's duty in story 12
  - the historical Lifecycle design record
- **Size:** the repository change stays within the Maintainer's 100-line limit per review.
- **Local setup:** the Maintainer applies the Paseo setup themselves, outside the repository. The exact ping times and time zone are [recorded in #78](https://github.com/joebaz/web-starter/issues/78#issuecomment-6565318342). Each ping time needs its own schedule per provider.
- **Rejected:**
  - a recurring backup check while agents run
  - timed reset wake-ups
  - heartbeats or schedules that resume work
  - third-party resume plugins
  - a rule making every role report direct conversations
  - a replacement line in the Paseo prompt

## Testing Decisions

- Test only behavior seen in ordinary use. No test makes extra model requests.
- **What to observe:**
  - a wait on the Maintainer gets one 🟡 and nothing more about that work
  - stops are picked up from a notification, or at the next wake or takeover
  - a usage limit gets one ⏸️ and no automatic resume
  - agents reply to whoever messaged them
  - CI waits run without a heartbeat, with turns per wait recorded
  - the providers' usage views show resets that follow the ping schedule
- **Prior art:** the #45 audit method, which counted turns, requests, duplicate token events, and tool rounds from local session logs.
- **Limits:** the account-wide usage view is coarse and mixes in all other activity, so it can't isolate a ping's cost or prove a saving.
- **Flagged for later, not authorized:** a live test of whether a stopped agent always produces a notification, and a measured cost for a single ping. Either would need its own approved plan.

## Out of Scope

- Any automatic resume after a usage limit.
- Quota dashboards, per-agent usage views, and Paseo's missing `/status`.
- A research report in the repository.
- Changes to Paseo itself. Upstream issues already exist for the behaviors this works around: [#7531](https://github.com/getpaseo/paseo/issues/7531) (busy targets drop wake-ups), [#7636](https://github.com/getpaseo/paseo/issues/7636) (a Claude limit looks like a normal finish), and [#7104](https://github.com/getpaseo/paseo/issues/7104) (schedules without a mode can stall).
- Credentials, plans, normal-work models, and service tiers.
- Trimming pings now, including Claude Code mods and API-key-only modes.
- Paseo's own installed skills.

## Further Notes

- **Traceability:** the accepted scope comes from the [requirements comment](https://github.com/joebaz/web-starter/issues/78#issuecomment-6550726784), as annotated with the Maintainer's decisions from the Planner chat on 2026-11-01 and 2026-11-02, plus the later decisions on window anchoring, reply routing, and this spec's form.
- **Notifications:** they can be suppressed after a Coordinator is replaced, and a crash can lose queued messages. Story 3 is the fallback.
- **Window anchoring is proposed, not verified:**
  - Anthropic documents that a Claude five-hour period starts with the first message ([usage limits](https://support.claude.com/en/articles/11647753-how-do-usage-and-length-limits-work)).
  - For Codex, there is only a correlation in the Maintainer's logs.
  - Nothing shows whether Haiku or Luna pings open the windows other models use.
  - The two-minute spacing is a margin, not a guarantee. Other work, or a run delayed while Paseo is down, can still shift a window.
- **Ping cost and terms:**
  - What a ping costs in allowance is unknown, and pings also count toward the weekly limit.
  - No provision about prompts sent only to start a usage window was identified in the in-force provider terms checked, so whether this setup is permitted or prohibited wasn't established. The Maintainer chose to go ahead.
