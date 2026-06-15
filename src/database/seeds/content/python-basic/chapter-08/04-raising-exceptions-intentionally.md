## Purpose and Use Case

Sometimes bad data should not be corrected silently. If a function receives an impossible value, continuing can create a harder bug later.

Raising an exception lets your code reject invalid input immediately. This makes failure clear, early, and easier to debug.

## Core Concept

Use `raise` to intentionally trigger an exception. This is useful when your function cannot do its job safely with the data it received.

## Technical Breakdown

### Basic pattern

```python
def set_level(level):
    if level < 1:
        raise ValueError("level must be at least 1")
    return level
```

The function refuses invalid data instead of pretending it is acceptable.

### Why raising can be better than returning a fallback

```python
def calculate_discount(percent):
    if percent < 0 or percent > 100:
        raise ValueError("discount percent must be between 0 and 100")
    return percent / 100
```

A discount outside the valid range is not a normal alternative. It is invalid input.

### Fallback versus exception

| Situation | Better choice | Reason |
|---|---|---|
| Missing optional nickname | Fallback value | Program can continue normally |
| Invalid account balance | Raise exception | Data is unsafe |
| Empty search result | Fallback value | It is a valid outcome |

Use exceptions for invalid states, not for every inconvenience.

### Raising with a useful message

```python
def unlock_lesson(progress):
    if progress < 0:
        raise ValueError("progress cannot be negative")
    if progress > 100:
        raise ValueError("progress cannot exceed 100")
    return progress == 100
```

A clear message makes debugging faster for the next developer.

## Best Practices

- Raise exceptions when input violates the rules of the function.
- Use a specific exception type such as `ValueError`.
- Write messages that explain what was wrong and what was expected.
- Do not raise exceptions for ordinary user choices that can be handled normally.

> **Warning:** A vague error message is almost as bad as no error message.

## Concept Summary

**Key idea:** `raise` stops unsafe work when a function receives invalid data.

| Tool | Use for |
|---|---|
| Return value | Normal result |
| Fallback | Acceptable missing value |
| `raise` | Invalid or unsafe input |

> **Rule:** Raise an exception when continuing would make the program less correct.

## Practice Check

- Write a function `set_age(age)` that raises `ValueError` if age is negative.
- Write a function `set_progress(progress)` that only accepts values from `0` to `100`.
