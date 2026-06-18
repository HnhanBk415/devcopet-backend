## Purpose and Use Case

Programs need more than numbers: names, flags, and missing values are everywhere.

A string is a label, a boolean is a switch, and `None` is an empty slot.

## Core Concept

> A **string** stores text, a **boolean** stores `True` or `False`, and **None** represents no value yet. These types make program state readable.

## Technical Breakdown

- Strings use quotes and preserve characters.
- Booleans power decisions: logged in or not, passed or failed.
- `None` is useful when a value will exist later but does not exist now.
- Do not confuse an empty string `""` with `None`; one is text with length zero, the other is absence.

### Concept Summary

| Value | Meaning | Use case |
|---|---|---|
| `"Python"` | Text | Course title |
| `True` | Yes / enabled | Quiz passed |
| `None` | No value yet | No mentor assigned |

### Guided Example

```python
course_title = "Python Basics"
is_unlocked = True
mentor_name = None
print(course_title)
print("Unlocked:", is_unlocked)
print("Mentor:", mentor_name)
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Use booleans for questions that can be answered yes/no.
- **Tip 2:** Use `None` for “not available yet,” not for failure by default.
- **Tip 3:** Make boolean names read like questions: `is_active`, `has_access`.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Create `has_completed_quiz` and print a status message using it.
- Modify one value in the guided example and predict the new output before executing it.
