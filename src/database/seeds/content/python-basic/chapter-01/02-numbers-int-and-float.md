## Purpose and Use Case

A shop checkout, XP system, or progress bar breaks quickly if numbers are treated like text.

`int` is a whole coin count; `float` is a measurement on a ruler.

## Core Concept

> Python uses **int** for whole numbers and **float** for decimal numbers. Choose the type that matches the real-world meaning of the value.

## Technical Breakdown

- Use `int` for counts: lessons, attempts, coins.
- Use `float` for measurements: rating, price, percentage.
- Operations between ints can produce floats when division is involved.
- Floating-point numbers are approximate, so avoid using them for exact money logic in serious systems.

### Concept Summary

| Type | Best for | Example |
|---|---|---|
| `int` | Countable items | `lessons_done = 4` |
| `float` | Measurements / ratios | `progress = 62.5` |
| `str` | Text that looks numeric | `student_id = "007"` |

### Guided Example

```python
lessons_done = 4
total_lessons = 10
progress = lessons_done / total_lessons * 100
print("Progress:", progress, "%")
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** If you count objects, start with `int`.
- **Tip 2:** If you divide, expect a `float`.
- **Tip 3:** Do not convert to `int` just to hide decimals; understand why the decimal exists.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Calculate the percentage for 7 completed lessons out of 20.
- Modify one value in the guided example and predict the new output before executing it.
