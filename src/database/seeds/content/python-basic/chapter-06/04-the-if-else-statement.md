# The if else Statement

An `if else` statement lets your program choose between two paths.

---

## Basic Syntax

```python
if condition:
    code_if_true
else:
    code_if_false
```

---

## Example

```python
age = 16

if age >= 18:
    print("Adult")
else:
    print("Not adult yet")
```

Output:

```text
Not adult yet
```

---

## When to Use else

Use `else` when you want a fallback action if the condition is false.

```python
password = "abc123"

if password == "abc123":
    print("Login successful")
else:
    print("Wrong password")
```

---

## Summary

`if else` helps your program choose between two possible outcomes.
