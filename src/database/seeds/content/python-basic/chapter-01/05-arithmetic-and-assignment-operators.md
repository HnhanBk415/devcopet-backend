## Purpose and Use Case

Every application economy, score counter, and progress bar needs reliable value changes.

Operators are control buttons for data: add, subtract, multiply, compare, and update.

## Core Concept

> **Arithmetic operators** calculate new numbers. **Assignment operators** update a variable using a shorter, readable form.

## Technical Breakdown

- Use `+`, `-`, `*`, `/` for basic math.
- Use `//` for floor division, `%` for remainder, and `**` for powers.
- Use `+=`, `-=`, `*=` when updating the same variable.
- Readable calculations beat clever one-liners.

### Concept Summary

| Operator | Meaning | Example |
|---|---|---|
| `+` | Add | `xp + 50` |
| `%` | Remainder | `stage % 2` |
| `+=` | Increase variable | `coins += 1` |

### Guided Example

```python
coins = 10
reward = 5
coins += reward
shop_price = 3
print("After reward:", coins)
print("After buying:", coins - shop_price)
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Use `+= 1` for counters.
- **Tip 2:** Use `%` to check even/odd or cycles.
- **Tip 3:** Do not mix too many operations in one line while learning.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Start with `xp = 100`, add 25, then print whether xp is at least 120.
- Modify one value in the guided example and predict the new output before executing it.
