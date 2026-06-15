## Purpose and Use Case

When you know how many times something should repeat, typing the same line is a waste of developer energy.

`range()` gives your loop numbered task tickets, one ticket per repetition.

## Core Concept

> A **for loop** repeats over a sequence. `range()` creates a sequence of numbers commonly used for counting.

## Technical Breakdown

- `range(5)` gives 0 through 4.
- `range(1, 6)` gives 1 through 5.
- The loop variable changes each round.
- Use `for` when the repeat count is known or sequence-based.

### Concept Summary

| Code | Numbers produced | Common use |
|---|---|---|
| `range(3)` | 0, 1, 2 | Repeat 3 times |
| `range(1, 4)` | 1, 2, 3 | Human-friendly count |
| `range(2, 9, 2)` | 2, 4, 6, 8 | Step by 2 |

### Guided Example

```python
for lesson_number in range(1, 6):
    print("Unlock lesson", lesson_number)
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Remember the stop value is not included.
- **Tip 2:** Use meaningful loop variable names: `lesson_number`, not always `i`.
- **Tip 3:** If you only need repetition, `_` is acceptable: `for _ in range(3)`.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Print “Combo hit 1” through “Combo hit 5”.
- Modify one value in the guided example and predict the new output before executing it.
