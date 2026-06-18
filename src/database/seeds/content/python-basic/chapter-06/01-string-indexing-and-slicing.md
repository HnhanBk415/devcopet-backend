## Purpose and Use Case

Real text work often means extracting only the useful part: initials, prefixes, IDs, or file extensions.

Indexing is pointing at one character; slicing is cutting a strip from a long ribbon.

## Core Concept

> Strings are ordered sequences of characters. **Indexing** gets one character, while **slicing** gets a range of characters.

## Technical Breakdown

- Indexing starts at 0.
- Negative indexes count from the end.
- Slices use `start:stop`, and stop is not included.
- Omitting start or stop means “from the beginning” or “to the end.”

### Concept Summary

| Expression | Meaning | Example result for `python` |
|---|---|---|
| `text[0]` | First char | `p` |
| `text[-1]` | Last char | `n` |
| `text[0:3]` | First 3 chars | `pyt` |

### Guided Example

```python
username = "python_ninja"
print(username[0])
print(username[-1])
print(username[:6])
print(username[7:])
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Stop index is excluded; this is the source of many off-by-one mistakes.
- **Tip 2:** Use slicing for simple extraction before reaching for complex tools.
- **Tip 3:** Do not modify strings by index; strings are immutable. Create a new string instead.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Given `course = "python-basics"`, print only `python`.
- Modify one value in the guided example and predict the new output before executing it.
