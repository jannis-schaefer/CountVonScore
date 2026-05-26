---
name: advanced-layout-pattern-selector
description: "Select robust CSS layout patterns (grid/flex/container queries/logical properties) for complex UI requests."
user-invocable: true
---

# Advanced Layout Pattern Selector

Choose the least fragile layout strategy for the requested behavior.

## Selection Heuristics

- Use CSS Grid for 2D placement and symmetric card orchestration.
- Use Flexbox for 1D distribution and control bars.
- Use container queries for component-scoped responsiveness.
- Use logical properties for writing-mode and direction safety.
- Use clamp-based sizing for smooth, bounded scale.

## Constraints

- Preserve existing DOM semantics unless markup change is explicitly required.
- Avoid hard-coded pixel values when fluid sizing is expected.
- Minimize selector specificity and avoid !important by default.

## Output

```text
Selected Pattern:
- <pattern>
Why:
- <reason>
Rejected Alternatives:
- <alternative + reason>
Implementation Notes:
- <note>
```
