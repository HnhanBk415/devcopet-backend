## Purpose and Use Case

Programs fail for normal reasons: a user enters invalid text, a file is missing, or a network request does not return data. A professional program should not collapse the moment one expected problem appears.

Exceptions are Python’s way of reporting that it cannot continue safely at a specific point. Understanding them helps you separate predictable failure from actual programming mistakes.

## Core Concept

An **exception** is an error event that interrupts normal execution. If it is not handled, Python stops the program and prints a traceback.

## Technical Breakdown

### A simple exception

```python
age = int("twenty")
```

This raises a `ValueError` because the text cannot be converted into an integer.

Python is not being random. It is protecting the program from using invalid data as if it were valid.

### Exceptions are different from false conditions

| Situation | Result | Example |
|---|---|---|
| Condition is false | Program continues | `score >= 70` is `False` |
| Exception occurs | Normal flow stops | `int("abc")` |

A false condition is expected logic. An exception means the operation itself could not be completed safely.

### Reading a traceback

A traceback usually tells you:

- the file where the problem happened,
- the line number,
- the exception type,
- the message explaining the problem.

```text
ValueError: invalid literal for int() with base 10: 'abc'
```

This message means Python tried to parse `'abc'` as an integer and failed.

### Common beginner exceptions

| Exception | Common cause |
|---|---|
| `ValueError` | Invalid conversion, such as `int("abc")` |
| `TypeError` | Operation used with the wrong type |
| `FileNotFoundError` | File path does not exist |

Learning the exception type makes debugging much faster.

## Best Practices

- Read the last line of the traceback first.
- Fix the cause, not just the visible error message.
- Do not catch every exception blindly.
- Treat exceptions as signals that your program needs a safer path.

> **Warning:** An exception is not always bad. It often tells you exactly where your program needs better handling.

## Concept Summary

**Key idea:** Exceptions report operations that Python cannot complete safely.

| Signal | Meaning |
|---|---|
| `False` condition | Logic did not pass |
| Exception | Operation failed |
| Traceback | Debugging report |

> **Rule:** Read the exception type and message before changing code.

## Practice Check

- Run `int("abc")` and identify the exception type.
- Create a list with two items and try to access index `5`; read the traceback carefully.
