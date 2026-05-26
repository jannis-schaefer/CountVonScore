# Model Selection Recommendations

TL;DR — Balanced (cost + quality): use GPT-5.4 / GPT-5.3-Codex for agentic coding and multi-step work, Claude Sonnet/Opus for layout/agentic safety when justified, Gemini 2.5 Pro as an alternative for long-context reasoning. Cheap models (GPT-5 mini, GPT-5.4 mini, GPT-5.3-Codex) are fine for routine or high-volume tasks.

**Cost multipliers (provided)**

- Claude Opus 4.7: 15x
- Claude Opus 4.6: 3x
- Claude Sonnet 4.6: 1x
- Gemini 2.5 Pro: 1x
- GPT 5.4: 1x
- GPT 5.4 mini: 0.33x
- GPT 5.3 Codex: 0.33x
- GPT 5 mini: 0x

---

## Agent recommendations (primary, fallback, thinking effort)

Notes: "Primary" = default model to assign; "Fallback" = cheaper or alternative provider to use when primary is unavailable or cost-constrained; "Thinking effort" = recommended depth of chain-of-thought/effort for that agent (Low / Medium / High).

- **SessionCoordinator**
  - Primary: GPT-5.4
  - Fallback: Gemini 2.5 Pro; emergency: Claude Opus 4.7 (only for highest-stakes tasks)
  - Thinking effort: High
  - Rationale: Coordinator needs robust multi-step tool use, long-context, and consistent decision-making; GPT-5.4 leads for tool use/long-horizon work at 1x cost.

- **ContextLoader**
  - Primary: GPT-5 mini
  - Fallback: GPT-5.4 mini or Claude Sonnet 4.6 for larger context
  - Thinking effort: Low → Medium (use Medium for long RAG summaries)
  - Rationale: Fast, low-cost document summarization and briefing.

- **TypeScriptImplementer**
  - Primary: GPT-5.3-Codex
  - Fallback: GPT-5.4 or Claude Sonnet 4.6
  - Thinking effort: Medium (High for large cross-file refactors)
  - Rationale: Codex family is engineered for SWE-Bench/terminal-style coding tasks; strong code generation + terminal automation at good cost.

- **E2EImplementer**
  - Primary: GPT-5.3-Codex
  - Fallback: GPT-5.4 for visual/computer-use and heavier reasoning
  - Thinking effort: Medium (High when stabilizing flaky selectors)
  - Rationale: Codex excels at Playwright-style automation; upgrade to GPT-5.4 when test design needs deeper agentic reasoning or screenshot-driven checks.

- **E2EFlakeTriage**
  - Primary: GPT-5.4 or Gemini 2.5 Pro (choose based on existing tooling)
  - Fallback: GPT-5.3-Codex for code-level analysis
  - Thinking effort: High
  - Rationale: Flake triage requires long context (logs, repeated runs), causal reasoning and cross-run synthesis — GPT-5.4 and Gemini are both strong here.

- **CSSLayoutSpecialist**
  - Primary: Claude Sonnet 4.6
  - Fallback: GPT-5.4 or GPT-5.4 mini for quick checks
  - Thinking effort: Medium
  - Rationale: Anthropic highlights Sonnet's strength on UI/layout tasks; Sonnet is cost-effective for layout scans and theme-token compatibility.

- **ZustandStateSpecialist**
  - Primary: GPT-5.3-Codex for code edits; GPT-5.4 for cross-file invariants
  - Fallback: Gemini 2.5 Pro
  - Thinking effort: High
  - Rationale: State correctness mixes code generation (Codex) with deep invariants and long-context reasoning (GPT-5.4/Gemini).

- **CIWorkflowSpecialist**
  - Primary: GPT-5.4
  - Fallback: GPT-5.3-Codex for script edits
  - Thinking effort: Medium (High for gate-policy changes)
  - Rationale: Gate policy requires balanced reasoning about reliability, cost, and false-failure impact.

