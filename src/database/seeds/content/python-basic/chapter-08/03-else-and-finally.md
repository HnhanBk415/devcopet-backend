## Purpose and Use Case

Handling errors is only one part of reliable code. You may also need to run success-only logic or cleanup code no matter what happened.

`else` and `finally` make exception handling more precise. They separate successful work from recovery work and cleanup work.

## Core Concept

In a `try` statement, `else` runs only if no exception occurs. `finally` runs whether an exception occurred or not.

## Technical Breakdown

### try, except, else

```python
try:
    score = int("95")
except ValueError:
    print("Invalid score")
else:
    print("Score saved:", score)
```

The `else` block runs only after the risky operation succeeds.

### finally always runs

```python
try:
    file = open("progress.txt")
    content = file.read()
except FileNotFoundError:
    print("Progress file not found")
finally:
    print("Read attempt finished")
```

The `finally` block is useful for cleanup, logging, or releasing resources.

### How the blocks behave

| Block | Runs when | Purpose |
|---|---|---|
| `try` | First | Attempt risky work |
| `except` | Error occurs | Recover from failure |
| `else` | No error occurs | Run success-only code |
| `finally` | Always | Cleanup or final step |

### A realistic pattern

```python
def load_points(text):
    try:
        points = int(text)
    except ValueError:
        print("Invalid points")
        return 0
    else:
        print("Points loaded")
        return points
    finally:
        print("Validation complete")
```

This structure keeps each responsibility separate.

## Best Practices

- Use `else` when success logic should not be inside `try`.
- Use `finally` for cleanup that must always happen.
- Do not put complex business logic in `finally`.
- Keep each block focused on one purpose.

> **Rule:** Use `else` for success and `finally` for cleanup.

## Concept Summary

**Key idea:** `else` and `finally` make exception handling easier to organize.

| Block | Main job |
|---|---|
| `except` | Handle failure |
| `else` | Handle success |
| `finally` | Always run cleanup |

> **Rule:** If code should run only after success, put it in `else`, not `finally`.

## Practice Check

- Write a `try/except/else` block that converts text to an integer and prints success only when conversion works.
- Add a `finally` block that prints `"Done"` every time.
