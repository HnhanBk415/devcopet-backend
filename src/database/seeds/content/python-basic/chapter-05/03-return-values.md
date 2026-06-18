## Purpose and Use Case

Printing a result is useful for humans, but other code needs to receive the result.

`print()` is shouting the answer; `return` is handing the answer to the next worker.

## Core Concept

> `return` sends a value back to the place where a function was called. A function without `return` gives back `None` by default.

## Technical Breakdown

- Use `return` when the result must be reused.
- Use `print()` when the result only needs to be displayed.
- After `return`, the function stops.
- Store returned values in variables to build larger logic.

### Concept Summary

| Action | Best when | Example |
|---|---|---|
| `print()` | Show to user | Display score |
| `return` | Reuse in code | Calculate final XP |
| Both | Debug temporarily | Return value and print label |

### Guided Example

```python
def add_bonus_xp(base_xp, bonus):
    return base_xp + bonus

final_xp = add_bonus_xp(100, 25)
print("Final XP:", final_xp)
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** If you write a calculator function, it probably should `return`.
- **Tip 2:** Avoid returning and printing everywhere; decide the function’s role.
- **Tip 3:** A missing return often creates confusing `None` values later.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Write `calculate_progress(done, total)` that returns a percentage.
- Modify one value in the guided example and predict the new output before executing it.
