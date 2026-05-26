# QA Accessibility Policy (Minimal)

Status: Active
Last updated: 2026-05-26

## Purpose

Define a lightweight accessibility acceptance policy for UI/layout-impacting changes without creating heavy delivery friction.

## Scope

Apply this policy when changes affect:

- Layout or styles (`src/styles/**`)
- Interactive UI structure (`src/components/**`, `src/pages/**`)
- Theme presentation and readability

## Minimum Required Checks

1. Run the existing smoke gate:
- `npm run test:integration`

2. For UI/layout-impacting changes, include accessibility evidence from one of:
- Playwright evidence across target breakpoints (required)
- DevTools inspection evidence for focus/visibility/contrast risks (required when ambiguity exists)

## Severity And Blocking Rules

- Blocker (must fail acceptance):
  - Interactive controls not keyboard/touch reachable
  - Text/control contrast failure on primary flows
  - Hidden or unlabeled core controls that break gameplay flow
- Non-blocking (log and track):
  - Cosmetic semantics gaps outside core flow
  - Low-impact warnings with no flow break

## Required Reporting In QA Output

- Accessibility status: pass | fail
- Evidence source: MCP or Playwright/a11y report
- Blockers found (if any)
- Follow-up owner for non-blocking items

## Rollout Notes

- Keep policy minimal until dedicated a11y automation is added to required CI gates.
- Current MCP baseline is Playwright + DevTools only (validated smoke set in this environment).
- Revisit blocker thresholds after 1-2 sprints of signal collection.
