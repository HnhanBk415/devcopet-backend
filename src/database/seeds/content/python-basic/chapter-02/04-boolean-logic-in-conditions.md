## Purpose and Use Case

A single condition is often not enough. Real rules usually combine several checks, such as age, role, progress, and account status.

Boolean logic lets you express those rules clearly. It helps your program avoid granting access, submitting data, or showing actions at the wrong time.

## Core Concept

Python uses `and`, `or`, and `not` to combine or reverse conditions. These operators still produce one final result: `True` or `False`.

## Technical Breakdown

### Using and

`and` requires every condition to be true.

```python
is_logged_in = True
has_finished_intro = True

if is_logged_in and has_finished_intro:
    print("Dashboard unlocked")
```

Use `and` when all requirements must be satisfied.

### Using or

`or` requires at least one condition to be true.

```python
role = "mentor"

if role == "admin" or role == "mentor":
    print("Can review submissions")
```

Use `or` when several roles or states are acceptable.

### Using not

`not` reverses a boolean value.

```python
is_locked = False

if not is_locked:
    print("Lesson can be opened")
```

Use `not` when the positive action depends on something being false.

### Operator comparison

| Operator | Meaning | Example |
|---|---|---|
| `and` | All conditions must pass | `xp >= 100 and active` |
| `or` | At least one condition must pass | `role == "admin" or role == "mentor"` |
| `not` | Reverse the condition | `not is_locked` |

### Keep complex conditions readable

```python
has_access = is_logged_in and not is_locked and xp >= 100

if has_access:
    print("Access granted")
```

A named boolean variable can make a long rule easier to understand.

## Best Practices

- Use named boolean variables for complex rules.
- Prefer positive names such as `is_active` over confusing names such as `not_inactive`.
- Add parentheses when grouping makes the rule easier to read.
- Test each part of a compound condition separately before combining it.

> **Warning:** A condition that is technically correct can still be unreadable. Readability is part of correctness.

## Concept Summary

**Key idea:** Boolean logic combines smaller checks into one decision.

| Operator | Use when |
|---|---|
| `and` | Every rule must pass |
| `or` | One acceptable rule is enough |
| `not` | You need the opposite value |

> **Rule:** If a condition becomes hard to read, name the rule with a clear boolean variable.

## Practice Check

- Create a condition that unlocks a page only when a user is logged in and not locked.
- Create a condition that allows access for either an admin or a mentor.
