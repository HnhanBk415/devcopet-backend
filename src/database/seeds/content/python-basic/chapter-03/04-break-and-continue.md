## Purpose and Use Case

Sometimes a loop should stop early, or skip one bad item without cancelling the whole task.

`break` is pulling the emergency brake; `continue` is stepping around a puddle and moving on.

## Core Concept

> `break` exits the loop immediately. `continue` skips the rest of the current round and moves to the next one.

## Technical Breakdown

- Use `break` when the job is finished or impossible.
- Use `continue` when one item should be ignored.
- Both make loops more expressive but can also hide flow if overused.
- Add clear conditions so the jump is easy to understand.

### Concept Summary

| Keyword | Effect | Use case |
|---|---|---|
| `break` | Stop loop | Found target user |
| `continue` | Skip current item | Ignore invalid score |
| Neither | Normal flow | Process every item |

### Guided Example

```python
scores = [80, -1, 95, 100]

for score in scores:
    if score < 0:
        continue
    if score == 100:
        print("Perfect score found")
        break
    print("Valid score:", score)
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Use `continue` to keep the main logic less indented.
- **Tip 2:** Use `break` when later items no longer matter.
- **Tip 3:** Do not use jumps to avoid thinking through the loop condition.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Loop through names and stop when you find your own name.
- Modify one value in the guided example and predict the new output before executing it.
