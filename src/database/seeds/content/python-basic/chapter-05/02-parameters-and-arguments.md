## Purpose and Use Case

A function with hardcoded values can only solve one version of a problem.

Parameters are empty order forms; arguments are the actual order you send in.

## Core Concept

> A **parameter** is the name listed in a function definition. An **argument** is the real value passed during a function call.

## Technical Breakdown

- Parameters make functions flexible.
- Arguments fill those parameters when the function runs.
- Order matters for positional arguments.
- Good parameter names explain what the function needs.

### Concept Summary

| Term | Where it appears | Example |
|---|---|---|
| Parameter | Function definition | `name` in `def greet(name)` |
| Argument | Function call | `"Ana"` in `greet("Ana")` |
| Return / output | Function result or print | Greeting message |

### Guided Example

```python
def greet_user(name, stage):
    print("Welcome", name)
    print("Current stage:", stage)

greet_user("Ana", 4)
greet_user("Minh", 2)
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** Do not pass everything into every function; pass only what the job needs.
- **Tip 2:** Use 2-3 parameters max for beginner functions.
- **Tip 3:** When calls get confusing, use keyword arguments: `greet_user(name="Ana", stage=4)`.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Create `show_course(title, lessons)` and call it with two different courses.
- Modify one value in the guided example and predict the new output before executing it.
