# Checking Type with type()

Python has a built-in function called `type()` that tells you the data type of a value.

This is useful when you are learning or debugging.

---

## Using type()

```python
print(type("Hello"))
print(type(100))
print(type(3.14))
print(type(True))
```

Output:

```text
<class 'str'>
<class 'int'>
<class 'float'>
<class 'bool'>
```

---

## Checking Variables

You can also check the type of a variable.

```python
name = "Lina"
age = 21
height = 1.68
is_student = True

print(type(name))
print(type(age))
print(type(height))
print(type(is_student))
```

---

## Why type() Is Useful

Sometimes your program may not behave as expected because a value has the wrong type.

For example:

```python
age = "18"
print(type(age))
```

Output:

```text
<class 'str'>
```

Even though `18` looks like a number, it is a string because it is inside quotes.

---

## Quick Practice

Predict the type before running the code:

```python
print(type("2026"))
print(type(2026))
print(type(20.26))
print(type(False))
```

---

## Summary

The `type()` function helps you inspect what kind of value Python is working with. It is especially helpful when debugging beginner mistakes.
