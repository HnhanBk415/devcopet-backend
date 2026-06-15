## Purpose and Use Case

Some tasks repeat until a condition changes: retrying passwords, counting attempts, or waiting for enough XP.

A `while` loop is a treadmill: it keeps moving while the condition stays true.

## Core Concept

> A **while loop** repeats a block as long as its condition is `True`. You must update something inside the loop or it may never stop.

## Technical Breakdown

- Use `while` when you do not know the exact number of repeats ahead of time.
- Create a condition that can eventually become false.
- Update the variable that controls the condition.
- Print progress while learning so infinite loops are easier to spot.

### Concept Summary

| Part | Example | Purpose |
|---|---|---|
| Start value | `attempts = 0` | Initial state |
| Condition | `attempts < 3` | Keep looping |
| Update | `attempts += 1` | Move toward stop |

### Guided Example

```python
attempts = 0

while attempts < 3:
    print("Attempt", attempts + 1)
    attempts += 1

print("Loop finished")
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** If the terminal keeps printing forever, stop the program and check the update line.
- **Tip 2:** Use `while` for “until something happens.”
- **Tip 3:** Use small limits while testing.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Write a loop that counts energy from 0 to 5.
- Modify one value in the guided example and predict the new output before executing it.
