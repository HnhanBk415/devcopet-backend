## Purpose and Use Case

Some grouped data should travel together but not be accidentally edited.

A tuple is a sealed ID card: its fields belong together and should stay stable.

## Core Concept

> A **tuple** is an ordered collection that cannot be changed after creation. Use it for fixed records or pairs.

## Technical Breakdown

- Create tuples with parentheses or commas.
- Read items by index.
- Tuples are immutable, so methods like `.append()` do not exist.
- They are useful for coordinates, RGB colors, or fixed return values.

### Concept Summary

| Feature | List | Tuple |
|---|---|---|
| Can change? | Yes | No |
| Syntax | `[1, 2]` | `(1, 2)` |
| Best for | Editable sequence | Fixed record |

### Guided Example

```python
spawn_point = (10, 25)
x = spawn_point[0]
y = spawn_point[1]
print("Spawn at", x, y)
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Use tuples when changing the values would be a bug.
- **Tip 2:** A one-item tuple needs a comma: `(5,)`.
- **Tip 3:** For named fields, dictionaries can be clearer than long tuples.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Create a tuple for an RGB color and print the red value.
- Modify one value in the guided example and predict the new output before executing it.
