## Purpose and Use Case

Some failures are predictable. User input may not be numeric, a file may not exist, or a value may be missing from external data.

`try` and `except` let you handle those expected failures instead of letting the whole program crash. This is essential when the program should guide the user back to a valid path.

## Core Concept

Put risky code inside `try`. Put the recovery behavior inside `except`.

## Technical Breakdown

### Basic pattern

```python
try:
    age = int("twenty")
except ValueError:
    print("Please enter a valid number")
```

Python tries to run the conversion. If a `ValueError` occurs, Python jumps to the matching `except` block.

### Catch specific exceptions

```python
text = "42"

try:
    number = int(text)
    print(number * 2)
except ValueError:
    print("Input must be a number")
```

This handles one known risk: invalid conversion.

### Avoid broad exception handling

```python
# Avoid this for normal application code
try:
    result = int(text)
except Exception:
    print("Something went wrong")
```

Catching `Exception` hides useful debugging information. It can make real bugs look like normal user mistakes.

### A practical input parser

```python
def parse_points(text):
    try:
        return int(text)
    except ValueError:
        return 0

points = parse_points("80")
print(points)
```

This function turns valid numeric text into an integer and uses `0` as a safe fallback.

## Best Practices

- Catch the most specific exception you can.
- Keep the `try` block small so the risky operation is obvious.
- Use `except` for recovery, not for hiding bugs.
- Include a useful fallback or message.

> **Warning:** A large `try` block makes it hard to know which line actually failed.

## Concept Summary

**Key idea:** `try/except` handles expected failure without stopping the entire program.

| Part | Purpose |
|---|---|
| `try` | Runs risky code |
| `except` | Handles a matching exception |
| Specific exception | Keeps the handler precise |

> **Rule:** Catch the error you expect, not every possible error.

## Practice Check

- Write a function that converts text to an integer and returns `0` when conversion fails.
- Test it with `"50"`, `"abc"`, and `""`.
