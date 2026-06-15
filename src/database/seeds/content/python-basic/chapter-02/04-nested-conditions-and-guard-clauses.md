## Purpose and Use Case

Deeply nested `if`s make code feel like a maze where every turn hides another turn.

A guard clause is a security assessment at the entrance: reject bad cases early so the main path stays clean.

## Core Concept

> **Nested conditions** are conditions inside conditions. **Guard clauses** handle invalid or special cases early to keep the main logic flatter.

## Technical Breakdown

- Nesting is useful when one decision truly depends on another.
- Too much nesting hurts readability.
- A guard clause checks a condition and exits early.
- In beginner scripts, “exit early” can mean printing a message and skipping the rest of the logic.

### Concept Summary

| Style | Shape | Best for |
|---|---|---|
| Nested | Decision inside decision | Dependent rules |
| Guard clause | Handle bad case first | Validation |
| Flat elif | One list of choices | Categories |

### Guided Example

```python
age = 16
has_ticket = True

if age < 13:
    print("Too young for this runtime environment")
elif not has_ticket:
    print("Ticket required")
else:
    print("Enter runtime environment")
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** If your code leans too far right, consider a guard clause.
- **Tip 2:** Name boolean variables clearly: `has_ticket`, `is_admin`.
- **Tip 3:** Validate early, then write the happy path last.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Write access logic that rejects locked users first, then checks whether they have enough XP.
- Modify one value in the guided example and predict the new output before executing it.
