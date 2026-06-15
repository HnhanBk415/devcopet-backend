## Purpose and Use Case

Data often arrives as one long string, but your program needs pieces.

`split()` cuts a sentence into cards; `join()` stacks cards back into one line.

## Core Concept

> `.split()` breaks a string into a list. `.join()` combines a list of strings into one string.

## Technical Breakdown

- By default, `.split()` separates on whitespace.
- Pass a delimiter such as `","` for CSV-style text.
- `join()` is called on the separator string.
- Every item passed to `join()` must already be a string.

### Concept Summary

| Task | Code | Result |
|---|---|---|
| Words | `text.split()` | List of words |
| CSV | `line.split(",")` | List of fields |
| Combine | `", ".join(items)` | One formatted string |

### Guided Example

```python
line = "Ana,90,Python"
parts = line.split(",")
name = parts[0]
score = parts[1]
print(name, "scored", score)
print(" | ".join(parts))
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Choose the delimiter that actually exists in the data.
- **Tip 2:** Strip pieces after splitting if the original text has spaces.
- **Tip 3:** Use `join()` instead of manual repeated `+` for lists of text.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Turn `"python loops functions"` into a list, then join it with `" -> "`.
- Modify one value in the guided example and predict the new output before executing it.
