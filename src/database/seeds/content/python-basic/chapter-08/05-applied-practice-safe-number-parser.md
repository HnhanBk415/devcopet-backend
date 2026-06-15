## Purpose and Use Case

User input often arrives as text, even when the program needs a number. If the text is invalid, direct conversion can crash the program.

A safe number parser converts valid text and handles invalid text predictably. This pattern appears in forms, dashboards, CSV imports, and command-line tools.

## Core Concept

A safe parser wraps risky conversion in `try/except`. It returns a useful result for valid input and a controlled fallback or message for invalid input.

## Technical Breakdown

### Start with the risky operation

```python
number = int("42")
```

This works for numeric text. It fails for text such as `"forty-two"`.

### Add exception handling

```python
def parse_int(text):
    try:
        return int(text)
    except ValueError:
        return None
```

Returning `None` makes failure explicit. The caller can decide what to do next.

### Use the parser in a program

```python
raw_score = "85"
score = parse_int(raw_score)

if score is None:
    print("Score must be a number")
else:
    print("Score saved:", score)
```

The conversion and the user-facing message are separated. This keeps the parser reusable.

### Improve the rule

```python
def parse_positive_int(text):
    try:
        number = int(text)
    except ValueError:
        return None

    if number < 0:
        return None

    return number
```

Now the parser rejects both invalid text and invalid numeric values.

### Choosing a failure value

| Failure result | Best for | Example |
|---|---|---|
| `None` | Caller decides response | Form validation |
| `0` | Safe numeric fallback | Optional points |
| Exception | Invalid state must stop | Payment amount |

The right choice depends on how serious the failure is.

## Best Practices

- Keep parsing logic separate from display logic.
- Return `None` when the caller needs to know parsing failed.
- Do not use `0` as a fallback if zero is a meaningful real value.
- Test valid input, invalid text, empty text, and negative numbers.

> **Rule:** A safe parser should make failure visible without crashing the program.

## Concept Summary

**Key idea:** A safe number parser converts valid text and handles invalid text deliberately.

| Step | Action | Result |
|---|---|---|
| 1 | Try conversion | `int(text)` |
| 2 | Catch failure | `except ValueError` |
| 3 | Return clear result | Number or `None` |

> **Rule:** Do not let invalid input crash a feature that can recover gracefully.

## Practice Check

- Write `parse_int(text)` that returns an integer or `None`.
- Write `parse_positive_int(text)` that rejects invalid text and negative numbers.
