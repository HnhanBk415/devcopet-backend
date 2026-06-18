## Purpose and Use Case

Some function inputs are common enough that callers should not repeat them every time.

A default argument is the restaurant’s standard option unless the customer asks for something else.

## Core Concept

> A **default argument** gives a parameter a fallback value. It makes simple calls short while still allowing customization.

## Technical Breakdown

- Default values appear in the function definition.
- Put required parameters before default parameters.
- Defaults should represent the most common safe behavior.
- Avoid mutable defaults like `[]` for now because they can surprise beginners.

### Concept Summary

| Call | Meaning | Result |
|---|---|---|
| `badge("Ana")` | Use default role | Learner badge |
| `badge("Kai", "Mentor")` | Override role | Mentor badge |
| `badge()` | Missing required name | Error |

### Guided Example

```python
def make_badge(name, role="Learner"):
    return name + " - " + role

print(make_badge("Ana"))
print(make_badge("Kai", "Mentor"))
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Use defaults to reduce noise, not to hide important choices.
- **Tip 2:** Keep default values simple: strings, numbers, booleans, `None`.
- **Tip 3:** A clean function call should read almost like English.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Create `start_quiz(title, attempts=3)` and print a launch message.
- Modify one value in the guided example and predict the new output before executing it.
