## Purpose and Use Case

Programs meet reality: missing files, bad input, zero division, and unexpected data.

An exception is the smoke alarm of your program: annoying, but it tells you something needs attention.

## Core Concept

> An **exception** is Python’s way of saying it cannot continue normally. Understanding exceptions turns crashes into useful debugging signals.

## Technical Breakdown

- Exceptions have types, such as `ValueError` or `FileNotFoundError`.
- The traceback shows where the problem happened.
- Different exceptions point to different kinds of mistakes.
- Not every exception should be hidden; some should be fixed.

### Concept Summary

| Exception | Typical cause | Example |
|---|---|---|
| `ValueError` | Bad conversion | `int("abc")` |
| `ZeroDivisionError` | Divide by zero | `10 / 0` |
| `FileNotFoundError` | Missing file | Open absent file |

### Guided Example

```python
score_text = "eighty"
score = int(score_text)
print(score)
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Read the exception type before changing code.
- **Tip 2:** Tracebacks are maps, not insults.
- **Tip 3:** Fix predictable problems; handle unavoidable problems.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Run the code above and identify the exception type.
- Modify one value in the guided example and predict the new output before executing it.
