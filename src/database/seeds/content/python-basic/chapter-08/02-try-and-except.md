## Purpose and Use Case

Some failures are predictable, and a good program responds instead of exploding.

`try` is entering a risky room; `except` is the safety plan if the alarm goes off.

## Core Concept

> Use `try` to run code that might fail and `except` to handle a specific exception. This keeps user-facing programs stable.

## Technical Breakdown

- Put only the risky lines inside `try`.
- Catch specific exceptions when possible.
- Use the `except` block to recover, explain, or choose a fallback.
- Do not hide errors you do not understand.

### Concept Summary

| Block | Role | Example |
|---|---|---|
| `try` | Risky action | Convert input |
| `except ValueError` | Recovery | Show helpful message |
| After block | Continue program | Ask again or exit |

### Guided Example

```python
score_text = "85"

try:
    score = int(score_text)
    print("Score:", score)
except ValueError:
    print("Please enter a valid number")
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Avoid bare `except:` because it catches too much.
- **Tip 2:** Keep recovery messages clear for the user.
- **Tip 3:** If the program cannot recover, let the error be visible during development.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Wrap `int("abc")` in `try/except ValueError` and print a friendly message.
- Modify one value in the guided example and predict the new output before executing it.
