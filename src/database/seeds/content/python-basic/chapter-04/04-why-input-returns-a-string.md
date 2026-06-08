# Why input() Returns a String

In Python, `input()` always returns a string.

This is true even if the user types a number.

---

## Example

```python
age = input("Enter your age: ")
print(type(age))
```

If the user types `18`, the output is still:

```text
<class 'str'>
```

That means `age` is text, not a number.

---

## Why This Matters

This code will not work as expected:

```python
age = input("Enter your age: ")
print(age + 1)
```

Python cannot add a string and an integer together.

---

## Strings Can Look Like Numbers

```python
value = "100"
```

This looks like a number, but it is a string because it is inside quotes.

To use it in math, you must convert it.

---

## Correct Approach

```python
age = input("Enter your age: ")
age = int(age)

print(age + 1)
```

If the user enters `18`, the output is:

```text
19
```

---

## Summary

`input()` always gives you a string. If you need a number, convert the input using `int()` or `float()`.
