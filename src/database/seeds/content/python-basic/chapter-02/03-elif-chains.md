## Purpose and Use Case

Many real features have more than two outcomes. A quiz score may be excellent, passing, close, or failing.

An **elif chain** lets your program choose one result from several possible branches. It keeps multi-outcome decisions in one readable structure.

## Core Concept

`elif` means “else if.” Python checks each condition from top to bottom and runs the first matching branch.

## Technical Breakdown

### Basic pattern

```python
score = 86

if score >= 90:
    print("Excellent")
elif score >= 70:
    print("Passed")
else:
    print("Review required")
```

The order matters. Once Python finds a `True` branch, it skips the rest of the chain.

### Why order matters

```python
score = 95

if score >= 70:
    print("Passed")
elif score >= 90:
    print("Excellent")
```

This prints `Passed`, not `Excellent`, because `score >= 70` is checked first. The more specific condition should usually come before the broader one.

### A practical ranking example

```python
xp = 740

if xp >= 1000:
    rank = "Master"
elif xp >= 500:
    rank = "Advanced"
elif xp >= 100:
    rank = "Apprentice"
else:
    rank = "Beginner"

print(rank)
```

This pattern is common in learning platforms, games, dashboards, and user status systems.

### Comparing approaches

| Approach | Best for | Example |
|---|---|---|
| `if` | One optional action | Show warning |
| `if/else` | Two outcomes | Pass or fail |
| `if/elif/else` | Several outcomes | Rank levels |

Choose the structure based on the number of meaningful outcomes.

## Best Practices

- Place the most specific checks before broader checks.
- Use `else` as the final fallback when every other condition fails.
- Avoid very long `elif` chains if a dictionary or function would be clearer.
- Test boundary values such as `69`, `70`, `89`, and `90`.

> **Warning:** The first matching branch wins. A correct condition in the wrong order can still produce the wrong result.

## Concept Summary

**Key idea:** `elif` handles multiple outcomes by checking conditions in order.

| Structure | Number of outcomes |
|---|---|
| `if` | One optional outcome |
| `if/else` | Two outcomes |
| `if/elif/else` | Three or more outcomes |

> **Rule:** In an `elif` chain, put the most specific condition before the more general one.

## Practice Check

- Create a `score` variable and print `Excellent`, `Passed`, or `Review required`.
- Change the score to boundary values and confirm each branch behaves correctly.
