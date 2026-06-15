## Purpose and Use Case

Apps constantly ask questions about text: does an email contain `@`, does a filename end with `.py`, does a command start with `/`?

String checks are scanners at the entrance of your program.

## Core Concept

> Python can search and validate strings with operators and methods such as `in`, `.startswith()`, and `.endswith()`. These checks return booleans.

## Technical Breakdown

- Use `in` for substring membership.
- Use `.startswith()` for command prefixes.
- Use `.endswith()` for file extensions.
- Use `.isdigit()` for simple numeric text checks.
- Combine checks with conditions to create validation logic.

### Concept Summary

| Check | Code | Use case |
|---|---|---|
| Contains | `"@" in email` | Basic email check |
| Prefix | `cmd.startswith("/")` | Chat command |
| Suffix | `file.endswith(".py")` | Python file |

### Guided Example

```python
filename = "main.py"
command = "/start"

print(filename.endswith(".py"))
print(command.startswith("/"))
print("ai" in "training")
```

### Implementation Steps

1. **Predict** what each line should do before running it.
2. **Run** the code and compare the terminal output with your prediction.
3. **Change one value** and run again.
4. **Explain the result** in one concise sentence.

## Best Practices

- **Tip 1:** String checks are not full validation systems, but they catch simple cases fast.
- **Tip 2:** Normalize casing before checks if uppercase/lowercase should not matter.
- **Tip 3:** Name boolean results clearly: `is_python_file`.

> **Common mistake:** Avoid copying code mechanically. Before running it, predict what should happen; after running it, explain why it happened.

## Practice Check

- Check whether `username` starts with `dev_` and print a message.
- Modify one value in the guided example and predict the new output before executing it.
