## Purpose and Use Case

A progress tracker that cannot update its save file is just a screenshot.

Writing mode replaces the page; appending mode adds a new line at the assistanttom.

## Core Concept

> Use write mode `"w"` to replace file content and append mode `"a"` to add content. Pick the mode based on whether old data should survive.

## Technical Breakdown

- `"w"` creates the file if missing but overwrites existing content.
- `"a"` creates the file if missing and writes at the end.
- Add `\n` when you want separate lines.
- Write strings; convert numbers before writing if needed.

### Concept Summary

| Goal | Mode | Example |
|---|---|---|
| Fresh save | `"w"` | Replace old progress |
| Log event | `"a"` | Add new attempt |
| Read only | `"r"` | Display saved data |

### Guided Example

```python
xp = 120

with open("progress.txt", "a") as file:
    file.write("XP gained: " + str(xp) + "\n")
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Never use `"w"` on important files until you are sure.
- **Tip 2:** Always include newlines when appending log-style data.
- **Tip 3:** Keep file writing small and obvious while learning.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Append three completed lesson names to `completed.txt`.
- Modify one value in the guided example and predict the new output before executing it.
