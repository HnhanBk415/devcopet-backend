## Purpose and Use Case

Saved data is only useful if your program can load it back correctly.

Reading a file is opening a quest log: you can read the whole page or scan line by line.

## Core Concept

> Use `.read()` for the whole file and `.readlines()` or a file loop for lines. Choose based on how much control you need.

## Technical Breakdown

- `.read()` returns one string containing everything.
- Looping over the file reads one line at a time.
- Lines often include newline characters.
- Use `.strip()` to clean line endings when needed.

### Concept Summary

| Method | Returns | Best for |
|---|---|---|
| `.read()` | One string | Small notes |
| `.readlines()` | List of lines | Line processing |
| `for line in file` | One line per loop | Memory-friendly reading |

### Guided Example

```python
with open("progress.txt", "r") as file:
    for line in file:
        print("Saved:", line.strip())
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Use line-by-line reading for logs or lists.
- **Tip 2:** Strip newline characters before comparing text.
- **Tip 3:** Handle missing files later with exceptions.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Read `progress.txt` and print each line with a `>` prefix.
- Modify one value in the guided example and predict the new output before executing it.
