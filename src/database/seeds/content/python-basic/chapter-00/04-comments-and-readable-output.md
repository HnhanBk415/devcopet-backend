## Purpose and Use Case

Future you will forget why today-you wrote a clever line of code.

Comments are sticky notes on your code; output labels are signboards for your terminal.

## Core Concept

> A **comment** explains code for humans and is ignored by Python. Readable output makes terminal results understandable without opening the source file.

## Technical Breakdown

- Use `#` for a short note on one line.
- Write comments to explain **why**, not to repeat obvious code.
- Readable output uses labels, spacing, and consistent wording.
- Bad comments rot quickly when code changes, so keep them close to the logic they explain.

### Concept Summary

| Weak comment | Better comment | Reason |
|---|---|---|
| `# add 1` | `# move to next lesson` | Explains intent |
| `# print score` | `# show final result to learner` | Adds context |
| `# variable` | `# remaining attempts before lockout` | Names purpose |

### Guided Example

```python
attempts_left = 2
# Show the learner how many tries remain before the quiz locks.
print("Attempts left:", attempts_left)
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Delete comments that only translate syntax.
- **Tip 2:** Use output labels when printing more than one value.
- **Tip 3:** A good comment saves mental energy; a bad comment becomes another bug.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Rewrite `print(75)` so the terminal tells the user what the number means.
- Modify one value in the guided example and predict the new output before executing it.
