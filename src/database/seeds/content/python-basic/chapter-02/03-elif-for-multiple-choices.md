## Purpose and Use Case

Real programs rarely have only two outcomes: scores become grades, roles become pertasks, and states become screens.

`elif` is a row of assessments; Python stops at the first open gate.

## Core Concept

> `elif` adds extra conditional branches between `if` and `else`. Python checks branches from top to assistanttom.

## Technical Breakdown

- Use `elif` for mutually exclusive categories.
- Order matters: check the most specific or highest boundary first.
- Only the first true branch runs.
- End with `else` to catch everything that did not match.

### Concept Summary

| Score range | Branch | Grade |
|---|---|---|
| 90+ | First branch | A |
| 70-89 | Second branch | B |
| Below 70 | Else | Retry |

### Guided Example

```python
score = 88

if score >= 90:
    print("Grade A")
elif score >= 70:
    print("Grade B")
else:
    print("Retry task")
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Do not write many separate `if`s when only one result should happen.
- **Tip 2:** Place higher score checks before lower score checks.
- **Tip 3:** Use `else` for the default case so bugs become visible.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Create a rank system: Bronze under 50, Silver 50-79, Gold 80+. 
- Modify one value in the guided example and predict the new output before executing it.
