## Purpose and Use Case

You cannot build a playlist, lesson queue, or inventory with one variable per item forever.

A list is a train: each item has a position, and you can add or remove cars.

## Core Concept

> A **list** stores ordered values and can be changed. Lists are ideal when order matters and the collection grows or shrinks.

## Technical Breakdown

- Create lists with square brackets.
- Access items by index starting at 0.
- Use `.append()` to add an item.
- Use `.remove()` or `.pop()` to delete items.
- Lists can store mixed types, but consistent types are easier to manage.

### Concept Summary

| Operation | Code | Result |
|---|---|---|
| Create | `lessons = ["Intro", "Loops"]` | Two items |
| Read | `lessons[0]` | First item |
| Add | `lessons.append("Functions")` | Longer list |

### Guided Example

```python
lessons = ["Intro", "Conditions"]
lessons.append("Loops")
print("First lesson:", lessons[0])
print("All lessons:", lessons)
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Index 0 is the first item, not 1.
- **Tip 2:** Use lists for sequences you expect to edit.
- **Tip 3:** Avoid storing unrelated things in one list just because Python allows it.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Create a list of three unlocked badges and add one more badge.
- Modify one value in the guided example and predict the new output before executing it.
