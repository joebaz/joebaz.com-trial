# Glossary

Terms used when working with the Template and Projects built from it.

## Projects and websites

**Template**:
The reusable repository used as the starting point for a Project.
_Avoid_: starter

**Project**:
A bounded effort to create, redesign, or migrate a website, from planning through launch.

**Host**:
The service or infrastructure that serves the website to visitors.

**Platform**:
The software system used to build or manage the website, such as Astro or a CMS.

**Migration**:
A move of an existing website to a different host, platform, domain, or subdomain.

**Redesign**:
Creating a different visual design and user experience for an existing website.

**Launch**:
Making a Project's new or changed website available to visitors in its intended production environment.

## Design and content

**Visual Design**:
The website's intended appearance, including layout, typography, color, and imagery.
_Avoid_: design

**UX**:
How visitors navigate, understand, and use the website to accomplish their goals.
_Avoid_: design

**System Design**:
How the website's software components are organized and interact.
_Avoid_: design

**Design Doc**:
A document capturing the intent, goals, requirements, and scope of proposed work.
_Avoid_: design

**Content**:
The headlines, article copy, photos, icons, metadata, and UI labels published within the web page components and layouts.

**Page Structure**:
The HTML and CSS shell that supports the Content.

## Documentation audiences

**Agent Docs**:
Documents intended to guide agents working on the Template or a Project. They help align agents and the Maintainer on System Design, implementation, testing, and maintenance.

**Maintainer Docs**:
Documents intended to guide the Maintainer working on the Template or a Project.

## Planning

**Vertical Slice**:
A cohesive outcome, one GitHub Issue or Sub-Issue, delivered through every Layer it needs so it can be checked end to end on its own, such as the Docs lifecycle working for Docs issues before other issue types adopt it.

**Layer**:
A part of the Template or Project that owns one kind of responsibility for many outcomes, such as site configuration, page layouts, or the lifecycle's sequencing.

## Workflow

**Lifecycle**:
The stages and permitted transitions through which an issue progresses from definition to completion.

**Progress Readout**:
A brief, in-conversation summary of where an issue stands in its Lifecycle stage, so the Maintainer can see what is done, what is happening, and whether they need to act.
_Avoid_: readout (alone), status report

**Agent Brief**:
A concise description of an agent’s assigned work, including its expected outcome, scope and acceptance criteria.

**Task Artifact**:
A document or record produced or used while carrying out an issue, such as a specification, implementation plan or review report.

## Changes and debt

**Defect**:
A flaw in the website or one of its dependencies that causes unintended behavior or prevents it from working as expected.

**Feature Gap**:
An unanticipated case that an existing website capability should support.
_Avoid_: design gap

**Fix**:
A change that corrects a Defect or resolves a Feature Gap.

**Feature**:
A change that adds a new website capability or meaningfully expands an existing one.

**Tech Debt**:
A shortcut, omission, or structural flaw in the code, such as duplication, a missing test, a workaround, or a misplaced boundary, that makes later changes slower or riskier until it is paid down.
_Avoid_: cruft, architecture debt

**UX Debt**:
A shortfall in the website's usability, accessibility, or performance that remains until addressed.
_Avoid_: design debt

## Roles

**Maintainer**:
A person responsible for the repository, who approves its work and is the only one who commits, pushes, or merges it.
_Avoid_: owner

**Coordinator**:
The agent role that coordinates work on a GitHub issue between the Maintainer and a team of agents.
_Avoid_: orchestrator, orchestrate

**Planner**:
The agent role that captures the Maintainer's intent and plans the implementation of a GitHub Issue or Sub-Issue.

**Researcher**:
The read-only agent role that answers approved research questions with checked facts and sources.

**Architect**:
The agent role responsible for the overall health of the codebase and the System Design as a whole, consistent with the approved intent of the Template or Project.

**Coder**:
The agent role that implements an issue that is ready for an agent, with its test plan, for independent review.

**Reviewer**:
The agent role that reviews a change independently and recommends "accept" or "changes needed".
