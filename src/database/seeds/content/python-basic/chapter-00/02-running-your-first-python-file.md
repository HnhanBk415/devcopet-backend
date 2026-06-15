## Purpose and Use Case

A program must be saved and executed before it can produce observable output.

Saving records the latest source code; running sends that code to the Python interpreter.

## Core Concept

> To run Python code, save it in a `.py` file and ask the interpreter to execute that file. If you edit the file, **save before running again**.

## Technical Breakdown

- Create a file such as `main.py`.
- Write a small visible action, usually a `print()` call.
- Open a terminal in the same folder.
- Run `python main.py` or `python3 main.py`, depending on your setup.
- If the output looks old, your file was probably not saved.

### Concept Summary

| Step | Command / action | What should happen |
|---|---|---|
| Write | `print("Hello")` | Code exists in editor |
| Save | Cmd+S / Ctrl+S | Disk has latest version |
| Run | `python main.py` | Terminal prints output |

### Guided Example

```python
# main.py
print("Program started")
print("Python is running this file")
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Always check the terminal path with `pwd` if Python says the file does not exist.
- **Tip 2:** Use one file while learning basics. Multiple files too early add noise.
- **Tip 3:** Make output obvious so you know which version ran.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Update the displayed message, save the file, and verify that the terminal reflects the latest version.
- Modify one value in the guided example and predict the new output before executing it.
