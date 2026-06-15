## Purpose and Use Case

A program becomes useful when it can **react to data**. Without conditions, Python would run the same instructions every time, even when the situation changes.

Use an **if statement** when an action should happen only in a specific case. Examples include unlocking a lesson, showing a warning, applying a discount, or stopping invalid input before it causes damage.

## Core Concept

An **if statement** checks a condition. If the condition is `True`, Python runs the indented block under it; if the condition is `False`, Python skips that block.

## Technical Breakdown

### Basic pattern

```python
score = 85

if score >= 70:
    print("Passed")
```

Python reads this as: **if the score is at least 70, print the message**.

The line after `if` must be indented. That indentation tells Python which instruction belongs to the condition.

### Conditions are yes-or-no checks

Most conditions produce either `True` or `False`.

```python
level = 3

print(level >= 2)   # True
print(level == 5)   # False
```

An `if` statement uses the result of that check to decide whether the block should run.

### A practical example

```python
xp = 120
required_xp = 100

if xp >= required_xp:
    print("Next lesson unlocked")
```

This mirrors a real learning platform: the user earns XP, and the system decides whether the next lesson should become available.

### Common comparison operators

| Operator | Meaning | Example |
|---|---|---|
| `==` | Equal to | `role == "admin"` |
| `>=` | At least | `xp >= 100` |
| `<` | Less than | `attempts < 3` |

Use comparison operators when your program needs to make a decision based on a value.

## Best Practices

- Write conditions that read like simple English.
- Keep the `if` block focused on one clear action.
- Use meaningful variable names such as `required_xp`, not `x`.
- Test the condition with values that should pass and values that should fail.

> **Warning:** Use `==` for comparison. A single `=` is for assignment and cannot be used to check equality inside a condition.

## Concept Summary

**Key idea:** An `if` statement runs a block only when its condition is `True`.

| Part | Purpose |
|---|---|
| `if` | Starts the decision |
| Condition | Produces `True` or `False` |
| Indented block | Runs only when the condition passes |

> **Rule:** Use `if` when your program should take action only under a specific condition.

## Practice Check

- Create a variable `score` and print `"Passed"` only when the score is at least `70`.
- Create a variable `energy` and print `"Rest needed"` only when energy is below `20`.
