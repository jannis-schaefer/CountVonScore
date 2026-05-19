---
name: gate-blocker-policy
description: "Apply hard blocker policy for required quality gates and prevent completion when mandatory verification is missing."
user-invocable: true
---

# Gate Blocker Policy

Enforce completion blocking based on quality gates.

## Blockers

- Any required gate failed
- Any required gate not run when runnable
- Unverified status presented as complete

## Output

```text
Blocker Status: blocked | clear
Reasons:
- <reason>
Allowed Next Actions:
- <action>
```
