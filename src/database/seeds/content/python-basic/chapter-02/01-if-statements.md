## Purpose and Use Case

Programs that cannot make decisions are just calculators with no survival instinct.

An `if` statement is a gate: it opens only when the condition is true.

## Core Concept

> An **if statement** runs a block of code only when a condition evaluates to `True`. It is the basic building block of decision-making.

## Technical Breakdown

- The condition must produce a boolean-like result.
- The controlled block must be indented.
- If the condition is false, Python skips the block.
- Use comparisons like `>=`, `==`, and `<` to create conditions.

### Concept Summary

| Condition | Meaning | Block runs? |
|---|---|---|
| `score >= 70` | Passed quiz | Yes if score is 70+ |
| `is_locked` | Content locked | Yes if True |
| `name == "Ana"` | Exact match | Yes only for Ana |

### Guided Example

```python
score = 82

if score >= 70:
    print("Quiz passed")
    print("Next lesson unlocked")
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Use `==` for comparison, not `=`.
- **Tip 2:** Keep conditions readable; store complex checks in well-named variables.
- **Tip 3:** Indentation is not decoration in Python; it defines the block.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Write an `if` that prints “Boss unlocked” only when `stage` is at least 5.
- Modify one value in the guided example and predict the new output before executing it.