- **QualityGateRunner**
  - Primary: GPT-5.4
  - Fallback: GPT-5 mini for quick triage
  - Thinking effort: Medium
  - Rationale: Interpreting test outputs and mapping ownership benefits from GPT-5.4's reasoning; cheap models ok for routine classification.

- **GitCheckpointWorker**
  - Primary: GPT-5 mini
  - Fallback: GPT-5.4 mini
  - Thinking effort: Low
  - Rationale: Procedural git tasks are low-complexity and should run on the least-cost capable model.

- **Handoff**
  - Primary: GPT-5 mini
  - Fallback: GPT-5.4 for polished handoffs
  - Thinking effort: Low
  - Rationale: Short session summaries and doc edits — low-cost models suffice.

---

## Model capability summaries (public vendor highlights)

- **GPT-5.4** — Cost multiplier: 1x
  - Strengths: multi-step tool use, computer-use (Playwright/screenshot), long-context support, strong knowledge-work performance (GDPval), improved factuality and steerability.
  - Benchmarks (vendor): GPT-5.4 announcement including results on GDPval, OSWorld-Verified, SWE-Bench Pro and long-context MRCR metrics. See: https://openai.com/index/introducing-gpt-5-4/
  - Best for: coordinator, triage requiring tool use, long-horizon reasoning, CI policy reviews.

- **GPT-5.3‑Codex** — Cost multiplier: 0.33x
  - Strengths: state-of-the-art coding, terminal/automation performance (SWE-Bench Pro, Terminal-Bench 2.0, OSWorld). Good at iterated web development and Playwright-style automation.
  - Benchmarks (vendor): https://openai.com/index/introducing-gpt-5-3-codex/
  - Best for: TypeScriptImplementer, E2EImplementer, code-heavy tasks where cost matters.

- **GPT-5.4 mini** — Cost multiplier: 0.33x
  - Strengths: compact, cheaper variant of GPT‑5.4 for lower-cost inference; useful for quick iterations.
  - Best for: fallback for moderate reasoning and polishing.

- **GPT-5 mini** — Cost multiplier: 0x
  - Strengths: zero-cost (per your multiplier) for routine, low-risk tasks and doc generation.
  - Best for: ContextLoader, GitCheckpointWorker, Handoff.

- **Claude Sonnet 4.6** — Cost multiplier: 1x
  - Strengths: hybrid reasoning, strong coding and agentic workflows, long-context (1M tokens), cost-effective for agentic coding and UI/layout reasoning.
  - Vendor page: https://www.anthropic.com/claude/sonnet
  - Best for: CSS/Layout checks, layout-specialist audits, complex instruction-following where Sonnet's UI/layout strengths help.

- **Claude Opus 4.7** — Cost multiplier: 15x
  - Strengths: Anthropic's most capable model for complex multi-step coding, agentic workflows, multimodal and diagram reasoning. Highest quality but costly — reserve for highest-stakes work.
  - Vendor page: https://www.anthropic.com/claude/opus
  - Best for: emergency escalation on the most difficult engineering or verification problems when cost is not a blocker.

- **Claude Opus 4.6** — Cost multiplier: 3x
  - Strengths: Strong capability for coding and agentic tasks; sits between Sonnet and Opus 4.7 in capability/cost.

- **Gemini 2.5 Pro** — Cost multiplier: 1x
  - Strengths: Google Gemini's 2.5 Pro is a strong thinking model with long-context and multimodal capabilities; good tooling for research/agentic workflows in Google ecosystem.
  - Vendor page: https://ai.google.dev/gemini-api/docs/models/gemini-2.5-pro
  - Best for: alternative to GPT-5.4 in long-context or Google-first environments, log-heavy triage and research.

---

## Notes, verification & next steps

