## Purpose and Use Case

Small projects reveal whether syntax is just memorized or actually usable.

This assistant is a small NPC: it welcomes the user, shows status, and makes the console feel alive.

## Core Concept

> Combine variables, comments, and `print()` to create a clear greeting flow. The goal is not complexity; the goal is readable communication.

## Technical Breakdown

- Store repeated values such as name, role, and starting XP in variables.
- Print a welcome message with labels.
- Add one comment explaining the purpose of the task.
- Keep each output line focused so the terminal feels organized.

### Concept Summary

| Requirement | Example | Why it matters |
|---|---|---|
| Greeting | `Welcome, Kai` | Feels personal |
| Status | `Starting XP: 0` | Shows state |
| Next step | `Open Chapter 1` | Guides action |

### Guided Example

```python
user_name = "Kai"
starting_xp = 0

# First console message shown to a new learner.
print("Welcome to DevCopet,", user_name)
print("Starting XP:", starting_xp)
print("Task: Complete Chapter 0")
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Project lessons should be small but complete.
- **Tip 2:** Use variable names that sound like data in the product: `user_name`, `starting_xp`.
- **Tip 3:** Run after every small change.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Add one more variable called `pet_name` and include it in the greeting.
- Modify one value in the guided example and predict the new output before executing it.
