## Purpose and Use Case

Real decisions usually have a fallback. If a user has enough XP, unlock the next lesson; otherwise, show what is still required.

An **else block** gives your program a clear alternative path. It prevents silent behavior where nothing happens and the user does not know why.

## Core Concept

`else` runs when the `if` condition is `False`. It does not need its own condition because it represents the default path.

## Technical Breakdown

### Basic pattern

```python
score = 62

if score >= 70:
    print("Passed")
else:
    print("Try again")
```

Python checks the `if` condition first. If it fails, Python runs the `else` block.

### When else is useful

Use `else` when there are exactly two outcomes.

| Situation | if path | else path |
|---|---|---|
| Login | Access granted | Access denied |
| Quiz score | Passed | Retry needed |
| Stock check | Item available | Sold out |

This makes the decision complete. The reader can see what happens in both cases.

### A practical example

```python
required_level = 5
current_level = 3

if current_level >= required_level:
    print("Arena unlocked")
else:
    print("Reach level 5 to unlock the arena")
```

The fallback message is not just decoration. It explains the next action the user should take.

### Avoid duplicated checks

Do not write the opposite condition manually when `else` already covers it.

```python
# Less clean
if score >= 70:
    print("Passed")
if score < 70:
    print("Try again")

# Cleaner
if score >= 70:
    print("Passed")
else:
    print("Try again")
```

The second version is easier to maintain because the two outcomes are connected.

## Best Practices

- Use `else` when there is one clear fallback.
- Make the fallback helpful, not vague.
- Avoid repeating the opposite condition unless it improves clarity.
- Keep both branches at the same level of detail.

> **Rule:** If the user cannot proceed, the `else` branch should explain why and what to do next.

## Concept Summary

**Key idea:** `else` defines what happens when the `if` condition does not pass.

| Branch | Runs when |
|---|---|
| `if` | The condition is `True` |
| `else` | The condition is `False` |

> **Rule:** Use `else` to make a two-path decision complete and readable.

## Practice Check

- Write a program that prints `"Unlocked"` if `xp >= 100`, otherwise prints `"Need more XP"`.
- Write a program that checks whether `password_length >= 8` and prints a helpful message for both outcomes.
