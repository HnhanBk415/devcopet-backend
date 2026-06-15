## Purpose and Use Case

If data disappears every time your program stops, your app has no memory.

A file is a notebook; `with open()` opens it, lets you read or write, then closes it safely.

## Core Concept

> Use `with open(...)` to work with files safely. The `with` block automatically closes the file when the work is done.

## Technical Breakdown

- Choose a path to the file.
- Choose a mode: read, write, or append.
- Use the file object inside the indented block.
- When the block ends, Python closes the file.

### Concept Summary

| Mode | Meaning | Danger |
|---|---|---|
| `"r"` | Read existing file | Fails if missing |
| `"w"` | Write new content | Overwrites existing file |
| `"a"` | Append content | Adds to end |

### Guided Example

```python
with open("notes.txt", "w") as file:
    file.write("First saved note\n")

print("File saved")
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Use `with open()` instead of manually closing files.
- **Tip 2:** Be careful with `"w"`; it replaces existing content.
- **Tip 3:** Start with simple `.txt` files before CSV or JSON.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Create a file called `progress.txt` and write one line into it.
- Modify one value in the guided example and predict the new output before executing it.
