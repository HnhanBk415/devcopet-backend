## Purpose and Use Case

User input always arrives as text, and users will eventually type something unexpected.

A safe parser is a assessment guard: valid numbers pass, suspicious input gets a clear response.

## Core Concept

> Build a function that tries to convert text into a number and handles failure gracefully. This is a small version of real input validation.

## Technical Breakdown

- Receive text as input.
- Try converting it with `int()`.
- Return or print the number if conversion works.
- Handle `ValueError` with a useful message.
- Test with valid text, invalid text, and empty text.

### Concept Summary

| Input | Expected result | Why |
|---|---|---|
| `"42"` | Number 42 | Valid integer |
| `"abc"` | Error message | Not numeric |
| `""` | Error message | Empty input |

### Guided Example

```python
def parse_stage(text):
    try:
        return int(text)
    except ValueError:
        print("Stage must be a whole number")
        return None

stage = parse_stage("7")
print("Parsed stage:", stage)
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Return `None` when parsing fails and the caller can decide what to do next.
- **Tip 2:** Never assume user input is valid.
- **Tip 3:** Test the failure path on purpose, not only the happy path.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Modify the parser so it rejects numbers less than 1.
- Modify one value in the guided example and predict the new output before executing it.
