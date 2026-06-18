## Purpose and Use Case

Hardcoded values force you to rewrite the same idea in many places.

A variable is a labeled backpack: you put a value inside and carry it through the program by name.

## Core Concept

> A **variable** gives a name to a value. Good variable names make code easier to read, change, and debug.

## Technical Breakdown

- Use `name = value` to assign data.
- Python variables can point to different values over time.
- Names should describe purpose, not just type.
- Use `snake_case` for normal Python variable names.
- Avoid names that hide built-ins, such as `list` or `str`.

### Concept Summary

| Poor name | Better name | Why |
|---|---|---|
| `x` | `current_stage` | Shows meaning |
| `n` | `user_name` | Readable in output |
| `data` | `quiz_score` | Specific enough |

### Guided Example

```python
user_name = "Mina"
current_stage = 2
quiz_score = 85
print(user_name, "reached stage", current_stage)
print("Quiz score:", quiz_score)
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Rename variables when their meaning becomes clearer.
- **Tip 2:** Use nouns for data: `price`, `score`, `username`.
- **Tip 3:** If a variable name needs a comment to explain it, the name is probably too vague.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Create three variables for a course card: title, lesson count, and difficulty.
- Modify one value in the guided example and predict the new output before executing it.
