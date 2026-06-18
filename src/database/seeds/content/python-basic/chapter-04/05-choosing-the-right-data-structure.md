## Purpose and Use Case

The wrong data structure makes simple code feel like pushing a door that says pull.

Data structures are containers: pick the box that matches how you will use the data.

## Core Concept

> Choose a structure based on the operations you need: order, lookup, uniqueness, or fixed grouping. Good choices make code shorter and safer.

## Technical Breakdown

- Use a list when order and editing matter.
- Use a tuple when values belong together and should not change.
- Use a dictionary when values need names.
- Use a set when uniqueness or membership is the main goal.

### Concept Summary

| Question | Best choice | Example |
|---|---|---|
| Need ordered editable items? | List | Lesson queue |
| Need fixed pair/record? | Tuple | Map coordinate |
| Need named fields? | Dictionary | User profile |
| Need no duplicates? | Set | Unlocked badges |

### Guided Example

```python
profile = {"name": "Ana", "badges": {"python", "loops"}}
profile["badges"].add("python")
profile["badges"].add("functions")
print(profile)
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Ask “How will I read this later?” before choosing.
- **Tip 2:** Do not use dictionaries for everything; lists and sets are often cleaner.
- **Tip 3:** Combine structures when needed, like a list of dictionaries.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Decide the best structure for: leaderboard scores, unique tags, and fixed RGB color.
- Modify one value in the guided example and predict the new output before executing it.
