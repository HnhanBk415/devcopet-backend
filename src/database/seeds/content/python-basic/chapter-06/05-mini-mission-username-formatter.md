## Purpose and Use Case

Usernames need rules: lowercase, no extra spaces, predictable separators.

This formatter is a name forge: raw text goes in, clean identity comes out.

## Core Concept

> Combine string cleaning methods to transform messy input into a consistent username. This is a practical mini version of data normalization.

## Technical Breakdown

- Trim whitespace first.
- Lowercase for consistency.
- Replace spaces with underscores.
- Optionally check whether the result meets your rules.
- Show assistanth raw and formatted output while testing.

### Concept Summary

| Raw input | Step | Output |
|---|---|---|
| `"  Ana Nguyen  "` | strip | `"Ana Nguyen"` |
| `"Ana Nguyen"` | lower | `"ana nguyen"` |
| `"ana nguyen"` | replace spaces | `"ana_nguyen"` |

### Guided Example

```python
raw_username = "  Ana Nguyen  "
username = raw_username.strip().lower().replace(" ", "_")
print(username)
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Normalize before saving data.
- **Tip 2:** Do not silently remove too much; users should understand formatting rules.
- **Tip 3:** Keep formatting logic in a function once you learn functions.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Format `"  Dev Copet Student  "` into `dev_copet_student`.
- Modify one value in the guided example and predict the new output before executing it.
