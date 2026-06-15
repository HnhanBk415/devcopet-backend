## Purpose and Use Case

When every part of a program can touch every variable, debugging becomes a crime scene with too many suspects.

Scope is room access: local variables live inside one room; global variables are posted in the hallway.

## Core Concept

> **Scope** controls where a variable can be used. Variables created inside a function are usually **local** to that function.

## Technical Breakdown

- Local variables exist during the function call.
- Outside code cannot directly use a local variable.
- Global variables can be read in many places but should be changed carefully.
- Passing data through parameters is cleaner than relying on global state.

### Concept Summary

| Variable location | Visible where? | Good use |
|---|---|---|
| Inside function | Function body only | Temporary calculation |
| Outside function | Whole module | Constants / configuration |
| Parameter | Inside function | Input data |

### Guided Example

```python
bonus = 10

def calculate_xp(base):
    total = base + bonus
    return total

print(calculate_xp(90))
# print(total)  # This would fail: total is local.
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Prefer local variables until you truly need shared state.
- **Tip 2:** Return values instead of editing globals.
- **Tip 3:** If a variable seems to “disappear,” check which scope created it.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Create a function with a local variable, then explain why it cannot be printed outside.
- Modify one value in the guided example and predict the new output before executing it.
