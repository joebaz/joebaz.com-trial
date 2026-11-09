# Domain docs

This repo uses a single-context layout: [GLOSSARY.md](../../GLOSSARY.md) at the root and ADRs in `docs/adr/`.

## Consult the glossary

Before exploring a code area, read the root glossary and relevant ADRs if they exist. Proceed silently if they do not.

Use the glossary's preferred terms in issues, proposals, hypotheses, tests, and documentation. An `_Avoid_` line identifies confusing alternatives for that concept; it does not rename required tool identifiers, APIs, proper names, or quoted source material. Use a specific term when bare “design” could mean Visual Design, UX, System Design, or a Design Doc, unless context is clear enough.

If work conflicts with an ADR, identify the ADR and explain the conflict.

## Scope and entry format

The glossary defines reusable website-project terminology and the Template's shared agent-role and debt vocabulary. Add business-specific vocabulary in each derived Project when its meaning is agreed; do not invent business facts in the Template. Keep one root glossary and adapt its entries to the Project's context rather than creating multiple glossary contexts by default.

Include a term when its meaning affects the work or causes confusion. Do not build a general programming, web, or tool dictionary.

Use a bold preferred term followed by a colon, a one- or two-sentence definition, and an optional `_Avoid_` line for conflicting aliases. Group entries under headings when useful. Keep definitions focused on meaning; put requirements in the issue and its approved artifacts, implementation standards in [coding-standards.md](../../coding-standards.md), and procedures in the relevant workflow or checklist. Keep unresolved questions in the issue, or in the spec file the issue links to.

A document may serve both the Agent Docs and Maintainer Docs audiences. Agreement on terminology does not, on its own, change issue labels or branch classification.

## Add or revise an entry

Start this process when a missing term, competing meanings, or a conflict with existing definitions or usage affects the task:

1. Read the existing glossary and check relevant repository usage, including code and configuration when they establish the behavior being discussed. Surface the conflict or missing distinction to the Maintainer instead of silently choosing a meaning.
2. Propose the preferred term, exact definition, any confusing aliases, and affected wording in the issue. Use concrete examples to test the boundary where helpful. If the conflict cannot be resolved yet, keep the question in the issue or its linked spec file and raise it before dependent work proceeds.
3. Get the Maintainer's agreement on the exact wording before treating the term as settled. Then include the agreed glossary entry and approved affected wording in the issue's normal implementation and review process; follow [CONTRIBUTING.md](../../CONTRIBUTING.md). During an interview, retain agreed wording in the issue or its linked spec file until repository implementation is authorized.
4. Review affected uses for consistency. Propose separately scoped or otherwise unapproved changes to the Maintainer; agreement on a definition does not authorize unrelated workflow changes.

Simple repository instructions are sufficient for this process. The `mattpocock-skills:domain-modeling` skill can help challenge terminology and test examples, but is optional for glossary work. These local approval rules apply whenever that skill is used. Keep the existing [ADR criteria](../../CONTRIBUTING.md#working-with-issues); this glossary process adds no new ADR policy.
