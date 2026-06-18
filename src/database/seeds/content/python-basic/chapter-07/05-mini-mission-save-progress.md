## Purpose and Use Case

Learners expect progress to survive refreshes, restarts, and tomorrow morning.

This task builds a save crystal: write progress now, read it back later.

## Core Concept

> Combine file writing and reading to save simple progress data. The task proves that your program can remember something outside memory.

## Technical Breakdown

- Choose a simple file name.
- Write progress lines in a predictable format.
- Read the file back and display it cleanly.
- Use append mode for history or write mode for latest-only save.

### Concept Summary

| Save style | Mode | Use case |
|---|---|---|
| Latest only | `"w"` | Current stage |
| History | `"a"` | Attempt log |
| Review | `"r"` | Show saved progress |

### Guided Example

```python
with open("save.txt", "w") as file:
    file.write("stage=3\n")
    file.write("xp=450\n")

with open("save.txt", "r") as file:
    print(file.read())
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Keep save formats simple at first.
- **Tip 2:** Read your own saved file immediately to verify it.
- **Tip 3:** Do not store secrets in plain text files.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Save a pet name and current XP, then read assistanth lines back.
- Modify one value in the guided example and predict the new output before executing it.
