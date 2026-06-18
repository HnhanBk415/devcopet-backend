## Purpose and Use Case

Sometimes bad data should be stopped immediately before it poisons the rest of the program.

Raising an error is a controlled explosion: stop now, loudly, before silent damage spreads.

## Core Concept

> Use `raise` to intentionally create an exception. This is useful when a function receives invalid data it cannot safely handle.

## Technical Breakdown

- Validate inputs at the start of a function.
- Raise a clear exception type such as `ValueError`.
- Include a message that explains the rule.
- Callers can catch the exception if they know how to recover.

### Concept Summary

| Invalid case | Error to raise | Reason |
|---|---|---|
| Negative age | `ValueError` | Age rule broken |
| Missing file | `FileNotFoundError` | Resource absent |
| Wrong type | `TypeError` | Input shape wrong |

### Guided Example

```python
def set_stage(stage):
    if stage < 1:
        raise ValueError("stage must be at least 1")
    print("Stage set to", stage)

set_stage(3)
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Raise errors for impossible or unsafe states.
- **Tip 2:** Error messages should help the next developer fix the call.
- **Tip 3:** Do not use errors for normal choices like “user clicked cancel.”

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Write a function that raises `ValueError` if `score` is below 0 or above 100.
- Modify one value in the guided example and predict the new output before executing it.
