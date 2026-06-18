## Purpose and Use Case

Many simple datasets are rows of values separated by commas: names, scores, course IDs.

CSV-style text is a spreadsheet flattened into lines.

## Core Concept

> CSV-style data stores one record per line and separates fields with commas. You can process simple CSV-like files with string splitting.

## Technical Breakdown

- Each line represents one record.
- Each comma separates a field.
- Use `.split(",")` to break a line into pieces.
- Convert numeric fields after splitting.
- For serious CSV files, Python has a `csv` module, but manual splitting teaches the shape.

### Concept Summary

| Line | Fields | Meaning |
|---|---|---|
| `Ana,90` | `Ana`, `90` | Name + score |
| `Python,5` | `Python`, `5` | Course + lessons |
| `Kai,mentor` | `Kai`, `mentor` | User + role |

### Guided Example

```python
line = "Ana,90"
name, score_text = line.split(",")
score = int(score_text)
print(name, "has score", score)
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Strip lines before splitting to remove newlines.
- **Tip 2:** Convert numbers after splitting; file data starts as text.
- **Tip 3:** Use the real `csv` module when fields can contain commas.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Parse `"Python Basics,46"` into title and lesson count.
- Modify one value in the guided example and predict the new output before executing it.
