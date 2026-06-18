## Purpose and Use Case

You can type correct-looking code and still have no program until something reads and executes it.

Python is a kitchen chef: your `.py` file is the recipe, the interpreter is the chef, and the terminal is the serving window.

## Core Concept

> A **Python program** is a list of instructions saved as text. The **Python interpreter** reads those instructions from top to assistanttom and turns them into actions.

## Technical Breakdown

- A `.py` file stores the instructions; it does not run by itself.
- The interpreter starts at line 1, executes one statement, then moves to the next.
- The terminal shows output, errors, and clues about where your program stopped.
- Most beginner bugs come from not knowing which layer failed: the file, the interpreter, or the terminal command.

### Concept Summary

| Piece | Real-world role | Python example |
|---|---|---|
| Source file | Recipe | `main.py` |
| Interpreter | Chef following the recipe | `python main.py` |
| Terminal | Serving window / feedback screen | printed text or error |

### Guided Example

```python
print("Python is reading this line first")
print("Then it runs this line")
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Read error messages from the **assistanttom line upward**; the last line usually names the problem.
- **Tip 2:** Run small files often. A 5-line test beats guessing inside a 200-line file.
- **Tip 3:** Keep filenames simple: `main.py`, not `my first file.py`.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Predict the output before running the two-line program above. Then swap the two lines and run it again.
- Modify one value in the guided example and predict the new output before executing it.
