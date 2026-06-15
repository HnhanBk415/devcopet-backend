## Purpose and Use Case

User input is messy: extra spaces, random casing, and inconsistent formatting.

String methods are grooming tools for text: trim, reshape, and standardize before using it.

## Core Concept

> String methods are built-in actions you call with dot syntax. They return new strings instead of changing the original string.

## Technical Breakdown

- `.strip()` removes outer whitespace.
- `.lower()` and `.upper()` normalize casing.
- `.replace()` swaps text.
- `.title()` formats words for display.
- Because strings are immutable, store the returned result if you need it later.

### Concept Summary

| Method | Use | Example |
|---|---|---|
| `.strip()` | Clean spaces | `" Ana ".strip()` |
| `.lower()` | Compare safely | `"YES".lower()` |
| `.replace()` | Swap text | `"a-b".replace("-", " ")` |

### Guided Example

```python
raw_name = "  aNA nGUYEN  "
clean_name = raw_name.strip().title()
print(clean_name)
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Normalize before comparing user input.
- **Tip 2:** Chain methods when each step clearly follows the previous one.
- **Tip 3:** Do not expect methods to edit the original variable unless you reassign it.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Clean `"  PYTHON basics  "` into `Python Basics`.
- Modify one value in the guided example and predict the new output before executing it.
