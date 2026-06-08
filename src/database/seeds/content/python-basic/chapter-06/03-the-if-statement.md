# The if Statement

An `if` statement runs code only when a condition is true.

---

## Basic Syntax

```python
if condition:
    code_to_run
```

The indented code runs only if the condition is `True`.

---

## Example

```python
age = 18

if age >= 18:
    print("You can register.")
```

Output:

```text
You can register.
```

---

## Indentation Matters

Python uses indentation to know which code belongs to the `if` statement.

Correct:

```python
if True:
    print("This is inside the if block")
```

Incorrect:

```python
if True:
print("This will cause an error")
```

---

## Summary

Use `if` to run code when a condition is true. Remember the colon and indentation.
