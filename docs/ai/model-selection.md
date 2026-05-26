# Model Selection Policy

This file is the canonical, machine-readable model matrix consulted by the `SessionCoordinator` at delegation time. It uses a compact, versioned YAML schema so runtime orchestration can deterministically choose models, fallbacks, retries, and escalation behavior.

The schema (example):

```yaml
version: 1
global_defaults:
	max_retries: 2
	escalate_on:
		- timeout
		- low_confidence
		- repeated_flake
		- failed_assertion

workers:
	SessionCoordinator:
		max_retries: 1
		escalate_on: [timeout, low_confidence, repeated_flake]
		escalate_to:
			- reasoning_depth: "high"        # no model -> re-invoke current model with higher depth
			- model: "Claude Opus 4.6"
				reasoning_depth: "high"
			- model: "human"

	TypeScriptImplementer:
		max_retries: 2
		escalate_on: [failed_typecheck, wrong_patch]
		escalate_to:
			- reasoning_depth: "high"
			- model: "GPT-5.4"
				reasoning_depth: "high"
```

Notes:
- `version`: schema version. Increase when changing fields or semantics.
- `global_defaults`: default retry and escalation triggers if a worker does not override them.
- `workers.<Name>.max_retries`: number of normal retry attempts before escalation.
- `workers.<Name>.escalate_on`: events that trigger escalation (override of `global_defaults`).
- `workers.<Name>.escalate_to`: ordered escalation plan. Each entry is one of:
	- `{ reasoning_depth: "<low|medium|high>" }` — no `model` field means "re-invoke the current model with the given reasoning depth".
	- `{ model: "<model-name>", reasoning_depth: "<...>" }` — switch to the named model and use the indicated reasoning depth.
	- `{ model: "human" }` — route to a human reviewer.

Runtime requirements for the `SessionCoordinator` (summary):
- The `SessionCoordinator` MUST load and parse this file at delegation time; this is the authoritative source for escalation behavior.
- Worker frontmatter may include an ordered `models` array (primary first, then fallbacks). The Coordinator should use `models[0]` as `primary` and `models[1:]` as `fallbacks`.
- When an escalation event occurs, the Coordinator MUST iterate `workers.<Name>.escalate_to` in order and invoke each entry as specified. Do NOT append `escalate_to` models into the worker `fallbacks` list — escalation targets are invoked directly and in-order.
- If an `escalate_to` entry omits `model`, interpret it as "re-invoke the current model with the specified `reasoning_depth`." This allows escalating by increasing reasoning depth without changing vendor/model.
- If a requested `reasoning_depth` is unsupported or an invocation fails, log the failure and proceed to the next `escalate_to` entry.

For rationale, cost assumptions, and examples, see `model-selection-recommendations.md`.

## Last Updated

2026-05-26
