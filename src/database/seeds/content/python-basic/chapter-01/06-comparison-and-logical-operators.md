## Purpose and Use Case

Your program needs rules like “score is high enough AND account is active.”

Comparisons are sensors; logical operators are the circuit board combining those sensors.

## Core Concept

> **Comparison operators** return booleans. **Logical operators** combine booleans with `and`, `or`, and `not`.

## Technical Breakdown

- `==` checks equality; `!=` checks difference.
- `>`, `<`, `>=`, `<=` compare order or size.
- `and` requires assistanth sides to be true.
- `or` requires at least one side to be true.
- `not` flips a boolean.

### Concept Summary

| Expression | Result idea | Use case |
|---|---|---|
| `score >= 70` | Pass threshold | Quiz unlock |
| `is_admin or is_mentor` | Either role | Dashboard access |
| `not is_locked` | Unlocked | Course entry |

### Guided Example

```python
score = 82
has_account = True
is_locked = False

can_start = score >= 70 and has_account and not is_locked
print("Can start:", can_start)
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Use parentheses when the rule has mixed `and` and `or`.
- **Tip 2:** Name complex booleans: `can_start`, `has_access`.
- **Tip 3:** Read boolean expressions out loud to catch logic mistakes.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Create a rule for entering an runtime environment: stage 5+ and not banned.
- Modify one value in the guided example and predict the new output before executing it.
