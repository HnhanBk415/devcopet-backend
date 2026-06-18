## Purpose and Use Case

Lists are awkward when you need to find data by name instead of position.

A dictionary is a locker system: each key opens exactly one stored value.

## Core Concept

> A **dictionary** stores key-value pairs. It is perfect for named properties like user stats, settings, and course metadata.

## Technical Breakdown

- Create dictionaries with `{}`.
- Access values with `dict[key]`.
- Use `.get()` when a key might be missing.
- Keys should be unique and usually strings.
- Dictionaries make structured data easy to read.

### Concept Summary

| Need | Use | Example |
|---|---|---|
| Player name | Key | `profile["name"]` |
| XP count | Value | `1200` |
| Missing-safe access | `.get()` | `profile.get("rank")` |

### Guided Example

```python
profile = {
    "name": "Ana",
    "stage": 4,
    "xp": 820
}

print(profile["name"])
print("Rank:", profile.get("rank", "Unranked"))
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Use dictionaries when labels matter more than order.
- **Tip 2:** Prefer `.get()` for optional data.
- **Tip 3:** Keep keys consistent: do not mix `"userName"` and `"username"`.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Create a course dictionary with title, difficulty, and lessons.
- Modify one value in the guided example and predict the new output before executing it.
