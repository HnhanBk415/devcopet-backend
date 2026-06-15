## Purpose and Use Case

Most useful data comes in groups: courses, scores, usernames, and inventory items.

Looping through a collection is checking every item in a backpack one by one.

## Core Concept

> A `for` loop can visit each item in a collection such as a list, tuple, set, or dictionary. This lets one block of code handle many values.

## Technical Breakdown

- Looping over a list gives each item.
- Looping over a dictionary gives keys by default.
- Use `.items()` when you need assistanth key and value.
- Keep the loop body focused on one operation per item.

### Concept Summary

| Collection | Loop gives | Example use |
|---|---|---|
| List | Each value | Print lesson titles |
| Dictionary | Keys | Look up user stats |
| `.items()` | Key and value | Print stat name + value |

### Guided Example

```python
scores = {"Ana": 90, "Minh": 76, "Kai": 88}

for name, score in scores.items():
    print(name, "scored", score)
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Name the single item clearly: `for course in courses`.
- **Tip 2:** Use `.items()` for dictionaries when displaying pairs.
- **Tip 3:** Avoid changing a collection heavily while looping over it as a beginner.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Loop through a list of three course names and print each with “available”.
- Modify one value in the guided example and predict the new output before executing it.
