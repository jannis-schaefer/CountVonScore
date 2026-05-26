---
name: mobile-interaction-safety-check
description: "Validate touch usability, safe-area behavior, and orientation transitions for layout changes."
user-invocable: true
---

# Mobile Interaction Safety Check

Validate that layout changes remain usable on mobile interactions.

## Checks

- Tap targets are comfortably usable (target >= 44x44 CSS px where practical)
- Core controls remain on-screen in portrait and landscape
- Safe-area insets are respected near edges/notches
- Orientation transitions do not overlap or hide controls

## Output

```text
Mobile Safety: pass | fail
Findings:
- <finding>
Required Fixes:
- <fix>
```
