# The if elif else Statement

Use `elif` when you need to check more than two possibilities.

`elif` means "else if".

---

## Basic Syntax

```python
if condition1:
    code1
elif condition2:
    code2
else:
    code3
```

---

## Example

```python
score = 75

if score >= 90:
    print("Excellent")
elif score >= 60:
    print("Passed")
else:
    print("Try again")
```

Output:

```text
Passed
```

---

## Order Matters

Python checks conditions from top to bottom. Once one condition is true, the rest are skipped.

```python
score = 95

if score >= 60:
    print("Passed")
elif score >= 90:
    print("Excellent")
```

This prints `Passed`, not `Excellent`, because the first condition is already true.

---

## Summary

Use `elif` to handle multiple conditions. Put more specific conditions before more general ones when needed.
