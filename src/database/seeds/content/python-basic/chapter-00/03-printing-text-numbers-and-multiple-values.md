## Purpose and Use Case

When your program is invisible, debugging feels like walking through a dark room.

`print()` is your flashlight: it reveals what the program is thinking at a specific moment.

## Core Concept

> `print()` sends values to the terminal. It can print text, numbers, calculations, and several values separated by commas.

## Technical Breakdown

- Text must be inside quotes: `"hello"`.
- Numbers can be printed directly: `print(42)`.
- Commas insert spaces between values automatically.
- Printing a calculation shows the result, not the formula text.
- Use clear labels so output explains itself.

### Concept Summary

| Goal | Code | Output |
|---|---|---|
| Text | `print("XP")` | `XP` |
| Number | `print(100)` | `100` |
| Multiple values | `print("XP:", 100)` | `XP: 100` |

### Guided Example

```python
stage = 3
xp = 150
print("Stage:", stage)
print("XP after quest:", xp + 50)
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Do not wrap variables in quotes if you want their value. `print("xp")` prints the word, not the variable.
- **Tip 2:** Use labels like `print("score:", score)` instead of printing raw numbers.
- **Tip 3:** Remove noisy debug prints after the bug is fixed.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Create variables `name` and `coins`, then print one sentence showing assistanth values.
- Modify one value in the guided example and predict the new output before executing it.