- Sources used are public vendor pages and announcements (OpenAI, Anthropic, Google). I relied on vendor-published benchmark summaries and capability descriptions; vendor metrics are a helpful guide but not a drop-in truth for every workload.
- If you want definitive ranking for this repository's workloads, I can run a tiny internal micro-benchmark (3 coding prompts, 3 reasoning prompts) across 1–2 models — this requires API keys and will produce more actionable comparisons.
- To adopt these recommendations in the repo: add the chosen model name to each agent frontmatter, and ensure the `SessionCoordinator` enforces cost-aware escalation rules (use Sonnet/GPT-5.4 for medium tasks; Opus only on escalation).

## Implementation: Fallbacks and Escalations

Implementation steps (concise):

1. Add an ordered `models` array to each agent frontmatter (`.github/agents/<agent>.agent.md`). Example frontmatter:

```yaml
name: "TypeScriptImplementer"
models:
  - "GPT-5.3-Codex"
  - "GPT-5.4"
reasoning_depth: "medium"
```

2. Populate `docs/ai/model-selection.md` with per-worker entries containing at minimum:
  - `models` (ordered list)
  - `max_retries` (integer)
  - optional `escalate_on` (list of trigger events)
  - `escalate_to` (ordered list)

Example worker entry:

```yaml
workers:
  TypeScriptImplementer:
    models:
      - GPT-5.3-Codex
      - GPT-5.4
    max_retries: 2
    escalate_on:
      - failed_typecheck
    escalate_to:
      - reasoning_depth: high
      - model: GPT-5.4
        reasoning_depth: high
      - model: human
```

3. Valid forms for entries in `escalate_to` (use only these):
  - `{ reasoning_depth: <low|medium|high> }` — re-invoke current model with specified depth
  - `{ model: "<model-name>", reasoning_depth: <...> }`
  - `{ model: "human" }`

4. (Removed) — commit step removed from these implementer instructions. When implementing the `SessionCoordinator`, load the canonical matrix at runtime from `docs/ai/model-selection.md` and treat it as authoritative for `models`, `max_retries`, `escalate_on`, and `escalate_to`. If the matrix is missing or malformed, fall back to agent defaults (agent frontmatter `models` and `reasoning_depth`).


---

## Rationale & Policy (moved from canonical model-selection)

### Cost assumptions

- Claude Opus 4.6: 3x
- Claude Sonnet 4.6: 1x
- GPT-5.4: 1x
- Gemini 2.5 Pro: 1x
- GPT-5 mini: free tier (lower capability)
- Claude Opus 4.7: 15x (opt-in only)

### Key Decisions

1. Do not use `Claude Opus 4.7` as a default.
2. Do not use `Claude Opus 4.6` as a default.
3. Prefer 1x models for high-value default work.
4. Use `GPT-5 mini` for deterministic procedural tasks.

### Escalation Policy

1. Escalate to `Claude Opus 4.6` only after two failed attempts at default models.
2. Escalate only for high-impact blockers:
  - Architecture invariants still unresolved after specialist retry.
  - Recurring E2E flakes still unresolved after deterministic stabilization retry.
  - CI policy deadlock that blocks required checks.
3. De-escalate back to defaults after blocker resolution.

### Re-Evaluation Triggers

1. Any pricing tier shift greater than 30% for a default model.
2. Any model deprecation or newly available model in the same tier.
3. Repeated quality regressions for a worker over three sessions.
4. Significant tool-support change for a model used by tool-heavy workers.

### Re-Evaluation Procedure

1. Re-run one smoke scenario per worker with current defaults.
2. Compare pass rate, first-pass success, and reroute frequency.
3. Update this document and coordinator policy together.
4. Record rationale in `docs/ai/decision-log.md`.


## Sources

- OpenAI — Introducing GPT‑5.4: https://openai.com/index/introducing-gpt-5-4/
- OpenAI — Introducing GPT‑5.3‑Codex: https://openai.com/index/introducing-gpt-5-3-codex/
- Anthropic — Claude Sonnet: https://www.anthropic.com/claude/sonnet
- Anthropic — Claude Opus: https://www.anthropic.com/claude/opus
- Google — Gemini 2.5 Pro: https://ai.google.dev/gemini-api/docs/models/gemini-2.5-pro
