## Purpose and Use Case

Every real app has gates: course locks, admin panels, payment walls, and quiz attempts.

You are building a dungeon door that checks stage, key, and status before opening.

## Core Concept

> Combine `if`, `elif`, `else`, comparisons, and booleans to create a readable access decision. The task is to make every outcome explicit.

## Technical Breakdown

- Define the rules before writing code.
- Check invalid states first, such as banned or locked users.
- Then check requirements such as stage or key.
- End with a clear success message.

### Concept Summary

| Rule | Condition | Output |
|---|---|---|
| Banned user | `is_banned` | Blocked |
| No key | `not has_key` | Find key |
| Low stage | `stage < 5` | Train more |
| All good | Else | Enter |

### Guided Example

```python
stage = 6
has_key = True
is_banned = False

if is_banned:
    print("Access blocked")
elif not has_key:
    print("Find the key first")
elif stage < 5:
    print("Train more before entering")
else:
    print("Gate opened")
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Rules should read from most blocking to most successful.
- **Tip 2:** Avoid mixing messages and calculations in one messy condition.
- **Tip 3:** Test boundary values: stage 4, 5, and 6.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Add a `has_completed_tutorial` rule before allowing entry.
- Modify one value in the guided example and predict the new output before executing it.
