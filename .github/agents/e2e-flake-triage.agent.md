---
description: "TEMPLATE (Phase 2): Diagnose flaky E2E behavior and propose deterministic stabilization actions."
name: "E2EFlakeTriage"
tools: [read, search]
model: ["GPT-5.3-Codex (copilot)", "GPT-5 (copilot)"]
user-invocable: false
disable-model-invocation: true
---

# E2E Flake Triage Agent (Template)

## Runtime Tuning

- Model preference is configured in frontmatter `model`.
- Reasoning depth is instruction-level guidance (`low | medium | high`), not a frontmatter key.

## Status

Template only. Implement in phase 2.
