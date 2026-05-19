---
name: zustand-persistence-contract-check
description: "Validate persistence contract compatibility for Zustand state shape changes and rehydration behavior."
user-invocable: true
---

# Zustand Persistence Contract Check

Ensure persisted state remains safe across updates.

## Checks

- Backward compatibility of persisted keys
- Rehydration safety for defaults/migrations
- No accidental loss of critical game state

## Output

```text
Persistence Contract: pass | fail
Compatibility Risks:
- <risk>
Migration Need:
- yes | no
```
