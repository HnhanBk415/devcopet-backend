## Purpose and Use Case

A decision without an alternative leaves the user wondering what happened.

`else` is the other door in a two-door hallway.

## Core Concept

> `else` runs when the `if` condition is false. It gives your program a clear fallback path.

## Technical Breakdown

- Use `else` when exactly one of two paths should happen.
- The `else` line has no condition.
- Both `if` and `else` blocks must be indented.
- A good `else` explains the failed path, not just silence.

### Concept Summary

| Score | Path | Message |
|---|---|---|
| 85 | `if score >= 70` | Passed |
| 52 | `else` | Try again |
| 70 | `if` | Passed because boundary included |

### Guided Example

```python
score = 52

if score >= 70:
    print("Passed")
else:
    print("Not yet. Review and retry.")
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Use clear boundary values: should 70 pass or fail?
- **Tip 2:** Make failure messages helpful, not vague.
- **Tip 3:** Do not write `else score < 70:`; use `elif` if you need another condition.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Create a login check that prints either “Access granted” or “Access denied”.
- Modify one value in the guided example and predict the new output before executing it.
