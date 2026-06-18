## Purpose and Use Case

Sometimes you need code that runs only on success, and cleanup that runs no matter what.

`else` is the victory animation; `finally` is cleaning the runtime environment after every match.

## Core Concept

> In exception handling, `else` runs when no exception happens. `finally` runs whether an exception happened or not.

## Technical Breakdown

- Use `else` for success-only logic.
- Use `finally` for cleanup or final messages.
- Keep risky code in `try`, not in `else`.
- With files, `with open()` often handles cleanup better than `finally`.

### Concept Summary

| Block | Runs when | Typical use |
|---|---|---|
| `try` | Always attempted | Risky operation |
| `except` | Matching error | Recovery |
| `else` | No error | Success path |
| `finally` | Always | Cleanup |

### Guided Example

```python
text = "42"

try:
    number = int(text)
except ValueError:
    print("Invalid number")
else:
    print("Double:", number * 2)
finally:
    print("Parsing attempt finished")
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Use `else` to keep success code separate from risky code.
- **Tip 2:** Do not put too much logic in `finally`; it should be predictable.
- **Tip 3:** For beginners, `try/except` is enough most of the time; add `else/finally` when the flow is clearer.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Create a parse attempt that prints “success” only when conversion works.
- Modify one value in the guided example and predict the new output before executing it.
