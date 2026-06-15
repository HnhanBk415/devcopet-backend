## Purpose and Use Case

Copy-pasting the same logic turns one bug into five bugs.

A function is a vending machine: give it a name, press the button, and it performs the same action reliably.

## Core Concept

> A **function** packages a block of code under a reusable name. You define it with `def`, then call it when you need the behavior.

## Technical Breakdown

- Definition stores the recipe; calling runs the recipe.
- The body must be indented.
- Functions reduce repetition and make intent visible.
- Start with functions when you notice the same steps appearing twice.

### Concept Summary

| Part | Example | Role |
|---|---|---|
| Name | `show_welcome` | What action means |
| Body | Indented print lines | Steps to run |
| Call | `show_welcome()` | Executes the function |

### Guided Example

```python
def show_welcome():
    print("Welcome to DevCopet")
    print("Choose your next task")

show_welcome()
show_welcome()
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Name functions with verbs: `calculate_score`, `format_name`.
- **Tip 2:** Keep one function focused on one job.
- **Tip 3:** If a function is hard to name, it may be doing too many things.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Write a function that prints a three-line lesson summary.
- Modify one value in the guided example and predict the new output before executing it.
