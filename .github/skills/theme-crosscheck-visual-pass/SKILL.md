---
name: theme-crosscheck-visual-pass
description: "Verify layout integrity across supported themes before accepting CSS/layout changes."
user-invocable: true
---

# Theme Crosscheck Visual Pass

Ensure layout stability across supported themes and token sets.

## Required Passes

- Run key surfaces in default theme and one alternate theme
- Confirm spacing, border, contrast, and control prominence remain usable
- Confirm no theme-specific overflow or clipping

## Output

```text
Theme Visual Status: pass | fail
Themes Checked:
- <theme>
Findings:
- <finding>
Required Fixes:
- <fix>
```
