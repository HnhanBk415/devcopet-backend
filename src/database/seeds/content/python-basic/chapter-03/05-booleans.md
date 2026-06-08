# Booleans

A boolean is a value that can only be `True` or `False`. Booleans are important because programs often need to make decisions based on whether something is true.

---

## Learning Goals

By the end of this lesson, you should be able to:

- Booleans are `True` or `False`.
- Comparison expressions produce booleans.
- Booleans are used to make decisions in programs.

---

## 1. Boolean values

Python uses capital `T` and capital `F`: `True` and `False`. These are not strings, so they do not use quotes.

```python
is_online = True
is_finished = False
print(is_online)
print(is_finished)
```

Output:

```text
True
False
```

---

## 2. Comparisons create booleans

Comparison expressions such as `>` and `==` produce boolean results.

```python
age = 18
print(age >= 18)
print(age == 16)
```

Output:

```text
True
False
```

---

## 3. Booleans help control flow

Later, you will use booleans with `if` statements to decide which code should run.

```python
has_ticket = True
if has_ticket:
    print("You can enter.")
```

Output:

```text
You can enter.
```

---

## Mini Practice

1. Create a boolean variable called `is_learning`.
2. Compare two numbers and print the result.
3. Write a simple `if` statement that uses a boolean variable.

---

## Summary

- Booleans are `True` or `False`.
- Comparison expressions produce booleans.
- Booleans are used to make decisions in programs.

Next, you will learn how to check a value's type with `type()`.
