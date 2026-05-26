# Model Selection Policy

Canonical model matrix (machine-readable). Contains per-worker configuration used by the `SessionCoordinator`.

```yaml
global_defaults:
	max_retries: 2
	escalate_on:
		- timeout
		- low_confidence
		- repeated_flake
		- failed_assertion

workers:
	SessionCoordinator:
		models:
			- GPT-5.4
			- Gemini 2.5 Pro
		max_retries: 1
		escalate_on:
			- timeout
			- low_confidence
			- repeated_flake
		escalate_to:
			- reasoning_depth: high
			- model: Claude Opus 4.7
				reasoning_depth: high
			- model: human

	ContextLoader:
		models:
			- GPT-5 mini
			- GPT-5.4 mini
			- Claude Sonnet 4.6
		max_retries: 2
		escalate_to:
			- reasoning_depth: medium
			- model: Claude Sonnet 4.6
				reasoning_depth: medium

	TypeScriptImplementer:
		models:
			- GPT-5.3-Codex
			- GPT-5.4
			- Claude Sonnet 4.6
		max_retries: 2
		escalate_to:
			- reasoning_depth: high
			- model: GPT-5.4
				reasoning_depth: high
			- model: Claude Opus 4.6
				reasoning_depth: high

	E2EImplementer:
		models:
			- GPT-5.3-Codex
			- GPT-5.4
		max_retries: 2
		escalate_to:
			- reasoning_depth: high
			- model: GPT-5.4
				reasoning_depth: high
			- model: human

	E2EFlakeTriage:
		models:
			- GPT-5.4
			- Gemini 2.5 Pro
			- GPT-5.3-Codex
		max_retries: 2
		escalate_to:
			- reasoning_depth: high
			- model: Claude Opus 4.6
				reasoning_depth: high
			- model: human

	CSSLayoutSpecialist:
		models:
			- GPT-5.4
			- Claude Sonnet 4.6
			- GPT-5.4 mini
		max_retries: 2
		escalate_to:
			- reasoning_depth: high
			- model: GPT-5.4
				reasoning_depth: high

	ZustandStateSpecialist:
		models:
			- GPT-5.3-Codex
			- GPT-5.4
			- Gemini 2.5 Pro
		max_retries: 2
		escalate_to:
			- reasoning_depth: high
			- model: GPT-5.4
				reasoning_depth: high
			- model: Claude Opus 4.6
				reasoning_depth: high

	CIWorkflowSpecialist:
		models:
			- GPT-5.4
			- GPT-5.3-Codex
		max_retries: 2
		escalate_to:
			- reasoning_depth: high
			- model: Claude Opus 4.6
				reasoning_depth: high
			- model: human

	QualityGateRunner:
		models:
			- GPT-5.4
			- GPT-5 mini
		max_retries: 2
		escalate_to:
			- reasoning_depth: medium
			- model: human

	GitCheckpointWorker:
		models:
			- GPT-5 mini
			- GPT-5.4 mini
		max_retries: 1
		escalate_to:
			- reasoning_depth: medium
			- model: GPT-5.4
				reasoning_depth: medium

	Handoff:
		models:
			- GPT-5 mini
			- GPT-5.4
		max_retries: 1
		escalate_to:
			- reasoning_depth: medium
			- model: GPT-5.4
				reasoning_depth: medium
```

## Last Updated

2026-05-26
